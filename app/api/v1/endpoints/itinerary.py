"""Day-by-day trip itinerary: stops per day, optional day headings, reordering, and
importing a Trip Planner result.

Any trip member can read it; the owner and editors can change it. Day 1 is the trip's
start date. Days beyond the trip's length are still shown (e.g. after the trip was
shortened) so nothing silently disappears.
"""

from datetime import timedelta

from fastapi import APIRouter
from sqlalchemy import delete, func, select

from app.api.dependencies import CurrentUser, DbSession
from app.core.exceptions import AppError, NotFoundError
from app.models.trip import Trip, TripPlan
from app.models.trip_planning import TripItineraryDay, TripItineraryItem
from app.schemas.trip_planning import (
    MAX_ITINERARY_DAYS,
    DayTitleUpdate,
    ImportPlanRequest,
    ItineraryDayOut,
    ItineraryItemCreate,
    ItineraryItemOut,
    ItineraryItemUpdate,
    ItineraryOrderUpdate,
    ItineraryOut,
)
from app.services.reference_guard import ReferenceGuard

router = APIRouter(prefix="/trips/{trip_id}/itinerary", tags=["itinerary"])

MAX_ITEMS_PER_TRIP = 500
_PLAN_KIND = {"place": "place", "activity": "activity", "food": "food"}


def _items(db, trip_id: int) -> list[TripItineraryItem]:
    return list(
        db.scalars(
            select(TripItineraryItem)
            .where(TripItineraryItem.trip_id == trip_id)
            .order_by(TripItineraryItem.day_number, TripItineraryItem.position, TripItineraryItem.id)
        )
    )


def _itinerary(db, trip: Trip) -> ItineraryOut:
    items = _items(db, trip.id)
    titles = {
        d.day_number: d.title
        for d in db.scalars(select(TripItineraryDay).where(TripItineraryDay.trip_id == trip.id))
    }
    trip_days = (trip.end_date - trip.start_date).days + 1
    last_day = max([trip_days, *(i.day_number for i in items), *titles.keys()])
    days = [
        ItineraryDayOut(
            day_number=n,
            date=trip.start_date + timedelta(days=n - 1),
            title=titles.get(n),
            items=[ItineraryItemOut.model_validate(i) for i in items if i.day_number == n],
        )
        for n in range(1, min(last_day, MAX_ITINERARY_DAYS) + 1)
    ]
    return ItineraryOut(days=days, total_cost=round(sum(i.cost or 0 for i in items), 2))


def _next_position(db, trip_id: int, day_number: int) -> int:
    last = db.scalar(
        select(func.max(TripItineraryItem.position)).where(
            TripItineraryItem.trip_id == trip_id, TripItineraryItem.day_number == day_number
        )
    )
    return (last or 0) + 1


def _item(db, trip_id: int, item_id: int) -> TripItineraryItem:
    item = db.get(TripItineraryItem, item_id)
    if item is None or item.trip_id != trip_id:
        raise NotFoundError("Itinerary item not found.", code="ITINERARY_ITEM_NOT_FOUND")
    return item


def _editable_trip(db, trip_id: int, user_id: int) -> Trip:
    ReferenceGuard(db).trip_editable(trip_id, user_id)
    return db.get(Trip, trip_id)


@router.get("", response_model=ItineraryOut)
def get_itinerary(trip_id: int, user: CurrentUser, db: DbSession) -> ItineraryOut:
    ReferenceGuard(db).trip_readable(trip_id, user.id)
    return _itinerary(db, db.get(Trip, trip_id))


