"""Guide booking model — the request/accept/reject workflow between a traveler and a guide."""

from datetime import date

from sqlalchemy import Enum, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import BookingStatus
from app.db.base import Base, TimestampMixin


class GuideBooking(Base, TimestampMixin):
    __tablename__ = "guide_bookings"
    __table_args__ = (
        Index("ix_bookings_user_status", "user_id", "status"),
        Index("ix_bookings_guide_status", "guide_id", "status"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    guide_id: Mapped[int] = mapped_column(ForeignKey("guide_profiles.id", ondelete="CASCADE"), index=True)

    booking_date: Mapped[date] = mapped_column(index=True)
    booking_time: Mapped[str] = mapped_column(String(10))  # HH:MM
    people_count: Mapped[int] = mapped_column(Integer, default=1)
    duration_hours: Mapped[int] = mapped_column(Integer, default=4)
    special_requirements: Mapped[str | None] = mapped_column(Text, nullable=True)

    status: Mapped[BookingStatus] = mapped_column(Enum(BookingStatus), default=BookingStatus.PENDING, index=True)

    guide: Mapped["GuideProfile"] = relationship()
