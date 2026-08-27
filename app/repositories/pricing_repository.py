"""Subscription plan persistence."""

from sqlalchemy import select

from app.models.subscription import Subscription, SubscriptionPlan
from app.repositories.base import BaseRepository


class PricingRepository(BaseRepository[SubscriptionPlan]):
    model = SubscriptionPlan

    def list_active(self) -> list[SubscriptionPlan]:
        stmt = select(SubscriptionPlan).where(SubscriptionPlan.is_active.is_(True)).order_by(SubscriptionPlan.price.asc())
        return list(self.db.scalars(stmt).all())

    def get_by_code(self, code: str) -> SubscriptionPlan | None:
        stmt = select(SubscriptionPlan).where(SubscriptionPlan.code == code)
        return self.db.scalar(stmt)


class SubscriptionRepository(BaseRepository[Subscription]):
    model = Subscription

    def get_active_for_user(self, user_id: int) -> Subscription | None:
        stmt = select(Subscription).where(Subscription.user_id == user_id).order_by(Subscription.created_at.desc())
        return self.db.scalar(stmt)
