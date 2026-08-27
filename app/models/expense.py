"""Trip expense splitting ("Splitwise-style"): participants, expenses, and shares.

Participants are free-text names (not necessarily platform users) since trip
companions often aren't registered accounts — this mirrors how Splitwise-style
tools work in practice.
"""

from datetime import date

from sqlalchemy import Float, ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class TripParticipant(Base, TimestampMixin):
    __tablename__ = "trip_participants"
    __table_args__ = (Index("ix_trip_participants_trip", "trip_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(100))


class TripExpense(Base, TimestampMixin):
    __tablename__ = "trip_expenses"
    __table_args__ = (Index("ix_trip_expenses_trip", "trip_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id", ondelete="CASCADE"), index=True)
    paid_by_id: Mapped[int] = mapped_column(ForeignKey("trip_participants.id", ondelete="CASCADE"))
    description: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(50), default="other")
    amount: Mapped[float] = mapped_column(Float)
    expense_date: Mapped[date | None] = mapped_column(nullable=True)

    paid_by: Mapped["TripParticipant"] = relationship(foreign_keys=[paid_by_id])
    shares: Mapped[list["TripExpenseShare"]] = relationship(back_populates="expense", cascade="all, delete-orphan")


class TripExpenseShare(Base):
    """How much of a given expense each participant owes."""

    __tablename__ = "trip_expense_shares"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    expense_id: Mapped[int] = mapped_column(ForeignKey("trip_expenses.id", ondelete="CASCADE"), index=True)
    participant_id: Mapped[int] = mapped_column(ForeignKey("trip_participants.id", ondelete="CASCADE"), index=True)
    share_amount: Mapped[float] = mapped_column(Float)

    expense: Mapped["TripExpense"] = relationship(back_populates="shares")
    participant: Mapped["TripParticipant"] = relationship(foreign_keys=[participant_id])
