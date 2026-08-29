"""Photo animation (GIF) generation background task — mirrors blog_tasks.py.

Runs as a real Celery task when a worker + broker are available. In local
development without Redis running, run_animation_generation() falls back to a
FastAPI BackgroundTask so the feature still works end-to-end without extra
infrastructure.
"""

from fastapi import BackgroundTasks

from app.core.constants import GenerationStatus
from app.core.logging import get_logger
from app.db.session import SessionLocal
from app.repositories.notification_repository import NotificationRepository
from app.repositories.photo_animation_repository import PhotoAnimationRepository
from app.repositories.photo_repository import PhotoRepository
from app.services.notification_service import NotificationService
from app.services.photo_animation_service import PhotoAnimationService
from app.tasks.celery_app import celery_app, is_broker_available

logger = get_logger(__name__)


def _process(animation_id: int, user_id: int) -> None:
    db = SessionLocal()
    try:
        service = PhotoAnimationService(PhotoAnimationRepository(db), PhotoRepository(db))
        service.process_generation(animation_id)

        animation = service.repo.get(animation_id)
        if not animation:
            return
        if animation.status == GenerationStatus.COMPLETED:
            message, type_ = f'Your animation "{animation.title}" is ready to view.', "success"
        else:
            message, type_ = f'Your animation "{animation.title}" could not be generated.', "warning"
        NotificationService(NotificationRepository(db)).notify(user_id=user_id, message=message, type_=type_)
    finally:
        db.close()


@celery_app.task(name="tasks.generate_animation")
def generate_animation_task(animation_id: int, user_id: int) -> None:
    _process(animation_id, user_id)


def run_animation_generation(*, animation_id: int, user_id: int, background_tasks: BackgroundTasks) -> None:
    if not is_broker_available():
        logger.info("Celery broker unavailable — running animation generation inline via BackgroundTasks.")
        background_tasks.add_task(_process, animation_id, user_id)
        return
    try:
        generate_animation_task.delay(animation_id, user_id)
    except Exception:  # noqa: BLE001 - submission failed even though the broker answered
        logger.info("Could not submit Celery task — running animation generation inline via BackgroundTasks.")
        background_tasks.add_task(_process, animation_id, user_id)
