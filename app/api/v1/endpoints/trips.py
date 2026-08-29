"""Trip CRUD endpoints."""

from fastapi import APIRouter, Depends

from app.api.dependencies import CurrentUser, DbSession
from app.core.exceptions import PermissionDeniedError
from app.repositories.notification_repository import NotificationRepository
from app.repositories.trip_collaborator_repository import TripCollaboratorRepository
from app.repositories.trip_repository import TripRepository
from app.repositories.user_repository import UserRepository
from app.schemas.common import Page
from app.schemas.trip import TripCreate, TripOut, TripUpdate
from app.services.notification_service import NotificationService
from app.services.trip_collaborator_service import TripCollaboratorService
from app.services.trip_service import TripService
from app.utils.pagination import PaginationParams, build_page_meta

router = APIRouter(prefix="/trips", tags=["trips"])


def _service(db: DbSession) -> TripService:
    return TripService(TripRepository(db))


def _collab_service(db: DbSession) -> TripCollaboratorService:
    return TripCollaboratorService(
        TripCollaboratorRepository(db),
        TripRepository(db),
        UserRepository(db),
        NotificationService(NotificationRepository(db)),
    )


def _to_out(trip, role: str = "owner") -> TripOut:
    out = TripOut.model_validate(trip)
    out.destination_ids = TripService.to_destination_ids(trip)
    out.role = role
    return out


@router.get("", response_model=Page[TripOut])
def list_trips(
    user: CurrentUser,
    pagination: PaginationParams = Depends(),
    service: TripService = Depends(_service),
    collab: TripCollaboratorService = Depends(_collab_service),
) -> Page[TripOut]:
    items, total = service.list_trips(user.id, pagination.page, pagination.page_size)
    data = [_to_out(t, collab.get_access_role(t.id, user.id) or "owner") for t in items]
    return Page(data=data, meta=build_page_meta(total, pagination.page, pagination.page_size))


@router.get("/{trip_id}", response_model=TripOut)
def get_trip(
    trip_id: int,
    user: CurrentUser,
    service: TripService = Depends(_service),
    collab: TripCollaboratorService = Depends(_collab_service),
) -> TripOut:
    trip = service.get_or_404(trip_id)
    role = collab.get_access_role(trip_id, user.id)
    if role is None:
        raise PermissionDeniedError("You do not have access to this trip.")
    return _to_out(trip, role)


@router.post("", response_model=TripOut, status_code=201)
def create_trip(payload: TripCreate, user: CurrentUser, service: TripService = Depends(_service)) -> TripOut:
    return _to_out(service.create(user.id, payload))


@router.put("/{trip_id}", response_model=TripOut)
def update_trip(trip_id: int, payload: TripUpdate, user: CurrentUser, service: TripService = Depends(_service)) -> TripOut:
    return _to_out(service.update(trip_id, user.id, payload))


@router.delete("/{trip_id}", status_code=204)
def delete_trip(trip_id: int, user: CurrentUser, service: TripService = Depends(_service)) -> None:
    service.delete(trip_id, user.id)
