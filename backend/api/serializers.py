from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import TourPackage, Booking, Message

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'phone', 'address', 'bio')
        read_only_fields = ('id', 'username', 'role')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'role', 'phone', 'address', 'bio')

    def create(self, validated_data):
        password = validated_data.pop('password')
        role = validated_data.get('role', 'customer')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            role=role,
            phone=validated_data.get('phone', ''),
            address=validated_data.get('address', ''),
            bio=validated_data.get('bio', ''),
        )
        user.set_password(password)
        user.save()
        return user

class TourPackageSerializer(serializers.ModelSerializer):
    provider_username = serializers.CharField(source='provider.username', read_only=True)
    provider_email = serializers.CharField(source='provider.email', read_only=True)
    provider_phone = serializers.CharField(source='provider.phone', read_only=True)
    provider_bio = serializers.CharField(source='provider.bio', read_only=True)

    class Meta:
        model = TourPackage
        fields = (
            'id', 'provider', 'provider_username', 'provider_email', 'provider_phone', 'provider_bio',
            'title', 'description',
            'destination', 'price', 'duration_days', 'accommodation',
            'transportation', 'activities', 'safety_measures', 'rating',
            'image_url', 'image', 'created_at'
        )
        read_only_fields = ('id', 'provider', 'provider_username', 'provider_email', 'provider_phone', 'provider_bio', 'rating', 'created_at')

class CustomerInfoSerializer(serializers.ModelSerializer):
    """Lightweight serializer exposing customer contact details to providers."""
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'phone', 'address', 'bio')

class BookingSerializer(serializers.ModelSerializer):
    customer_username = serializers.CharField(source='customer.username', read_only=True)
    customer_info = CustomerInfoSerializer(source='customer', read_only=True)
    package_details = TourPackageSerializer(source='package', read_only=True)
    unread_messages = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = (
            'id', 'customer', 'customer_username', 'customer_info', 'package', 'package_details',
            'booking_date', 'travel_date', 'slots', 'total_price', 'status', 'unread_messages'
        )
        read_only_fields = ('id', 'customer', 'customer_username', 'customer_info', 'package_details', 'booking_date', 'unread_messages')

    def get_unread_messages(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0

class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    sender_role = serializers.CharField(source='sender.role', read_only=True)

    class Meta:
        model = Message
        fields = ('id', 'booking', 'sender', 'sender_username', 'sender_role', 'content', 'sent_at', 'is_read')
        read_only_fields = ('id', 'sender', 'sender_username', 'sender_role', 'sent_at', 'is_read')
