"""Trip planner: generates a structured, persisted day-by-day itinerary.

Uses the configured AI provider (Claude when AI_API_KEY is set) and falls back to a
deterministic rule-based plan whenever the AI is unavailable or returns something
unusable, so planning always works. `TripPlan.generated_by` records which one ran.
"""

from app.core.logging import get_logger
from app.integrations.ai import AIUnavailableError, get_ai_provider
from app.models.trip import TripPlan
from app.repositories.trip_repository import TripPlanRepository
from app.schemas.trip import PlannerRequest

logger = get_logger(__name__)

_ACTIVITY_POOL = [
    "Sunrise viewpoint visit", "Local market walk", "Waterfall visit", "Heritage site tour",
    "Nature trail hike", "Lakeside relaxation", "Photography stop", "Local cuisine tasting",
]
_FOOD_POOL = [
    "Local breakfast at a roadside cafe", "Regional thali for lunch",
    "Street food trail", "Rooftop dinner with a view",
]
_KINDS = {"place", "activity", "food"}
MAX_ACTIVITIES_PER_DAY = 8


class PlannerService:
    def __init__(self, repo: TripPlanRepository):
        self.repo = repo

    def generate(self, user_id: int, request: PlannerRequest) -> TripPlan:
        plan_fields, days_payload, generated_by = self._ai_plan(request) or self._rule_plan(request)
        plan = TripPlan(
            user_id=user_id,
            origin=request.origin,
            destination_name=request.destination,
            days=request.days,
            people=request.people,
            budget=request.budget,
            travel_style=request.travel_style,
            interests=",".join(request.interests) if request.interests else None,
            generated_by=generated_by,
            **plan_fields,
        )
        return self.repo.create_with_days(plan, days_payload)

    def _ai_plan(self, request: PlannerRequest) -> tuple[dict, list[dict], str] | None:
        provider = get_ai_provider()
        try:
            raw = provider.plan_trip(request=request.model_dump())
        except AIUnavailableError as exc:
            if provider.name != "template":
                logger.info("AI planner unavailable (%s); using the rule-based plan.", exc)
            return None

        days = raw.get("days") or []
        if len(days) < request.days:
            logger.warning("AI plan had %s of %s days; using the rule-based plan.", len(days), request.days)
            return None
        days_payload = []
        for number, day in enumerate(days[: request.days], start=1):
            activities = [
                {"kind": a["kind"] if a.get("kind") in _KINDS else "activity", "description": str(a["description"]).strip()[:300]}
                for a in (day.get("activities") or [])[:MAX_ACTIVITIES_PER_DAY]
                if str(a.get("description", "")).strip()
            ]
            if not activities:
                return None
            title = str(day.get("title") or f"Day {number}").strip()[:200]
            days_payload.append({"day_number": number, "title": title, "activities": activities})

        low, high = _number(raw.get("estimated_budget_min")), _number(raw.get("estimated_budget_max"))
        if low is not None and high is not None and low > high:
            low, high = high, low
        fields = {
            "estimated_budget_min": low,
            "estimated_budget_max": high,
            "distance_km": _number(raw.get("distance_km")),
            "route_description": (str(raw.get("route_description") or "").strip()[:300] or None),
        }
        return fields, days_payload, provider.name

    def _rule_plan(self, request: PlannerRequest) -> tuple[dict, list[dict], str]:
        days_payload = []
        for i in range(request.days):
            if i == 0:
                title = f"Arrival in {request.destination}"
            elif i == request.days - 1:
                title = f"Last day & return to {request.origin}"
            else:
                title = f"Exploring {request.destination}"

            activities = [
                {"kind": "activity", "description": _ACTIVITY_POOL[i % len(_ACTIVITY_POOL)]},
                {"kind": "activity", "description": _ACTIVITY_POOL[(i + 3) % len(_ACTIVITY_POOL)]},
                {"kind": "food", "description": _FOOD_POOL[i % len(_FOOD_POOL)]},
            ]
            days_payload.append({"day_number": i + 1, "title": title, "activities": activities})

        # The rule-based planner has no real distance or cost data, so it doesn't invent any.
        fields = {
            "estimated_budget_min": None,
            "estimated_budget_max": None,
            "distance_km": None,
            "route_description": f"{request.origin} → {request.destination}",
        }
        return fields, days_payload, "rules"

    def list_for_user(self, user_id: int) -> list[TripPlan]:
        return self.repo.list_for_user(user_id)


def _number(value) -> float | None:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return round(number, 2) if number >= 0 else None
