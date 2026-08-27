"""Memory business logic."""

from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.models.memory import Memory
from app.repositories.memory_repository import MemoryRepository
from app.schemas.memory import MemoryCreate, MemoryUpdate
from app.utils.validators import csv_to_list, list_to_csv


class MemoryService:
    def __init__(self, repo: MemoryRepository):
        self.repo = repo

    def list_memories(self, user_id: int, destination_id: int | None, trip_id: int | None, page: int, page_size: int):
        return self.repo.list_for_user(
            user_id, destination_id=destination_id, trip_id=trip_id, page=page, page_size=page_size
        )

    def get_owned(self, memory_id: int, user_id: int) -> Memory:
        memory = self.repo.get(memory_id)
        if not memory:
            raise NotFoundError("Memory not found.", code="MEMORY_NOT_FOUND")
        if memory.user_id != user_id:
            raise PermissionDeniedError("You do not have access to this memory.")
        return memory

    def create(self, user_id: int, payload: MemoryCreate) -> Memory:
        data = payload.model_dump(exclude={"tags"})
        memory = Memory(user_id=user_id, tags=list_to_csv(payload.tags), **data)
        return self.repo.add(memory)

    def update(self, memory_id: int, user_id: int, payload: MemoryUpdate) -> Memory:
        memory = self.get_owned(memory_id, user_id)
        data = payload.model_dump(exclude_unset=True, exclude={"tags"})
        for field, value in data.items():
            setattr(memory, field, value)
        if payload.tags is not None:
            memory.tags = list_to_csv(payload.tags)
        return self.repo.add(memory)

    def delete(self, memory_id: int, user_id: int) -> None:
        memory = self.get_owned(memory_id, user_id)
        self.repo.delete(memory)

    @staticmethod
    def tags_list(memory: Memory) -> list[str]:
        return csv_to_list(memory.tags)
