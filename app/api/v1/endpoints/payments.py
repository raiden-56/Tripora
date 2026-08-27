"""Subscription + payment endpoints."""

from pydantic import BaseModel, ConfigDict

from fastapi import APIRouter, Depends

from app.api.dependencies import CurrentUser, DbSession
from app.repositories.pricing_repository import PricingRepository, SubscriptionRepository
from app.services.payment_service import PaymentService

router = APIRouter(tags=["payments"])


class SubscribeRequest(BaseModel):
    plan_code: str


class SubscriptionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    plan_id: int
    status: str


class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    amount: float
    currency: str
    status: str
    provider_payment_id: str | None


class SubscribeResponse(BaseModel):
    subscription: SubscriptionOut
    payment: PaymentOut


def _service(db: DbSession) -> PaymentService:
    return PaymentService(PricingRepository(db), SubscriptionRepository(db), db)


@router.post("/subscriptions", response_model=SubscribeResponse, status_code=201)
def subscribe(payload: SubscribeRequest, user: CurrentUser, service: PaymentService = Depends(_service)) -> SubscribeResponse:
    subscription, payment = service.start_subscription(user_id=user.id, plan_code=payload.plan_code, user_email=user.email)
    return SubscribeResponse(
        subscription=SubscriptionOut(id=subscription.id, plan_id=subscription.plan_id, status=subscription.status.value),
        payment=PaymentOut.model_validate(payment),
    )


@router.get("/subscriptions/me", response_model=SubscriptionOut | None)
def get_my_subscription(user: CurrentUser, service: PaymentService = Depends(_service)) -> SubscriptionOut | None:
    subscription = service.get_active_subscription(user.id)
    if not subscription:
        return None
    return SubscriptionOut(id=subscription.id, plan_id=subscription.plan_id, status=subscription.status.value)
