"""AI trip-planner endpoints."""

from fastapi import APIRouter, Depends

from app.api.dependencies import CurrentUser, DbSession
from app.middleware.rate_limit import RateLimiter
from app.core.config import get_settings
from app.core.exceptions import NotFoundError
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


def _owned_plan(service: PlannerService, plan_id: int, user_id: int):
    plan = service.repo.get(plan_id)
    if plan is None or plan.user_id != user_id:
        raise NotFoundError("Plan not found.", code="PLAN_NOT_FOUND")
    return plan


@router.get("/{plan_id}", response_model=TripPlanOut)
def get_plan(plan_id: int, user: CurrentUser, service: PlannerService = Depends(_service)) -> TripPlanOut:
    return TripPlanOut.model_validate(_owned_plan(service, plan_id, user.id))


@router.delete("/{plan_id}", status_code=204)
def delete_plan(plan_id: int, user: CurrentUser, service: PlannerService = Depends(_service)) -> None:
    service.repo.delete(_owned_plan(service, plan_id, user.id))


@router.get("", response_model=list[TripPlanOut])
def list_plans(user: CurrentUser, service: PlannerService = Depends(_service)) -> list[TripPlanOut]:
    return [TripPlanOut.model_validate(p) for p in service.list_for_user(user.id)]
