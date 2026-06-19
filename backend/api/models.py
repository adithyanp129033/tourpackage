from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('customer', 'Customer'),
        ('provider', 'Package Provider'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)  # Especially for providers

    def __str__(self):
        return f"{self.username} ({self.role})"

class TourPackage(models.Model):
    provider = models.ForeignKey(User, on_delete=models.CASCADE, related_name='packages')
    title = models.CharField(max_length=200)
    description = models.TextField()
    destination = models.CharField(max_length=200)
    price = models.DecimalField(max_length=10, decimal_places=2, max_digits=10)
    duration_days = models.IntegerField()
    accommodation = models.CharField(max_length=200, blank=True, null=True)
    transportation = models.CharField(max_length=200, blank=True, null=True)
    activities = models.CharField(max_length=500, help_text="Comma-separated activities, e.g., Hiking, Kayaking, Camping")
    safety_measures = models.TextField(blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.00)
    image_url = models.CharField(max_length=1000, blank=True, null=True)
    image = models.FileField(upload_to='packages/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    )
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    package = models.ForeignKey(TourPackage, on_delete=models.CASCADE, related_name='bookings')
    booking_date = models.DateTimeField(auto_now_add=True)
    travel_date = models.DateField()
    slots = models.IntegerField(default=1)
    total_price = models.DecimalField(max_length=10, decimal_places=2, max_digits=10)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        return f"{self.customer.username} -> {self.package.title} ({self.status})"

class Message(models.Model):
    """Chat messages between a customer and provider linked to a booking."""
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['sent_at']

    def __str__(self):
        return f"[Booking {self.booking.id}] {self.sender.username}: {self.content[:40]}"
