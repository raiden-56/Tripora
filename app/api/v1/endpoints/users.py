"""Current user + profile endpoints, data export, and account deletion."""

from datetime import datetime, timezone

from fastapi import APIRouter
from sqlalchemy import select

from app.api.dependencies import CurrentUser, DbSession
from app.core.exceptions import ConflictError, UnauthorizedError
from app.core.logging import get_logger
from app.core.security import verify_password
from app.integrations.storage.local_storage import get_storage_service
from app.models.destination import Destination
from app.models.memory import Memory
from app.models.photo import Photo
from app.models.photo_animation import PhotoAnimation
from app.models.trip import Trip
from app.models.trip_planning import TripBudgetItem, TripChecklistItem
from app.models.user import UserProfile
from app.schemas.destination import DestinationOut
from app.schemas.memory import MemoryOut
from app.schemas.trip import TripOut
from app.schemas.user import AccountDeleteRequest, UserOut, UserProfileOut, UserProfileUpdate, UserUpdate
from app.services.trip_service import TripService
from app.utils.handles import handle_available

router = APIRouter(prefix="/users", tags=["users"])
logger = get_logger(__name__)


@router.get("/me", response_model=UserOut)
def get_me(user: CurrentUser) -> UserOut:
    return UserOut.model_validate(user)


@router.put("/me", response_model=UserOut)
def update_me(payload: UserUpdate, user: CurrentUser, db: DbSession) -> UserOut:
    if payload.name is not None:
        user.name = payload.name.strip()
    db.commit()
    db.refresh(user)
    return UserOut.model_validate(user)


@router.get("/me/profile", response_model=UserProfileOut)
def get_my_profile(user: CurrentUser) -> UserProfileOut:
    return UserProfileOut.model_validate(user.profile)


@router.put("/me/profile", response_model=UserProfileOut)
def update_my_profile(payload: UserProfileUpdate, user: CurrentUser, db: DbSession) -> UserProfileOut:
    profile: UserProfile = user.profile
    data = payload.model_dump(exclude_unset=True)
    if "handle" in data and not handle_available(db, data["handle"], exclude_user_id=user.id):
        raise ConflictError("That handle is already taken.", code="HANDLE_TAKEN")
    for field, value in data.items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return UserProfileOut.model_validate(profile)


@router.get("/me/export")
def export_my_data(user: CurrentUser, db: DbSession) -> dict:
    """Everything the user has put into Travel Diaries, as one JSON document."""
    trips = list(db.scalars(select(Trip).where(Trip.user_id == user.id).order_by(Trip.start_date)))
    trip_ids = [t.id for t in trips]
    checklists = list(db.scalars(select(TripChecklistItem).where(TripChecklistItem.trip_id.in_(trip_ids))))
    budgets = list(db.scalars(select(TripBudgetItem).where(TripBudgetItem.trip_id.in_(trip_ids))))

    def trip_out(trip: Trip) -> dict:
        data = TripOut.model_validate(trip).model_dump(mode="json") | {
            "destination_ids": TripService.to_destination_ids(trip)
        }
        data["checklist"] = [{"text": c.text, "is_done": c.is_done} for c in checklists if c.trip_id == trip.id]
        data["budget"] = [{"category": b.category, "planned_amount": b.planned_amount} for b in budgets if b.trip_id == trip.id]
        return data

    destinations = db.scalars(select(Destination).where(Destination.user_id == user.id).order_by(Destination.id))
    memories = db.scalars(select(Memory).where(Memory.user_id == user.id).order_by(Memory.memory_date))
    photos = db.scalars(select(Photo).where(Photo.user_id == user.id).order_by(Photo.id))
    return {
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "account": UserOut.model_validate(user).model_dump(mode="json"),
        "profile": UserProfileOut.model_validate(user.profile).model_dump(mode="json"),
        "destinations": [DestinationOut.model_validate(d).model_dump(mode="json") for d in destinations],
        "trips": [trip_out(t) for t in trips],
        "memories": [MemoryOut.model_validate(m).model_dump(mode="json") for m in memories],
        "photos": [
            {"id": p.id, "url": p.url, "caption": p.caption, "destination_id": p.destination_id,
             "memory_id": p.memory_id, "trip_id": p.trip_id,
             "taken_at": p.taken_at.isoformat() if p.taken_at else None}
            for p in photos
        ],
    }


@router.delete("/me", status_code=204)
def delete_my_account(payload: AccountDeleteRequest, user: CurrentUser, db: DbSession) -> None:
    """Permanently deletes the account, everything it owns, and its uploaded files."""
    if not verify_password(payload.password, user.hashed_password):
        raise UnauthorizedError("That password isn't right.", code="INVALID_CREDENTIALS")

    storage = get_storage_service()
    keys = list(db.scalars(select(Photo.storage_key).where(Photo.user_id == user.id)))
    keys += [
        url.removeprefix("/uploads/")
        for url in db.scalars(select(PhotoAnimation.output_url).where(PhotoAnimation.user_id == user.id))
        if url and url.startswith("/uploads/")
    ]

    db.delete(user)  # ON DELETE CASCADE removes every row the user owns
    db.commit()

    for key in keys:
        try:
            storage.delete(key=key)
        except Exception:  # noqa: BLE001 - a stray file must not fail an already-deleted account
            logger.warning("Could not delete stored file %s after account deletion", key)
