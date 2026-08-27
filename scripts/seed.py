"""Seeds demo users, destinations, a guide, pricing plans, and reviews.

Run with:
    python -m scripts.seed

Safe to re-run — skips records that already exist.
"""

from datetime import date

from app.core.constants import DestinationStatus, UserRole
from app.core.security import hash_password
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.destination import Destination
from app.models.guide import GuideProfile
from app.models.subscription import SubscriptionPlan
from app.models.user import User, UserProfile

DEMO_USERS = [
    {"email": "demo@traveldiaries.com", "password": "Travel@123", "name": "Demo Traveler", "role": UserRole.USER},
    {"email": "ashok@traveldiaries.com", "password": "Ashok@123", "name": "Ashok", "role": UserRole.USER},
    {"email": "guide@traveldiaries.com", "password": "Guide@123", "name": "Guide Demo", "role": UserRole.GUIDE},
    {"email": "admin@traveldiaries.com", "password": "Admin@123", "name": "Admin", "role": UserRole.ADMIN},
]

DEMO_DESTINATIONS = [
    {"name": "Coorg", "country": "India", "state": "Karnataka", "city": "Madikeri", "latitude": 12.4244, "longitude": 75.7382, "status": DestinationStatus.VISITED, "rating": 4.8},
    {"name": "Hampi", "country": "India", "state": "Karnataka", "city": "Hampi", "latitude": 15.335, "longitude": 76.46, "status": DestinationStatus.VISITED, "rating": 4.6},
    {"name": "North Goa", "country": "India", "state": "Goa", "city": "Calangute", "latitude": 15.5439, "longitude": 73.7553, "status": DestinationStatus.PLANNED},
    {"name": "Ladakh", "country": "India", "state": "Ladakh", "city": "Leh", "latitude": 34.1526, "longitude": 77.5771, "status": DestinationStatus.WISHLIST, "priority": "high"},
]

PRICING_PLANS = [
    {"code": "free", "name": "Free", "price": 0, "billing_period": "month",
     "features": "Basic travel map,Destinations,Wishlist,Basic memories,Basic statistics,Basic trip planning"},
    {"code": "pro", "name": "Pro", "price": 299, "billing_period": "month",
     "features": "Advanced planning,AI travel planner,AI travel stories,Advanced statistics,Unlimited memory organization"},
    {"code": "premium", "name": "Premium", "price": 599, "billing_period": "month",
     "features": "Everything in Pro,Advanced AI,Priority support,Advanced sharing,Premium travel features"},
]


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        users_by_email: dict[str, User] = {}
        for entry in DEMO_USERS:
            user = db.query(User).filter(User.email == entry["email"]).first()
            if not user:
                user = User(
                    email=entry["email"],
                    hashed_password=hash_password(entry["password"]),
                    name=entry["name"],
                    role=entry["role"],
                )
                user.profile = UserProfile(handle=entry["name"].lower().replace(" ", "-"))
                db.add(user)
                db.flush()
                print(f"Created user {entry['email']} ({entry['role'].value})")
            users_by_email[entry["email"]] = user
        db.commit()

        demo_user = users_by_email["demo@traveldiaries.com"]
        if not db.query(Destination).filter(Destination.user_id == demo_user.id).first():
            for d in DEMO_DESTINATIONS:
                db.add(Destination(user_id=demo_user.id, **d))
            print(f"Seeded {len(DEMO_DESTINATIONS)} demo destinations")
        db.commit()

        guide_user = users_by_email["guide@traveldiaries.com"]
        if not db.query(GuideProfile).filter(GuideProfile.user_id == guide_user.id).first():
            db.add(
                GuideProfile(
                    user_id=guide_user.id,
                    headline="Coorg trekking & coffee estate specialist",
                    about="Born and raised in Madikeri, guiding travelers through Coorg's hills for 8 years.",
                    destination_name="Coorg",
                    languages="English,Hindi,Kannada",
                    experience_years=8,
                    specialization="Nature & Trekking",
                    price_per_day=2500,
                    is_verified=True,
                )
            )
            print("Seeded demo guide profile")
        db.commit()

        for plan in PRICING_PLANS:
            if not db.query(SubscriptionPlan).filter(SubscriptionPlan.code == plan["code"]).first():
                db.add(SubscriptionPlan(currency="INR", is_active=True, **plan))
                print(f"Seeded pricing plan {plan['code']}")
        db.commit()

        print("\nSeed complete. Demo login: demo@traveldiaries.com / Travel@123")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
