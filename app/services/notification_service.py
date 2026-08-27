"""Notification creation/read business logic."""

from app.core.exceptions import NotFoundError
from app.models.notification import Notification
from app.repositories.notification_repository import NotificationRepository


class NotificationService:
    def __init__(self, repo: NotificationRepository):
        self.repo = repo

    def notify(self, *, user_id: int, message: str, type_: str = "info") -> Notification:
        notification = Notification(user_id=user_id, message=message, type=type_)
        return self.repo.add(notification)

    def list_for_user(self, user_id: int, page: int, page_size: int):
        return self.repo.list_for_user(user_id, page=page, page_size=page_size)

    def mark_read(self, notification_id: int, user_id: int) -> Notification:
        notification = self.repo.get(notification_id)
        if not notification or notification.user_id != user_id:
            raise NotFoundError("Notification not found.", code="NOTIFICATION_NOT_FOUND")
        return self.repo.mark_read(notification)
