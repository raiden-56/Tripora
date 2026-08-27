"""Trip CRUD endpoints."""

from fastapi import APIRouter, Depends

from app.api.dependencies import CurrentUser, DbSession
from app.repositories.trip_repository import TripRepository
from app.schemas.common import Page
from app.schemas.trip import TripCreate, TripOut, TripUpdate
from app.services.trip_service import TripService
from app.utils.pagination import PaginationParams, build_page_meta

router = APIRouter(prefix="/trips", tags=["trips"])


def _service(db: DbSession) -> TripService:
    return TripService(TripRepository(db))


def _to_out(trip) -> TripOut:
    out = TripOut.model_validate(trip)
    out.destination_ids = TripService.to_destination_ids(trip)
    return out


@router.get("", response_model=Page[TripOut])
def list_trips(user: CurrentUser, pagination: PaginationParams = Depends(), service: TripService = Depends(_service)) -> Page[TripOut]:
    items, total = service.list_trips(user.id, pagination.page, pagination.page_size)
    return Page(data=[_to_out(t) for t in items], meta=build_page_meta(total, pagination.page, pagination.page_size))


@router.get("/{trip_id}", response_model=TripOut)
def get_trip(trip_id: int, user: CurrentUser, service: TripService = Depends(_service)) -> TripOut:
    return _to_out(service.get_owned(trip_id, user.id))


@router.post("", response_model=TripOut, status_code=201)
def create_trip(payload: TripCreate, user: CurrentUser, service: TripService = Depends(_service)) -> TripOut:
    return _to_out(service.create(user.id, payload))


@router.put("/{trip_id}", response_model=TripOut)
def update_trip(trip_id: int, payload: TripUpdate, user: CurrentUser, service: TripService = Depends(_service)) -> TripOut:
    return _to_out(service.update(trip_id, user.id, payload))


@router.delete("/{trip_id}", status_code=204)
def delete_trip(trip_id: int, user: CurrentUser, service: TripService = Depends(_service)) -> None:
    service.delete(trip_id, user.id)