@router.post("/items", response_model=ItineraryItemOut, status_code=201)
def add_item(trip_id: int, payload: ItineraryItemCreate, user: CurrentUser, db: DbSession) -> ItineraryItemOut:
    _editable_trip(db, trip_id, user.id)
    count = db.scalar(select(func.count()).where(TripItineraryItem.trip_id == trip_id)) or 0
    if count >= MAX_ITEMS_PER_TRIP:
        raise AppError(f"An itinerary can hold up to {MAX_ITEMS_PER_TRIP} stops.", code="ITINERARY_FULL", status_code=422)
    item = TripItineraryItem(
        trip_id=trip_id,
        position=_next_position(db, trip_id, payload.day_number),
        **payload.model_dump() | {"title": payload.title.strip()},
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return ItineraryItemOut.model_validate(item)


@router.patch("/items/{item_id}", response_model=ItineraryItemOut)
def update_item(
    trip_id: int, item_id: int, payload: ItineraryItemUpdate, user: CurrentUser, db: DbSession
) -> ItineraryItemOut:
    _editable_trip(db, trip_id, user.id)
    item = _item(db, trip_id, item_id)
    data = payload.model_dump(exclude_unset=True)
    if "day_number" in data and data["day_number"] != item.day_number:
        item.position = _next_position(db, trip_id, data["day_number"])  # moved: goes last
    for field, value in data.items():
        setattr(item, field, value.strip() if field == "title" else value)
    db.commit()
    db.refresh(item)
    return ItineraryItemOut.model_validate(item)


@router.delete("/items/{item_id}", status_code=204)
def delete_item(trip_id: int, item_id: int, user: CurrentUser, db: DbSession) -> None:
    _editable_trip(db, trip_id, user.id)
    db.delete(_item(db, trip_id, item_id))
    db.commit()


@router.put("/order", response_model=ItineraryOut)
def reorder(trip_id: int, payload: ItineraryOrderUpdate, user: CurrentUser, db: DbSession) -> ItineraryOut:
    """Places the listed items on the given days, in the given order."""
    trip = _editable_trip(db, trip_id, user.id)
    by_id = {i.id: i for i in _items(db, trip_id)}
    listed = [item_id for day in payload.days for item_id in day.item_ids]
    if len(listed) != len(set(listed)) or not set(listed) <= by_id.keys():
        raise AppError("The order lists an unknown or repeated stop.", code="INVALID_ORDER", status_code=422)
    for day in payload.days:
        for position, item_id in enumerate(day.item_ids, start=1):
            by_id[item_id].day_number = day.day_number
            by_id[item_id].position = position
    db.commit()
    return _itinerary(db, trip)


@router.put("/days/{day_number}", response_model=ItineraryOut)
def set_day_title(
    trip_id: int, day_number: int, payload: DayTitleUpdate, user: CurrentUser, db: DbSession
) -> ItineraryOut:
    trip = _editable_trip(db, trip_id, user.id)
    if not 1 <= day_number <= MAX_ITINERARY_DAYS:
        raise AppError("That day is outside the itinerary.", code="INVALID_DAY", status_code=422)
    row = db.scalar(
        select(TripItineraryDay).where(TripItineraryDay.trip_id == trip_id, TripItineraryDay.day_number == day_number)
    )
    title = payload.title.strip()
    if not title:
        if row is not None:
            db.delete(row)
    elif row is None:
        db.add(TripItineraryDay(trip_id=trip_id, day_number=day_number, title=title))
    else:
        row.title = title
    db.commit()
    return _itinerary(db, trip)


@router.post("/import-plan", response_model=ItineraryOut)
def import_plan(trip_id: int, payload: ImportPlanRequest, user: CurrentUser, db: DbSession) -> ItineraryOut:
    """Copies a Trip Planner result into this trip's itinerary (day N of the plan → day N)."""
    trip = _editable_trip(db, trip_id, user.id)
    plan = db.get(TripPlan, payload.plan_id)
    if plan is None or plan.user_id != user.id:
        raise NotFoundError("Plan not found.", code="PLAN_NOT_FOUND")

    if payload.mode == "replace":
        db.execute(delete(TripItineraryItem).where(TripItineraryItem.trip_id == trip_id))
        db.execute(delete(TripItineraryDay).where(TripItineraryDay.trip_id == trip_id))
        db.flush()

    for day in sorted(plan.days_detail, key=lambda d: d.day_number):
        if day.day_number > MAX_ITINERARY_DAYS:
            break
        existing_title = db.scalar(
            select(TripItineraryDay).where(
                TripItineraryDay.trip_id == trip_id, TripItineraryDay.day_number == day.day_number
            )
        )
        if existing_title is None:
            db.add(TripItineraryDay(trip_id=trip_id, day_number=day.day_number, title=day.title[:200]))
        position = _next_position(db, trip_id, day.day_number)
        for offset, activity in enumerate(sorted(day.activities, key=lambda a: a.order_index)):
            db.add(
                TripItineraryItem(
                    trip_id=trip_id,
                    day_number=day.day_number,
                    position=position + offset,
                    title=activity.description[:200],
                    kind=_PLAN_KIND.get(activity.kind, "activity"),
                )
            )
        db.flush()
    plan.trip_id = trip_id
    db.commit()
    return _itinerary(db, trip)
