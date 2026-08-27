"""Subscription plans and a user's active subscription."""

from datetime import date

from sqlalchemy import Boolean, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import SubscriptionStatus
from app.db.base import Base, TimestampMixin


class SubscriptionPlan(Base, TimestampMixin):
    __tablename__ = "subscription_plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(30), unique=True, index=True)  # free | pro | premium
    name: Mapped[str] = mapped_column(String(100))
    price: Mapped[float] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String(10), default="INR")
    billing_period: Mapped[str] = mapped_column(String(20), default="month")
    features: Mapped[str] = mapped_column(String(1000))  # comma-separated, rendered as a list by the frontend
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Subscription(Base, TimestampMixin):
    __tablename__ = "subscriptions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    plan_id: Mapped[int] = mapped_column(ForeignKey("subscription_plans.id"))
    status: Mapped[SubscriptionStatus] = mapped_column(Enum(SubscriptionStatus), default=SubscriptionStatus.PENDING, index=True)

    start_date: Mapped[date | None] = mapped_column(nullable=True)
    end_date: Mapped[date | None] = mapped_column(nullable=True)
    renewal_date: Mapped[date | None] = mapped_column(nullable=True)
    payment_provider_id: Mapped[str | None] = mapped_column(String(150), nullable=True)

    plan: Mapped["SubscriptionPlan"] = relationship()
