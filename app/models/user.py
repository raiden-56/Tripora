"""User, profile, and refresh-token models."""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import UserRole
from app.db.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.USER, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    profile: Mapped["UserProfile"] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan")
    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class UserProfile(Base, TimestampMixin):
    """Extended, editable profile + travel preferences (section 66/67 of the spec)."""

    __tablename__ = "user_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)

    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    home_location: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Travel preferences — feed the recommendation/planner services.
    preferred_travel_style: Mapped[str | None] = mapped_column(String(50), nullable=True)
    budget_preference: Mapped[str | None] = mapped_column(String(50), nullable=True)
    favorite_activities: Mapped[str | None] = mapped_column(String(500), nullable=True)  # comma-separated
    trip_duration_preference: Mapped[str | None] = mapped_column(String(50), nullable=True)
    group_size_preference: Mapped[str | None] = mapped_column(String(50), nullable=True)

    visibility: Mapped[str] = mapped_column(String(20), default="private")  # private | friends | public
    handle: Mapped[str | None] = mapped_column(String(60), unique=True, nullable=True, index=True)

    user: Mapped["User"] = relationship(back_populates="profile")


class RefreshToken(Base):
    """Stores a hash of issued refresh tokens so they can be revoked (rotation-safe)."""

    __tablename__ = "refresh_tokens"
    __table_args__ = (UniqueConstraint("token_hash", name="uq_refresh_token_hash"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(255), index=True)
    revoked: Mapped[bool] = mapped_column(Boolean, default=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    user: Mapped["User"] = relationship(back_populates="refresh_tokens")
