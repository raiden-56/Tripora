"""Subscription + payment orchestration."""

from datetime import date, timedelta

from app.core.constants import SubscriptionStatus
from app.core.exceptions import NotFoundError
from app.integrations.payments.razorpay_provider import get_payment_provider
from app.models.payment import Payment
from app.models.subscription import Subscription
from app.repositories.pricing_repository import PricingRepository, SubscriptionRepository


class PaymentService:
    def __init__(self, plan_repo: PricingRepository, subscription_repo: SubscriptionRepository, db):
        self.plan_repo = plan_repo
        self.subscription_repo = subscription_repo
        self.db = db

    def start_subscription(self, *, user_id: int, plan_code: str, user_email: str) -> tuple[Subscription, Payment]:
        plan = self.plan_repo.get_by_code(plan_code)
        if not plan:
            raise NotFoundError("Pricing plan not found.", code="PLAN_NOT_FOUND")

        provider = get_payment_provider()
        intent = provider.create_payment_intent(amount=plan.price, currency=plan.currency, user_email=user_email)

        subscription = Subscription(
            user_id=user_id,
            plan_id=plan.id,
            status=SubscriptionStatus.PENDING if intent.status == "pending" else SubscriptionStatus.ACTIVE,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30),
            renewal_date=date.today() + timedelta(days=30),
            payment_provider_id=intent.provider_reference,
        )
        self.db.add(subscription)
        self.db.flush()

        payment = Payment(
            user_id=user_id,
            subscription_id=subscription.id,
            amount=plan.price,
            currency=plan.currency,
            provider="razorpay",
            provider_payment_id=intent.provider_reference,
            status=intent.status,
        )
        self.db.add(payment)
        self.db.commit()
        self.db.refresh(subscription)
        self.db.refresh(payment)
        return subscription, payment

    def get_active_subscription(self, user_id: int) -> Subscription | None:
        return self.subscription_repo.get_active_for_user(user_id)
