"""AI trip-planner endpoints."""

from fastapi import APIRouter, Depends

from app.api.dependencies import CurrentUser, DbSession
from app.middleware.rate_limit import RateLimiter
from app.core.config import get_settings
from app.repositories.trip_repository import TripPlanRepository
from app.schemas.trip import PlannerRequest, TripPlanOut
from app.services.planner_service import PlannerService

settings = get_settings()
router = APIRouter(prefix="/planner", tags=["planner"])


def _service(db: DbSession) -> PlannerService:
    return PlannerService(TripPlanRepository(db))


@router.post(
    "/generate",
    response_model=TripPlanOut,
    dependencies=[Depends(RateLimiter(times=settings.rate_limit_ai_per_minute, seconds=60))],
)
def generate_plan(payload: PlannerRequest, user: CurrentUser, service: PlannerService = Depends(_service)) -> TripPlanOut:
    return TripPlanOut.model_validate(service.generate(user.id, payload))


@router.get("", response_model=list[TripPlanOut])
def list_plans(user: CurrentUser, service: PlannerService = Depends(_service)) -> list[TripPlanOut]:
    return [TripPlanOut.model_validate(p) for p in service.list_for_user(user.id)]
