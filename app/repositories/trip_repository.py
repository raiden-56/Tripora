"""Trip + trip-plan persistence."""

from sqlalchemy import select

from app.models.trip import Trip, TripDestination, TripPlan, TripPlanActivity, TripPlanDay
from app.repositories.base import BaseRepository


class TripRepository(BaseRepository[Trip]):
    model = Trip

    def list_for_user(self, user_id: int, page: int = 1, page_size: int = 20) -> tuple[list[Trip], int]:
        stmt = select(Trip).where(Trip.user_id == user_id)
        total = len(self.db.scalars(stmt).all())
        stmt = stmt.order_by(Trip.start_date.asc()).offset((page - 1) * page_size).limit(page_size)
        return list(self.db.scalars(stmt).all()), total

    def set_destinations(self, trip: Trip, destination_ids: list[int]) -> None:
        for link in list(trip.destinations):
            self.db.delete(link)
        for index, dest_id in enumerate(destination_ids):
            self.db.add(TripDestination(trip_id=trip.id, destination_id=dest_id, order_index=index))
        self.db.commit()
        self.db.refresh(trip)


class TripPlanRepository(BaseRepository[TripPlan]):
    model = TripPlan

    def list_for_user(self, user_id: int) -> list[TripPlan]:
        stmt = select(TripPlan).where(TripPlan.user_id == user_id).order_by(TripPlan.created_at.desc())
        return list(self.db.scalars(stmt).all())

    def create_with_days(self, plan: TripPlan, days: list[dict]) -> TripPlan:
        self.db.add(plan)
        self.db.flush()
        for day in days:
            day_row = TripPlanDay(trip_plan_id=plan.id, day_number=day["day_number"], title=day["title"])
            self.db.add(day_row)
            self.db.flush()
            for idx, activity in enumerate(day["activities"]):
                self.db.add(
                    TripPlanActivity(
                        trip_plan_day_id=day_row.id,
                        kind=activity["kind"],
                        description=activity["description"],
                        order_index=idx,
                    )
                )
        self.db.commit()
        self.db.refresh(plan)
        return plan
