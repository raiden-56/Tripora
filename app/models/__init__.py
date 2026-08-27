"""Import every model here so Base.metadata is complete for Alembic autogenerate."""

from app.models.blog import Blog, BlogSection
from app.models.booking import GuideBooking
from app.models.destination import Destination
from app.models.drive_link import GoogleDriveLink
from app.models.expense import TripExpense, TripExpenseShare, TripParticipant
from app.models.guide import GuideAvailability, GuideProfile, GuideReview
from app.models.memory import Memory
from app.models.notification import Notification
from app.models.payment import Payment
from app.models.photo import Photo, PhotoShare, PhotoShareItem
from app.models.subscription import Subscription, SubscriptionPlan
from app.models.trip import Trip, TripDestination, TripPlan, TripPlanActivity, TripPlanDay
from app.models.user import RefreshToken, User, UserProfile

__all__ = [
    "Blog",
    "BlogSection",
    "GuideBooking",
    "Destination",
    "GoogleDriveLink",
    "TripExpense",
    "TripExpenseShare",
    "TripParticipant",
    "GuideAvailability",
    "GuideProfile",
    "GuideReview",
    "Memory",
    "Notification",
    "Payment",
    "Photo",
    "PhotoShare",
    "PhotoShareItem",
    "Subscription",
    "SubscriptionPlan",
    "Trip",
    "TripDestination",
    "TripPlan",
    "TripPlanActivity",
    "TripPlanDay",
    "RefreshToken",
    "User",
    "UserProfile",
]
