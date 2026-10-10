"""Unauthenticated, read-only views of journeys their owners chose to make public.

Only profiles with visibility "public" are served; "private" and "friends" answer 404
(there is no friends graph yet, so "friends" is treated as private).
"""

from datetime import date

from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy import select

from app.api.dependencies import DbSession
from app.core.constants import DestinationStatus
from app.core.exceptions import NotFoundError
from app.models.destination import Destination
from app.models.memory import Memory
from app.models.photo import Photo
from app.models.trip import Trip
from app.models.user import User, UserProfile

router = APIRouter(prefix="/public", tags=["public"])


class PublicDestination(BaseModel):
    id: int
    name: str
    country: str
    state: str | None
    city: str | None
    latitude: float
    longitude: float
    status: DestinationStatus
    is_favorite: bool
    rating: float | None
    hero_image_url: str | None
    visited_from: date | None
    visited_to: date | None


class PublicMemory(BaseModel):
    id: int
    destination_id: int
    title: str
    description: str | None
    memory_date: date
    image_url: str | None


class PublicJourney(BaseModel):
    handle: str
    name: str
    bio: str | None
    avatar_url: str | None
    home_location: str | None
    destinations: list[PublicDestination]
    memories: list[PublicMemory]
    trips_completed: int
    travel_days: int


@router.get("/journeys/{handle}", response_model=PublicJourney)
def get_public_journey(handle: str, db: DbSession) -> PublicJourney:
    row = db.execute(
        select(User, UserProfile)
        .join(UserProfile, UserProfile.user_id == User.id)
        .where(UserProfile.handle == handle.lower(), User.is_active.is_(True))
    ).first()
    if row is None or row.UserProfile.visibility != "public":
        raise NotFoundError("This journey isn't public.", code="JOURNEY_NOT_FOUND")
    user, profile = row

    destinations = list(db.scalars(select(Destination).where(Destination.user_id == user.id).order_by(Destination.id)))
    memories = list(
        db.scalars(select(Memory).where(Memory.user_id == user.id).order_by(Memory.memory_date.desc()).limit(60))
    )
    first_photo: dict[int, str] = {}
    if memories:
        for memory_id, url in db.execute(
            select(Photo.memory_id, Photo.url)
            .where(Photo.memory_id.in_([m.id for m in memories]))
            .order_by(Photo.id)
        ):
            first_photo.setdefault(memory_id, url)
    visited_trips = list(
        db.scalars(select(Trip).where(Trip.user_id == user.id, Trip.status == DestinationStatus.VISITED))
    )

    return PublicJourney(
        handle=profile.handle,
        name=user.name,
        bio=profile.bio,
        avatar_url=profile.avatar_url,
        home_location=profile.home_location,
        destinations=[PublicDestination.model_validate(d, from_attributes=True) for d in destinations],
        memories=[
            PublicMemory(
                id=m.id, destination_id=m.destination_id, title=m.title, description=m.description,
                memory_date=m.memory_date, image_url=first_photo.get(m.id),
            )
            for m in memories
        ],
        trips_completed=len(visited_trips),
        travel_days=sum((t.end_date - t.start_date).days + 1 for t in visited_trips),
    )
