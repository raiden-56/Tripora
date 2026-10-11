"""Per-trip planning data: a shared packing/to-do checklist, a planned budget and a
day-by-day itinerary.

Actual spend comes from TripExpense (app/models/expense.py); the budget rows only
hold what the travellers *planned* to spend per category, so the two can be compared.
"""

from sqlalchemy import Boolean, Float, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class TripChecklistItem(Base, TimestampMixin):
    __tablename__ = "trip_checklist_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id", ondelete="CASCADE"), index=True)
    text: Mapped[str] = mapped_column(String(200))
    is_done: Mapped[bool] = mapped_column(Boolean, default=False)
    position: Mapped[int] = mapped_column(Integer, default=0)


class TripBudgetItem(Base, TimestampMixin):
    __tablename__ = "trip_budget_items"
    __table_args__ = (UniqueConstraint("trip_id", "category", name="uq_trip_budget_category"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id", ondelete="CASCADE"), index=True)
    category: Mapped[str] = mapped_column(String(50))
    planned_amount: Mapped[float] = mapped_column(Float, default=0)


class TripItineraryItem(Base, TimestampMixin):
    """One stop on a trip's day-by-day plan (a place, activity, meal, transfer or stay)."""

    __tablename__ = "trip_itinerary_items"
    __table_args__ = (Index("ix_trip_itinerary_trip_day", "trip_id", "day_number", "position"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id", ondelete="CASCADE"), index=True)
    day_number: Mapped[int] = mapped_column(Integer)  # 1 = the trip's start date
    position: Mapped[int] = mapped_column(Integer, default=0)
    start_time: Mapped[str | None] = mapped_column(String(5), nullable=True)  # HH:MM
    title: Mapped[str] = mapped_column(String(200))
    kind: Mapped[str] = mapped_column(String(20), default="activity")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    cost: Mapped[float | None] = mapped_column(Float, nullable=True)


class TripItineraryDay(Base):
    """An optional heading for one day of a trip ("Arrival in Coorg")."""

    __tablename__ = "trip_itinerary_days"
    __table_args__ = (UniqueConstraint("trip_id", "day_number", name="uq_trip_itinerary_day"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id", ondelete="CASCADE"), index=True)
    day_number: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(200))
