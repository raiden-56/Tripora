"""Animated GIFs generated from a user's own photos — e.g. a trip highlight reel
shareable to the community feed. Generation runs async via Celery, mirroring how
AI blog generation works (see app/tasks/animation_tasks.py)."""

from sqlalchemy import Enum, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import GenerationStatus
from app.db.base import Base, TimestampMixin


class PhotoAnimation(Base, TimestampMixin):
    __tablename__ = "photo_animations"
    __table_args__ = (Index("ix_photo_animations_user", "user_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    trip_id: Mapped[int | None] = mapped_column(ForeignKey("trips.id", ondelete="SET NULL"), nullable=True)

    title: Mapped[str] = mapped_column(String(150), default="Untitled Animation")
    status: Mapped[GenerationStatus] = mapped_column(Enum(GenerationStatus), default=GenerationStatus.PENDING, index=True)
    output_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    items: Mapped[list["PhotoAnimationItem"]] = relationship(
        back_populates="animation", cascade="all, delete-orphan", order_by="PhotoAnimationItem.order_index"
    )


class PhotoAnimationItem(Base):
    __tablename__ = "photo_animation_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    photo_animation_id: Mapped[int] = mapped_column(ForeignKey("photo_animations.id", ondelete="CASCADE"), index=True)
    photo_id: Mapped[int] = mapped_column(ForeignKey("photos.id", ondelete="CASCADE"), index=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    animation: Mapped["PhotoAnimation"] = relationship(back_populates="items")
    photo: Mapped["Photo"] = relationship()
