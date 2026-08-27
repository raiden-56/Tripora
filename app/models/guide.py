"""Local-guide marketplace models: profile, availability, and reviews."""

from datetime import date

from sqlalchemy import Boolean, Float, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class GuideProfile(Base, TimestampMixin):
    """Extends a User with role=GUIDE. A guide is tied to a place name/region, not a
    specific traveler's personal Destination record (those are two different concepts)."""

    __tablename__ = "guide_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)

    headline: Mapped[str] = mapped_column(String(150))
    about: Mapped[str | None] = mapped_column(Text, nullable=True)
    destination_name: Mapped[str] = mapped_column(String(150), index=True)
    languages: Mapped[str | None] = mapped_column(String(200), nullable=True)  # comma-separated
    experience_years: Mapped[int] = mapped_column(Integer, default=0)
    specialization: Mapped[str | None] = mapped_column(String(150), nullable=True)
    price_per_day: Mapped[float] = mapped_column(Float)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    rating_avg: Mapped[float] = mapped_column(Float, default=0, index=True)
    rating_count: Mapped[int] = mapped_column(Integer, default=0)

    availability: Mapped[list["GuideAvailability"]] = relationship(back_populates="guide", cascade="all, delete-orphan")
    reviews: Mapped[list["GuideReview"]] = relationship(back_populates="guide", cascade="all, delete-orphan")


class GuideAvailability(Base):
    __tablename__ = "guide_availability"
    __table_args__ = (UniqueConstraint("guide_id", "available_date", name="uq_guide_availability_date"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    guide_id: Mapped[int] = mapped_column(ForeignKey("guide_profiles.id", ondelete="CASCADE"), index=True)
    available_date: Mapped[date] = mapped_column(index=True)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)

    guide: Mapped["GuideProfile"] = relationship(back_populates="availability")


class GuideReview(Base, TimestampMixin):
    __tablename__ = "guide_reviews"
    __table_args__ = (
        Index("ix_guide_reviews_guide_rating", "guide_id", "rating"),
        UniqueConstraint("booking_id", name="uq_guide_review_booking"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    guide_id: Mapped[int] = mapped_column(ForeignKey("guide_profiles.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    booking_id: Mapped[int] = mapped_column(ForeignKey("guide_bookings.id", ondelete="CASCADE"))

    rating: Mapped[int] = mapped_column(Integer)  # 1-5
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)

    guide: Mapped["GuideProfile"] = relationship(back_populates="reviews")
