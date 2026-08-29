"""Memory CRUD endpoints."""

from fastapi import APIRouter, Depends

from app.api.dependencies import CurrentUser, DbSession
from app.repositories.memory_repository import MemoryRepository
from app.schemas.common import Page
from app.schemas.memory import MemoryCreate, MemoryOut, MemoryUpdate
from app.services.memory_service import MemoryService
from app.utils.pagination import PaginationParams, build_page_meta

router = APIRouter(prefix="/memories", tags=["memories"])


def _service(db: DbSession) -> MemoryService:
    return MemoryService(MemoryRepository(db))


def _to_out(memory) -> MemoryOut:
    return MemoryOut.model_validate(memory)


@router.get("", response_model=Page[MemoryOut])
def list_memories(
    user: CurrentUser,
    pagination: PaginationParams = Depends(),
    destination_id: int | None = None,
    trip_id: int | None = None,
    service: MemoryService = Depends(_service),
) -> Page[MemoryOut]:
    items, total = service.list_memories(user.id, destination_id, trip_id, pagination.page, pagination.page_size)
    return Page(data=[_to_out(m) for m in items], meta=build_page_meta(total, pagination.page, pagination.page_size))


@router.get("/{memory_id}", response_model=MemoryOut)
def get_memory(memory_id: int, user: CurrentUser, service: MemoryService = Depends(_service)) -> MemoryOut:
    return _to_out(service.get_owned(memory_id, user.id))


@router.post("", response_model=MemoryOut, status_code=201)
def create_memory(payload: MemoryCreate, user: CurrentUser, service: MemoryService = Depends(_service)) -> MemoryOut:
    return _to_out(service.create(user.id, payload))


@router.put("/{memory_id}", response_model=MemoryOut)
def update_memory(memory_id: int, payload: MemoryUpdate, user: CurrentUser, service: MemoryService = Depends(_service)) -> MemoryOut:
    return _to_out(service.update(memory_id, user.id, payload))


@router.delete("/{memory_id}", status_code=204)
def delete_memory(memory_id: int, user: CurrentUser, service: MemoryService = Depends(_service)) -> None:
    service.delete(memory_id, user.id)
