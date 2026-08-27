"""Memory model — a note/photo tied to a destination and (optionally) a trip."""

from datetime import date

from sqlalchemy import ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class Memory(Base, TimestampMixin):
    __tablename__ = "memories"
    __table_args__ = (Index("ix_memories_user_destination", "user_id", "destination_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    destination_id: Mapped[int] = mapped_column(ForeignKey("destinations.id", ondelete="CASCADE"), index=True)
    trip_id: Mapped[int | None] = mapped_column(ForeignKey("trips.id", ondelete="SET NULL"), nullable=True, index=True)

    title: Mapped[str] = mapped_column(String(150))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    memory_date: Mapped[date] = mapped_column(index=True)
    tags: Mapped[str | None] = mapped_column(String(300), nullable=True)  # comma-separated

    destination: Mapped["Destination"] = relationship(back_populates="memories")
    photos: Mapped[list["Photo"]] = relationship(back_populates="memory", cascade="all, delete-orphan")
