"""Trip business logic."""

from app.core.exceptions import AppError, NotFoundError, PermissionDeniedError
from app.models.trip import Trip
from app.repositories.trip_repository import TripRepository
from app.schemas.trip import TripCreate, TripUpdate
from app.services.reference_guard import ReferenceGuard


class TripService:
    def __init__(self, repo: TripRepository):
        self.repo = repo
        self.guard = ReferenceGuard(repo.db)

    def list_trips(self, user_id: int, page: int, page_size: int) -> tuple[list[Trip], int]:
        return self.repo.list_accessible_for_user(user_id, page=page, page_size=page_size)

    def get_or_404(self, trip_id: int) -> Trip:
        trip = self.repo.get(trip_id)
        if not trip:
            raise NotFoundError("Trip not found.", code="TRIP_NOT_FOUND")
        return trip

    def get_owned(self, trip_id: int, user_id: int) -> Trip:
        trip = self.get_or_404(trip_id)
        if trip.user_id != user_id:
            raise PermissionDeniedError("You do not have access to this trip.")
        return trip

    def create(self, user_id: int, payload: TripCreate) -> Trip:
        self.guard.destinations(payload.destination_ids, user_id)
        data = payload.model_dump(exclude={"destination_ids"})
        trip = Trip(user_id=user_id, **data)
        trip = self.repo.add(trip)
        if payload.destination_ids:
            self.repo.set_destinations(trip, payload.destination_ids)
        return trip

    def update(self, trip_id: int, user_id: int, payload: TripUpdate) -> Trip:
        trip = self.get_owned(trip_id, user_id)
        if payload.destination_ids is not None:
            self.guard.destinations(payload.destination_ids, user_id)
        data = payload.model_dump(exclude_unset=True, exclude={"destination_ids"})
        start, end = data.get("start_date", trip.start_date), data.get("end_date", trip.end_date)
        if end < start:
            raise AppError("The trip can't end before it starts.", code="INVALID_DATES", status_code=422)
        for field, value in data.items():
            setattr(trip, field, value)
        trip = self.repo.add(trip)
        if payload.destination_ids is not None:
            self.repo.set_destinations(trip, payload.destination_ids)
        return trip

    def delete(self, trip_id: int, user_id: int) -> None:
        trip = self.get_owned(trip_id, user_id)
        self.repo.delete(trip)

    @staticmethod
    def to_destination_ids(trip: Trip) -> list[int]:
        return [link.destination_id for link in sorted(trip.destinations, key=lambda l: l.order_index)]
