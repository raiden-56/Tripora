"""Notification delivery background task (in-app row today; email/push later)."""

from app.db.session import SessionLocal
from app.repositories.notification_repository import NotificationRepository
from app.services.notification_service import NotificationService
from app.tasks.celery_app import celery_app


@celery_app.task(name="tasks.send_notification")
def send_notification_task(user_id: int, message: str, type_: str = "info") -> None:
    db = SessionLocal()
    try:
        NotificationService(NotificationRepository(db)).notify(user_id=user_id, message=message, type_=type_)
    finally:
        db.close()
