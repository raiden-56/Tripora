"""Checks that IDs a client sends in a payload point at rows the caller may use.

Every write that links to another row (a memory's destination, a photo's trip, a
trip's destinations...) goes through here, so a user can never attach their data to
someone else's records. Missing and not-yours both answer 404, so the response
doesn't reveal whether another user's row exists.
"""

from collections.abc import Iterable

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.models.destination import Destination
from app.models.memory import Memory
from app.models.trip import Trip
from app.models.trip_collaborator import CollaboratorRole, CollaboratorStatus, TripCollaborator


class ReferenceGuard:
    def __init__(self, db: Session):
        self.db = db

    def destination(self, destination_id: int | None, user_id: int) -> None:
        if destination_id is None:
            return
        destination = self.db.get(Destination, destination_id)
        if destination is None or destination.user_id != user_id:
            raise NotFoundError("Destination not found.", code="DESTINATION_NOT_FOUND")

    def destinations(self, destination_ids: Iterable[int], user_id: int) -> None:
        wanted = set(destination_ids)
        if not wanted:
            return
        owned = set(
            self.db.scalars(
                select(Destination.id).where(Destination.id.in_(wanted), Destination.user_id == user_id)
            )
        )
        if owned != wanted:
            raise NotFoundError("Destination not found.", code="DESTINATION_NOT_FOUND")

    def memory(self, memory_id: int | None, user_id: int) -> None:
        if memory_id is None:
            return
        memory = self.db.get(Memory, memory_id)
        if memory is None or memory.user_id != user_id:
            raise NotFoundError("Memory not found.", code="MEMORY_NOT_FOUND")

    def trip_editable(self, trip_id: int | None, user_id: int) -> None:
        """The caller owns the trip or is an accepted editor on it."""
        if trip_id is None:
            return
        trip = self.db.get(Trip, trip_id)
        if trip is None:
            raise NotFoundError("Trip not found.", code="TRIP_NOT_FOUND")
        if trip.user_id == user_id:
            return
        collaborator = self.db.scalar(
            select(TripCollaborator).where(
                TripCollaborator.trip_id == trip_id, TripCollaborator.user_id == user_id
            )
        )
        if collaborator is None or collaborator.status != CollaboratorStatus.ACCEPTED:
            raise NotFoundError("Trip not found.", code="TRIP_NOT_FOUND")
        if collaborator.role != CollaboratorRole.EDITOR:
            raise PermissionDeniedError("Viewers can't add content to this trip.")
