"""Notification persistence."""

from sqlalchemy import select, update

from app.models.notification import Notification
from app.repositories.base import BaseRepository


class NotificationRepository(BaseRepository[Notification]):
    model = Notification

    def list_for_user(self, user_id: int, page: int = 1, page_size: int = 20) -> tuple[list[Notification], int]:
        stmt = select(Notification).where(Notification.user_id == user_id)
        total = self.count(Notification.user_id == user_id)
        stmt = stmt.order_by(Notification.created_at.desc(), Notification.id.desc()).offset((page - 1) * page_size).limit(page_size)
        return list(self.db.scalars(stmt).all()), total

    def unread_count(self, user_id: int) -> int:
        return self.count(Notification.user_id == user_id, Notification.is_read.is_(False))

    def mark_all_read(self, user_id: int) -> None:
        self.db.execute(
            update(Notification)
            .where(Notification.user_id == user_id, Notification.is_read.is_(False))
            .values(is_read=True)
        )
        self.db.commit()

    def mark_read(self, notification: Notification) -> Notification:
        notification.is_read = True
        self.db.commit()
        self.db.refresh(notification)
        return notification
