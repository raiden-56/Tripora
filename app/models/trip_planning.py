"""Per-trip planning data: a shared packing/to-do checklist and a planned budget.

Actual spend comes from TripExpense (app/models/expense.py); the budget rows only
hold what the travellers *planned* to spend per category, so the two can be compared.
"""

from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, UniqueConstraint
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
