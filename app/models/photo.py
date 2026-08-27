"""Photo storage metadata + shareable album models."""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class Photo(Base, TimestampMixin):
    """Metadata only — the binary lives in object storage (see integrations/storage)."""

    __tablename__ = "photos"
    __table_args__ = (Index("ix_photos_user_destination", "user_id", "destination_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    destination_id: Mapped[int | None] = mapped_column(
        ForeignKey("destinations.id", ondelete="CASCADE"), nullable=True, index=True
    )
    memory_id: Mapped[int | None] = mapped_column(ForeignKey("memories.id", ondelete="CASCADE"), nullable=True, index=True)
    trip_id: Mapped[int | None] = mapped_column(ForeignKey("trips.id", ondelete="SET NULL"), nullable=True)

    storage_key: Mapped[str] = mapped_column(String(500))
    url: Mapped[str] = mapped_column(String(500))
    caption: Mapped[str | None] = mapped_column(String(300), nullable=True)
    taken_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    destination: Mapped["Destination"] = relationship(back_populates="photos")
    memory: Mapped["Memory"] = relationship(back_populates="photos")


class PhotoShare(Base, TimestampMixin):
    """A shareable album: a curated set of photos exposed via a secure, unguessable token."""

    __tablename__ = "photo_shares"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    share_token: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(150))
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_public: Mapped[bool] = mapped_column(Boolean, default=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    items: Mapped[list["PhotoShareItem"]] = relationship(back_populates="share", cascade="all, delete-orphan")


class PhotoShareItem(Base):
    __tablename__ = "photo_share_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    photo_share_id: Mapped[int] = mapped_column(ForeignKey("photo_shares.id", ondelete="CASCADE"), index=True)
    photo_id: Mapped[int] = mapped_column(ForeignKey("photos.id", ondelete="CASCADE"), index=True)

    share: Mapped["PhotoShare"] = relationship(back_populates="items")
    photo: Mapped["Photo"] = relationship()
