"""Trip collaborator persistence."""

from sqlalchemy import select

from app.models.trip_collaborator import TripCollaborator
from app.repositories.base import BaseRepository


class TripCollaboratorRepository(BaseRepository[TripCollaborator]):
    model = TripCollaborator

    def list_for_trip(self, trip_id: int) -> list[TripCollaborator]:
        stmt = select(TripCollaborator).where(TripCollaborator.trip_id == trip_id)
        return list(self.db.scalars(stmt).all())

    def list_for_user(self, user_id: int) -> list[TripCollaborator]:
        stmt = select(TripCollaborator).where(TripCollaborator.user_id == user_id)
        return list(self.db.scalars(stmt).all())

    def get_for_trip_and_user(self, trip_id: int, user_id: int) -> TripCollaborator | None:
        stmt = select(TripCollaborator).where(
            TripCollaborator.trip_id == trip_id, TripCollaborator.user_id == user_id
        )
        return self.db.scalar(stmt)
