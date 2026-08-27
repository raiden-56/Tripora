"""Memory persistence."""

from sqlalchemy import select

from app.models.memory import Memory
from app.repositories.base import BaseRepository


class MemoryRepository(BaseRepository[Memory]):
    model = Memory

    def list_for_user(
        self,
        user_id: int,
        *,
        destination_id: int | None = None,
        trip_id: int | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Memory], int]:
        stmt = select(Memory).where(Memory.user_id == user_id)
        if destination_id:
            stmt = stmt.where(Memory.destination_id == destination_id)
        if trip_id:
            stmt = stmt.where(Memory.trip_id == trip_id)

        total = len(self.db.scalars(stmt).all())
        stmt = stmt.order_by(Memory.memory_date.desc()).offset((page - 1) * page_size).limit(page_size)
        return list(self.db.scalars(stmt).all()), total
