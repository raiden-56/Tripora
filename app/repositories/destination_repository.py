"""Destination persistence, search, and filtering."""

from sqlalchemy import select

from app.core.constants import DestinationStatus
from app.models.destination import Destination
from app.repositories.base import BaseRepository


class DestinationRepository(BaseRepository[Destination]):
    model = Destination

    def list_for_user(
        self,
        user_id: int,
        *,
        status: DestinationStatus | None = None,
        country: str | None = None,
        state: str | None = None,
        search: str | None = None,
        sort_by: str = "created_at",
        descending: bool = True,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Destination], int]:
        stmt = select(Destination).where(Destination.user_id == user_id)
        if status:
            stmt = stmt.where(Destination.status == status)
        if country:
            stmt = stmt.where(Destination.country == country)
        if state:
            stmt = stmt.where(Destination.state == state)
        if search:
            like = f"%{search.lower()}%"
            stmt = stmt.where(Destination.name.ilike(like))

        total = len(self.db.scalars(stmt).all())

        sort_column = getattr(Destination, sort_by, Destination.created_at)
        stmt = stmt.order_by(sort_column.desc() if descending else sort_column.asc())
        stmt = stmt.offset((page - 1) * page_size).limit(page_size)
        items = list(self.db.scalars(stmt).all())
        return items, total
