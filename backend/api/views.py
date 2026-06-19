from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import TourPackage, Booking, Message
from .serializers import UserSerializer, RegisterSerializer, TourPackageSerializer, BookingSerializer, MessageSerializer

User = get_user_model()

# Custom Permissions
class IsProvider(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'provider'

class IsCustomer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'customer'

class IsPackageOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and obj.provider == request.user

# Views
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class TourPackageViewSet(viewsets.ModelViewSet):
    queryset = TourPackage.objects.all().order_by('-created_at')
    serializer_class = TourPackageSerializer

    def get_permissions(self):
        if self.action in ['create']:
            permission_classes = [permissions.IsAuthenticated, IsProvider]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsPackageOwnerOrReadOnly]
        else:
            permission_classes = [permissions.AllowAny]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save(provider=self.request.user)

    def get_queryset(self):
        queryset = TourPackage.objects.all().order_by('-created_at')
        
        # Filtering parameters
        search = self.request.query_params.get('search', None)
        destination = self.request.query_params.get('destination', None)
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        duration = self.request.query_params.get('duration', None)
        activities = self.request.query_params.get('activities', None)
        provider_only = self.request.query_params.get('provider_only', None)

        if provider_only == 'true' and self.request.user.is_authenticated:
            queryset = queryset.filter(provider=self.request.user)

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(description__icontains=search) | 
                Q(destination__icontains=search)
            )
        
        if destination:
            queryset = queryset.filter(destination__icontains=destination)
            
        if min_price:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except ValueError:
                pass
                
        if max_price:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except ValueError:
                pass
                
        if duration:
            try:
                queryset = queryset.filter(duration_days=int(duration))
            except ValueError:
                pass
                
        if activities:
            query_acts = [act.strip().lower() for act in activities.split(',') if act.strip()]
            if query_acts:
                q_object = Q()
                for act in query_acts:
                    q_object |= Q(activities__icontains=act)
                queryset = queryset.filter(q_object)

        return queryset

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'provider':
            return Booking.objects.filter(package__provider=user).order_by('-booking_date')
        else:
            return Booking.objects.filter(customer=user).order_by('-booking_date')

    def create(self, request, *args, **kwargs):
        if request.user.role != 'customer':
            return Response(
                {"error": "Only customers can book tour packages."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        package_id = request.data.get('package')
        try:
            package = TourPackage.objects.get(id=package_id)
        except TourPackage.DoesNotExist:
            return Response(
                {"error": "Tour package not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        slots = int(request.data.get('slots', 1))
        travel_date = request.data.get('travel_date')
        
        if not travel_date:
            return Response(
                {"error": "Travel date is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        total_price = package.price * slots

        booking = Booking.objects.create(
            customer=request.user,
            package=package,
            travel_date=travel_date,
            slots=slots,
            total_price=total_price,
            status='pending'
        )

        serializer = self.get_serializer(booking)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        booking = self.get_object()
        new_status = request.data.get('status')

        if not new_status or new_status not in ['confirmed', 'cancelled']:
            return Response(
                {"error": "Invalid or missing status. Allowed values are 'confirmed' or 'cancelled'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = request.user
        if user.role == 'customer':
            if booking.customer != user:
                return Response(
                    {"error": "You do not have permission to modify this booking."},
                    status=status.HTTP_403_FORBIDDEN
                )
            if new_status != 'cancelled':
                return Response(
                    {"error": "Customers can only cancel their bookings."},
                    status=status.HTTP_403_FORBIDDEN
                )
            booking.status = 'cancelled'
            booking.save()
            return Response(self.get_serializer(booking).data)

        elif user.role == 'provider':
            if booking.package.provider != user:
                return Response(
                    {"error": "You do not have permission to modify bookings for this package."},
                    status=status.HTTP_403_FORBIDDEN
                )
            booking.status = new_status
            booking.save()
            return Response(self.get_serializer(booking).data)

        return Response(
            {"error": "Unauthorized role action."},
            status=status.HTTP_403_FORBIDDEN
        )


class MessageViewSet(viewsets.ModelViewSet):
    """
    Messages are scoped to a booking. Both the booking's customer and the
    package provider can read and write messages for that booking.
    """
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']

    def _get_booking_and_check_access(self, booking_id):
        """Return booking if the requesting user is customer or provider of that booking."""
        try:
            booking = Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            return None, Response({"error": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)
        
        user = self.request.user
        if booking.customer != user and booking.package.provider != user:
            return None, Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
        
        return booking, None

    def get_queryset(self):
        booking_id = self.request.query_params.get('booking')
        if not booking_id:
            return Message.objects.none()
        
        booking, err = self._get_booking_and_check_access(booking_id)
        if err:
            return Message.objects.none()
        
        # Mark messages from the other party as read
        Message.objects.filter(booking=booking, is_read=False).exclude(
            sender=self.request.user
        ).update(is_read=True)
        
        return Message.objects.filter(booking=booking)

    def create(self, request, *args, **kwargs):
        booking_id = request.data.get('booking')
        content = request.data.get('content', '').strip()

        if not booking_id:
            return Response({"error": "booking field is required."}, status=status.HTTP_400_BAD_REQUEST)
        if not content:
            return Response({"error": "Message content cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)

        booking, err = self._get_booking_and_check_access(booking_id)
        if err:
            return err

        message = Message.objects.create(
            booking=booking,
            sender=request.user,
            content=content
        )
        serializer = self.get_serializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
