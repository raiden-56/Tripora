"""Trip collaborators: real platform accounts sharing access to a trip (and, by
extension, its photos) with a role. Distinct from TripParticipant (app/models/expense.py),
which is a free-text name used only for expense splitting and isn't a login-linked account.
"""

from enum import StrEnum

from sqlalchemy import Enum, ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class CollaboratorRole(StrEnum):
    EDITOR = "editor"
    VIEWER = "viewer"


class CollaboratorStatus(StrEnum):
    PENDING = "pending"
    ACCEPTED = "accepted"


class TripCollaborator(Base, TimestampMixin):
    __tablename__ = "trip_collaborators"
    __table_args__ = (Index("ix_trip_collaborators_trip_user", "trip_id", "user_id", unique=True),)

    id: Mapped[int] = mapped_column(primary_key=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    invited_email: Mapped[str] = mapped_column(String(255))
    role: Mapped[CollaboratorRole] = mapped_column(Enum(CollaboratorRole), default=CollaboratorRole.VIEWER)
    status: Mapped[CollaboratorStatus] = mapped_column(Enum(CollaboratorStatus), default=CollaboratorStatus.PENDING)

    trip: Mapped["Trip"] = relationship()
    user: Mapped["User"] = relationship()

    @property
    def trip_title(self) -> str:
        return self.trip.title
