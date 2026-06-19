import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from api.models import TourPackage, Booking

User = get_user_model()

def seed_db():
    print("Seeding database...")
    
    # 1. Create Users
    provider, created = User.objects.get_or_create(
        username='provider1',
        defaults={
            'email': 'provider1@adventure.com',
            'role': 'provider',
            'phone': '+91-9876543210',
            'address': 'MG Road, Bengaluru, Karnataka, India',
            'bio': 'Experienced outdoor guides offering premium camping, river rafting, and trekking packages across major Indian adventure destinations.'
        }
    )
    if created:
        provider.set_password('password123')
        provider.save()
        print("Provider 'provider1' created.")
    else:
        provider.email = 'provider1@adventure.com'
        provider.phone = '+91-9876543210'
        provider.address = 'MG Road, Bengaluru, Karnataka, India'
        provider.bio = 'Experienced outdoor guides offering premium camping, river rafting, and trekking packages across major Indian adventure destinations.'
        provider.save()
        print("Provider 'provider1' updated.")

    customer, created = User.objects.get_or_create(
        username='customer1',
        defaults={
            'email': 'customer1@explorer.com',
            'role': 'customer',
            'phone': '+91-8765432109',
            'address': 'Powai, Mumbai, Maharashtra, India',
            'bio': 'Avid traveler looking to explore trekking and riverside camping spots in India.'
        }
    )
    if created:
        customer.set_password('password123')
        customer.save()
        print("Customer 'customer1' created.")
    else:
        customer.email = 'customer1@explorer.com'
        customer.phone = '+91-8765432109'
        customer.address = 'Powai, Mumbai, Maharashtra, India'
        customer.bio = 'Avid traveler looking to explore trekking and riverside camping spots in India.'
        customer.save()
        print("Customer 'customer1' updated.")

    # Clear old packages and bookings to avoid duplicates
    print("Clearing old package and booking records...")
    Booking.objects.all().delete()
    TourPackage.objects.all().delete()

    # 2. Create Packages
    packages_data = [
        {
            "title": "Rishikesh White Water Rafting & Camp",
            "description": "Experience the thrill of river rafting on the Ganges. Camp on sandy beaches, participate in beach volleyball, hike to scenic waterfalls, and relax by the evening campfire with light music. Includes hygienic buffet meals and certified safety gear.",
            "destination": "Rishikesh, Uttarakhand, India",
            "price": 89.00,
            "duration_days": 3,
            "accommodation": "Riverside Geodesic Tents",
            "transportation": "Jeep Pick-up from Haridwar Railway Station",
            "activities": "River Rafting, Waterfall Trekking, Campfire, Yoga",
            "safety_measures": "Life jackets, certified river guides, rescue kayaks, first-aid kits.",
            "rating": 4.90,
            "image_url": "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80"
        },
        {
            "title": "Ladakh Cold Desert Adventure Trek",
            "description": "Camp in the cold deserts of Ladakh. Visit Pangong Tso Lake, cross the Khardung La pass, and stay in comfortable local yurt-style camps. Marvel at pristine clear night skies perfect for astronomical stargazing.",
            "destination": "Leh-Ladakh, Jammu & Kashmir, India",
            "price": 299.00,
            "duration_days": 6,
            "accommodation": "Insulated Yurt Tents",
            "transportation": "SUV Transfer from Leh Airport",
            "activities": "High-altitude Trekking, Stargazing, Monasteries tour, Camel ride",
            "safety_measures": "Oxygen cylinders, altitude sickness medical kits, certified Himalayan guide support.",
            "rating": 4.85,
            "image_url": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80"
        },
        {
            "title": "Thar Desert Luxury Safaris",
            "description": "Sleep under the stars in the golden sands of the Thar Desert. Experience a camel safari, traditional Rajasthani folk music and dance performances, and enjoy local heritage dining in the dunes.",
            "destination": "Jaisalmer, Rajasthan, India",
            "price": 129.00,
            "duration_days": 3,
            "accommodation": "Royal Swiss Tents",
            "transportation": "Camel and Jeep transfer from Jaisalmer City",
            "activities": "Camel Safari, Dune Bashing, Folk Dance, Heritage Dining",
            "safety_measures": "Desert survival guides, 4x4 backup vehicles, emergency calling systems.",
            "rating": 4.75,
            "image_url": "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80"
        },
        {
            "title": "Munnar Tea Valley Forest Camp",
            "description": "Nestled amidst lush green tea gardens and misty forests. Trek through the Anamudi trails, participate in bamboo rafting, and camp in serene forest glades with local bird-watching tours.",
            "destination": "Munnar, Kerala, India",
            "price": 110.00,
            "duration_days": 4,
            "accommodation": "Elevated Wooden Platform Tents",
            "transportation": "Cab Transfer from Kochi Airport",
            "activities": "Tea Garden Walks, Bamboo Rafting, Bird Watching, Forest Trekking",
            "safety_measures": "Forest department certified guides, leech guards, emergency rescue plans.",
            "rating": 4.80,
            "image_url": "https://images.unsplash.com/photo-1486915309851-b0cc1f8a0084?auto=format&fit=crop&w=800&q=80"
        }
    ]

    for p_data in packages_data:
        package, created = TourPackage.objects.get_or_create(
            provider=provider,
            title=p_data["title"],
            defaults=p_data
        )
        if created:
            print(f"Package '{p_data['title']}' created.")
        else:
            print(f"Package '{p_data['title']}' already exists.")

    # 3. Create a sample Booking
    if TourPackage.objects.exists():
        first_pkg = TourPackage.objects.first()
        booking, created = Booking.objects.get_or_create(
            customer=customer,
            package=first_pkg,
            travel_date='2026-08-15',
            defaults={
                'slots': 2,
                'total_price': first_pkg.price * 2,
                'status': 'pending'
            }
        )
        if created:
            print(f"Sample booking created for '{customer.username}' to '{first_pkg.title}'.")
        else:
            print(f"Sample booking already exists.")

    print("Seeding completed successfully!")

if __name__ == '__main__':
    seed_db()
