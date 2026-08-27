"""Notification persistence."""

from sqlalchemy import select

from app.models.notification import Notification
from app.repositories.base import BaseRepository


class NotificationRepository(BaseRepository[Notification]):
    model = Notification

    def list_for_user(self, user_id: int, page: int = 1, page_size: int = 20) -> tuple[list[Notification], int]:
        stmt = select(Notification).where(Notification.user_id == user_id)
        total = len(self.db.scalars(stmt).all())
        stmt = stmt.order_by(Notification.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        return list(self.db.scalars(stmt).all()), total

    def mark_read(self, notification: Notification) -> Notification:
        notification.is_read = True
        self.db.commit()
        self.db.refresh(notification)
        return notification
