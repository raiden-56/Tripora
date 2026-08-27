"""Pricing plan endpoints — the public website renders these dynamically."""

from fastapi import APIRouter, Depends

from app.api.dependencies import DbSession
from app.repositories.pricing_repository import PricingRepository
from app.schemas.pricing import PricingPlanOut
from app.services.pricing_service import PricingService

router = APIRouter(prefix="/pricing", tags=["pricing"])


def _service(db: DbSession) -> PricingService:
    return PricingService(PricingRepository(db))


@router.get("/plans", response_model=list[PricingPlanOut])
def list_plans(service: PricingService = Depends(_service)) -> list[PricingPlanOut]:
    return [PricingPlanOut(**plan) for plan in service.list_plans()]
