"""Splitwise-style trip expense endpoints — nested under a trip the caller owns."""

from fastapi import APIRouter, Depends

from app.api.dependencies import CurrentUser, DbSession
from app.repositories.expense_repository import ExpenseRepository, ParticipantRepository
from app.repositories.trip_repository import TripRepository
from app.schemas.expense import (
    ExpenseCreate,
    ExpenseOut,
    ExpenseSummaryOut,
    ParticipantCreate,
    ParticipantOut,
)
from app.services.expense_service import ExpenseService
from app.services.trip_service import TripService

router = APIRouter(prefix="/trips/{trip_id}", tags=["expenses"])


def _service(db: DbSession) -> ExpenseService:
    return ExpenseService(ParticipantRepository(db), ExpenseRepository(db))


def _ensure_owned(trip_id: int, user, db) -> None:
    TripService(TripRepository(db)).get_owned(trip_id, user.id)


@router.get("/participants", response_model=list[ParticipantOut])
def list_participants(trip_id: int, user: CurrentUser, db: DbSession, service: ExpenseService = Depends(_service)) -> list[ParticipantOut]:
    _ensure_owned(trip_id, user, db)
    return [ParticipantOut.model_validate(p) for p in service.list_participants(trip_id)]


@router.post("/participants", response_model=ParticipantOut, status_code=201)
def add_participant(trip_id: int, payload: ParticipantCreate, user: CurrentUser, db: DbSession, service: ExpenseService = Depends(_service)) -> ParticipantOut:
    _ensure_owned(trip_id, user, db)
    return ParticipantOut.model_validate(service.add_participant(trip_id, payload.name))


@router.delete("/participants/{participant_id}", status_code=204)
def remove_participant(trip_id: int, participant_id: int, user: CurrentUser, db: DbSession, service: ExpenseService = Depends(_service)) -> None:
    _ensure_owned(trip_id, user, db)
    service.remove_participant(participant_id, trip_id)


@router.get("/expenses", response_model=list[ExpenseOut])
def list_expenses(trip_id: int, user: CurrentUser, db: DbSession, service: ExpenseService = Depends(_service)) -> list[ExpenseOut]:
    _ensure_owned(trip_id, user, db)
    return [ExpenseOut.model_validate(e) for e in service.list_expenses(trip_id)]


@router.post("/expenses", response_model=ExpenseOut, status_code=201)
def add_expense(trip_id: int, payload: ExpenseCreate, user: CurrentUser, db: DbSession, service: ExpenseService = Depends(_service)) -> ExpenseOut:
    _ensure_owned(trip_id, user, db)
    expense = service.add_expense(
        trip_id=trip_id, description=payload.description, amount=payload.amount, category=payload.category,
        paid_by_id=payload.paid_by_id, expense_date=payload.expense_date, split_between=payload.split_between,
    )
    return ExpenseOut.model_validate(expense)


@router.delete("/expenses/{expense_id}", status_code=204)
def remove_expense(trip_id: int, expense_id: int, user: CurrentUser, db: DbSession, service: ExpenseService = Depends(_service)) -> None:
    _ensure_owned(trip_id, user, db)
    service.remove_expense(expense_id, trip_id)


@router.get("/expenses/summary/balances", response_model=ExpenseSummaryOut)
def expense_summary(trip_id: int, user: CurrentUser, db: DbSession, service: ExpenseService = Depends(_service)) -> ExpenseSummaryOut:
    _ensure_owned(trip_id, user, db)
    return ExpenseSummaryOut(**service.summary(trip_id))
