"""Celery application instance, shared by all background tasks."""

from celery import Celery

from app.core.config import get_settings

settings = get_settings()

celery_app = Celery("travel_diaries", broker=settings.redis_url, backend=settings.redis_url)
celery_app.conf.update(task_serializer="json", result_serializer="json", accept_content=["json"])
