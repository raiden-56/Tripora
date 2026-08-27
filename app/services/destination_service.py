"""Destination business logic — CRUD with ownership enforcement."""

from app.core.constants import DestinationStatus
from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.models.destination import Destination
from app.repositories.destination_repository import DestinationRepository
from app.schemas.destination import DestinationCreate, DestinationUpdate


class DestinationService:
    def __init__(self, repo: DestinationRepository):
        self.repo = repo

    def list_destinations(
        self,
        user_id: int,
        *,
        status: DestinationStatus | None,
        country: str | None,
        state: str | None,
        search: str | None,
        page: int,
        page_size: int,
    ) -> tuple[list[Destination], int]:
        return self.repo.list_for_user(
            user_id, status=status, country=country, state=state, search=search, page=page, page_size=page_size
        )

    def get_owned(self, destination_id: int, user_id: int) -> Destination:
        destination = self.repo.get(destination_id)
        if not destination:
            raise NotFoundError("Destination not found.", code="DESTINATION_NOT_FOUND")
        if destination.user_id != user_id:
            raise PermissionDeniedError("You do not have access to this destination.")
        return destination

    def create(self, user_id: int, payload: DestinationCreate) -> Destination:
        destination = Destination(user_id=user_id, **payload.model_dump())
        return self.repo.add(destination)

    def update(self, destination_id: int, user_id: int, payload: DestinationUpdate) -> Destination:
        destination = self.get_owned(destination_id, user_id)
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(destination, field, value)
        return self.repo.add(destination)

    def delete(self, destination_id: int, user_id: int) -> None:
        destination = self.get_owned(destination_id, user_id)
        self.repo.delete(destination)
