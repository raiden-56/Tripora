"""In-app notification endpoints."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.dependencies import CurrentUser, DbSession
from app.repositories.notification_repository import NotificationRepository
from app.schemas.common import Page
from app.schemas.notification import NotificationOut
from app.services.notification_service import NotificationService
from app.utils.pagination import PaginationParams, build_page_meta

router = APIRouter(prefix="/notifications", tags=["notifications"])


def _service(db: DbSession) -> NotificationService:
    return NotificationService(NotificationRepository(db))


@router.get("", response_model=Page[NotificationOut])
def list_notifications(user: CurrentUser, pagination: PaginationParams = Depends(), service: NotificationService = Depends(_service)) -> Page[NotificationOut]:
    items, total = service.list_for_user(user.id, pagination.page, pagination.page_size)
    return Page(data=[NotificationOut.model_validate(n) for n in items], meta=build_page_meta(total, pagination.page, pagination.page_size))


class UnreadCount(BaseModel):
    unread: int


@router.get("/unread-count", response_model=UnreadCount)
def unread_count(user: CurrentUser, service: NotificationService = Depends(_service)) -> UnreadCount:
    return UnreadCount(unread=service.repo.unread_count(user.id))


@router.post("/read-all", status_code=204)
def mark_all_read(user: CurrentUser, service: NotificationService = Depends(_service)) -> None:
    service.repo.mark_all_read(user.id)


@router.patch("/{notification_id}/read", response_model=NotificationOut)
def mark_read(notification_id: int, user: CurrentUser, service: NotificationService = Depends(_service)) -> NotificationOut:
    return NotificationOut.model_validate(service.mark_read(notification_id, user.id))
