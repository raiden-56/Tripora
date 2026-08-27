"""Trip planner: generates a structured, persisted day-by-day itinerary.

Rule-based today (deterministic, no external API dependency); the interface
(PlannerRequest in -> TripPlan out) is exactly what a real AI-backed planner
would fill in, so swapping the generation strategy later requires no API
contract changes.
"""

from app.models.trip import TripPlan
from app.repositories.trip_repository import TripPlanRepository
from app.schemas.trip import PlannerRequest

_ACTIVITY_POOL = [
    "Sunrise viewpoint visit", "Local market walk", "Waterfall visit", "Heritage site tour",
    "Nature trail hike", "Lakeside relaxation", "Photography stop", "Local cuisine tasting",
]
_FOOD_POOL = [
    "Local breakfast at a roadside cafe", "Regional thali for lunch",
    "Street food trail", "Rooftop dinner with a view",
]


class PlannerService:
    def __init__(self, repo: TripPlanRepository):
        self.repo = repo

    def generate(self, user_id: int, request: PlannerRequest) -> TripPlan:
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

        estimated_min = round(request.budget * 0.85, 2)
        estimated_max = round(request.budget, 2)
        distance_km = round(60 + request.days * 45, 1)

        plan = TripPlan(
            user_id=user_id,
            origin=request.origin,
            destination_name=request.destination,
            days=request.days,
            people=request.people,
            budget=request.budget,
            travel_style=request.travel_style,
            interests=",".join(request.interests) if request.interests else None,
            estimated_budget_min=estimated_min,
            estimated_budget_max=estimated_max,
            distance_km=distance_km,
            route_description=f"{request.origin} → {request.destination} via the most direct highway route",
        )
        return self.repo.create_with_days(plan, days_payload)

    def list_for_user(self, user_id: int) -> list[TripPlan]:
        return self.repo.list_for_user(user_id)
