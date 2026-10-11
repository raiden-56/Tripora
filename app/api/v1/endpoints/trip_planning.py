"""Trip checklist and planned-budget endpoints.

Any trip member can read; the owner and editors can change. Actual spend in the
budget view is summed from the trip's expenses, per category.
"""

from fastapi import APIRouter
from sqlalchemy import func, select

from app.api.dependencies import CurrentUser, DbSession
from app.core.exceptions import AppError, NotFoundError
from app.models.expense import TripExpense
from app.models.trip_planning import TripBudgetItem, TripChecklistItem
from app.schemas.trip_planning import (
    BudgetLineOut,
    BudgetOut,
    BudgetUpdate,
    ChecklistItemCreate,
    ChecklistItemOut,
    ChecklistItemUpdate,
)
from app.services.reference_guard import ReferenceGuard

router = APIRouter(prefix="/trips/{trip_id}", tags=["trip-planning"])

MAX_CHECKLIST_ITEMS = 200


def _checklist(db, trip_id: int) -> list[TripChecklistItem]:
    stmt = (
        select(TripChecklistItem)
        .where(TripChecklistItem.trip_id == trip_id)
        .order_by(TripChecklistItem.position, TripChecklistItem.id)
    )
    return list(db.scalars(stmt))


def _item(db, trip_id: int, item_id: int) -> TripChecklistItem:
    item = db.get(TripChecklistItem, item_id)
    if item is None or item.trip_id != trip_id:
        raise NotFoundError("Checklist item not found.", code="CHECKLIST_ITEM_NOT_FOUND")
    return item


@router.get("/checklist", response_model=list[ChecklistItemOut])
def list_checklist(trip_id: int, user: CurrentUser, db: DbSession) -> list[ChecklistItemOut]:
    ReferenceGuard(db).trip_readable(trip_id, user.id)
    return [ChecklistItemOut.model_validate(i) for i in _checklist(db, trip_id)]


@router.post("/checklist", response_model=ChecklistItemOut, status_code=201)
def add_checklist_item(trip_id: int, payload: ChecklistItemCreate, user: CurrentUser, db: DbSession) -> ChecklistItemOut:
    ReferenceGuard(db).trip_editable(trip_id, user.id)
    count, last = db.execute(
        select(func.count(), func.max(TripChecklistItem.position)).where(TripChecklistItem.trip_id == trip_id)
    ).one()
    if count >= MAX_CHECKLIST_ITEMS:
        raise AppError(f"A checklist can hold up to {MAX_CHECKLIST_ITEMS} items.", code="CHECKLIST_FULL", status_code=422)
    item = TripChecklistItem(trip_id=trip_id, text=payload.text.strip(), position=(last or 0) + 1)
    db.add(item)
    db.commit()
    db.refresh(item)
    return ChecklistItemOut.model_validate(item)


@router.patch("/checklist/{item_id}", response_model=ChecklistItemOut)
def update_checklist_item(
    trip_id: int, item_id: int, payload: ChecklistItemUpdate, user: CurrentUser, db: DbSession
) -> ChecklistItemOut:
    ReferenceGuard(db).trip_editable(trip_id, user.id)
    item = _item(db, trip_id, item_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value.strip() if isinstance(value, str) else value)
    db.commit()
    db.refresh(item)
    return ChecklistItemOut.model_validate(item)


@router.delete("/checklist/{item_id}", status_code=204)
def delete_checklist_item(trip_id: int, item_id: int, user: CurrentUser, db: DbSession) -> None:
    ReferenceGuard(db).trip_editable(trip_id, user.id)
    db.delete(_item(db, trip_id, item_id))
    db.commit()


def _budget(db, trip_id: int) -> BudgetOut:
    planned = {
        b.category: b.planned_amount
        for b in db.scalars(select(TripBudgetItem).where(TripBudgetItem.trip_id == trip_id).order_by(TripBudgetItem.id))
    }
    spent = dict(
        db.execute(
            select(TripExpense.category, func.sum(TripExpense.amount))
            .where(TripExpense.trip_id == trip_id)
            .group_by(TripExpense.category)
        ).all()
    )
    categories = list(planned) + sorted(c for c in spent if c not in planned)
    lines = [
        BudgetLineOut(category=c, planned_amount=planned.get(c, 0.0), spent=round(float(spent.get(c) or 0.0), 2))
        for c in categories
    ]
    return BudgetOut(
        lines=lines,
        total_planned=round(sum(line.planned_amount for line in lines), 2),
        total_spent=round(sum(line.spent for line in lines), 2),
    )


@router.get("/budget", response_model=BudgetOut)
def get_budget(trip_id: int, user: CurrentUser, db: DbSession) -> BudgetOut:
    ReferenceGuard(db).trip_readable(trip_id, user.id)
    return _budget(db, trip_id)


@router.put("/budget", response_model=BudgetOut)
def replace_budget(trip_id: int, payload: BudgetUpdate, user: CurrentUser, db: DbSession) -> BudgetOut:
    """Replaces the planned budget with exactly the given categories."""
    ReferenceGuard(db).trip_editable(trip_id, user.id)
    existing = {b.category: b for b in db.scalars(select(TripBudgetItem).where(TripBudgetItem.trip_id == trip_id))}
    wanted = {item.category.strip(): item.planned_amount for item in payload.items}
    for category, row in existing.items():
        if category not in wanted:
            db.delete(row)
    for category, amount in wanted.items():
        if category in existing:
            existing[category].planned_amount = amount
        else:
            db.add(TripBudgetItem(trip_id=trip_id, category=category, planned_amount=amount))
    db.commit()
    return _budget(db, trip_id)
