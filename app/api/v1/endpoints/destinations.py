"""Destination CRUD endpoints."""

from fastapi import APIRouter, Depends

from app.api.dependencies import CurrentUser, DbSession
from app.core.constants import DestinationStatus
from app.repositories.destination_repository import DestinationRepository
from app.schemas.common import Page
from app.schemas.destination import DestinationCreate, DestinationOut, DestinationUpdate
from app.services.destination_service import DestinationService
from app.utils.pagination import PaginationParams, build_page_meta

router = APIRouter(prefix="/destinations", tags=["destinations"])


def _service(db: DbSession) -> DestinationService:
    return DestinationService(DestinationRepository(db))


@router.get("", response_model=Page[DestinationOut])
def list_destinations(
    user: CurrentUser,
    pagination: PaginationParams = Depends(),
    status: DestinationStatus | None = None,
    country: str | None = None,
    state: str | None = None,
    search: str | None = None,
    service: DestinationService = Depends(_service),
) -> Page[DestinationOut]:
    items, total = service.list_destinations(
        user.id,
        status=status,
        country=country,
        state=state,
        search=search,
        page=pagination.page,
        page_size=pagination.page_size,
    )
    return Page(
        data=[DestinationOut.model_validate(d) for d in items],
        meta=build_page_meta(total, pagination.page, pagination.page_size),
    )


@router.get("/{destination_id}", response_model=DestinationOut)
def get_destination(destination_id: int, user: CurrentUser, service: DestinationService = Depends(_service)) -> DestinationOut:
    return DestinationOut.model_validate(service.get_owned(destination_id, user.id))


@router.post("", response_model=DestinationOut, status_code=201)
def create_destination(
    payload: DestinationCreate, user: CurrentUser, service: DestinationService = Depends(_service)
) -> DestinationOut:
    return DestinationOut.model_validate(service.create(user.id, payload))


@router.put("/{destination_id}", response_model=DestinationOut)
def update_destination(
    destination_id: int, payload: DestinationUpdate, user: CurrentUser, service: DestinationService = Depends(_service)
) -> DestinationOut:
    return DestinationOut.model_validate(service.update(destination_id, user.id, payload))


@router.delete("/{destination_id}", status_code=204)
def delete_destination(destination_id: int, user: CurrentUser, service: DestinationService = Depends(_service)) -> None:
    service.delete(destination_id, user.id)
