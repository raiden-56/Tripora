"""AI-generated travel story ("blog") models."""

from sqlalchemy import Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import GenerationStatus
from app.db.base import Base, TimestampMixin


class Blog(Base, TimestampMixin):
    __tablename__ = "blogs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    trip_id: Mapped[int | None] = mapped_column(ForeignKey("trips.id", ondelete="SET NULL"), nullable=True, index=True)

    title: Mapped[str] = mapped_column(String(200), default="Untitled Journey")
    status: Mapped[GenerationStatus] = mapped_column(Enum(GenerationStatus), default=GenerationStatus.PENDING, index=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    sections: Mapped[list["BlogSection"]] = relationship(back_populates="blog", cascade="all, delete-orphan")


class BlogSection(Base):
    __tablename__ = "blog_sections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    blog_id: Mapped[int] = mapped_column(ForeignKey("blogs.id", ondelete="CASCADE"), index=True)
    order_index: Mapped[int] = mapped_column(default=0)
    heading: Mapped[str] = mapped_column(String(200))
    content: Mapped[str] = mapped_column(Text)

    blog: Mapped["Blog"] = relationship(back_populates="sections")
