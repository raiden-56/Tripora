"""Destination model — a user's personal visited/planned/wishlist place."""

from datetime import date

from sqlalchemy import Boolean, Enum, Float, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import DestinationStatus
from app.db.base import Base, TimestampMixin


class Destination(Base, TimestampMixin):
    __tablename__ = "destinations"
    __table_args__ = (
        Index("ix_destinations_user_status", "user_id", "status"),
        Index("ix_destinations_lat_lng", "latitude", "longitude"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    name: Mapped[str] = mapped_column(String(150), index=True)
    country: Mapped[str] = mapped_column(String(100), index=True)
    state: Mapped[str | None] = mapped_column(String(100), index=True, nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    # Simplification: category is a free-form tag rather than a separate lookup table
    # (documented in ARCHITECTURE.md) — keeps the schema lean for the current feature set.
    category: Mapped[str | None] = mapped_column(String(50), nullable=True)

    latitude: Mapped[float] = mapped_column(Float, index=True)
    longitude: Mapped[float] = mapped_column(Float, index=True)

    status: Mapped[DestinationStatus] = mapped_column(Enum(DestinationStatus), index=True)
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False)
    priority: Mapped[str | None] = mapped_column(String(20), nullable=True)  # high | medium | low (wishlist only)

    visited_from: Mapped[date | None] = mapped_column(nullable=True)
    visited_to: Mapped[date | None] = mapped_column(nullable=True)
    rating: Mapped[float | None] = mapped_column(Float, nullable=True)

    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    hero_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    google_maps_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    memories: Mapped[list["Memory"]] = relationship(back_populates="destination", cascade="all, delete-orphan")
    photos: Mapped[list["Photo"]] = relationship(back_populates="destination", cascade="all, delete-orphan")
