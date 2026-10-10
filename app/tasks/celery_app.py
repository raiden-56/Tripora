"""Celery application instance, shared by all background tasks."""

from celery import Celery

from app.core.config import get_settings
from app.core.redis_client import get_redis

settings = get_settings()

# `include` makes the worker (`celery -A app.tasks.celery_app worker`) import the task
# modules on startup — without it the tasks are never registered and queued jobs sit
# "pending" forever.
celery_app = Celery(
    "travel_diaries",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.tasks.blog_tasks", "app.tasks.animation_tasks", "app.tasks.notification_tasks"],
)
celery_app.conf.update(task_serializer="json", result_serializer="json", accept_content=["json"])


def is_broker_available() -> bool:
    """A fast check so callers can go straight to a synchronous fallback instead of
    waiting through redis-py/Celery's internal reconnect retries (tens of seconds)
    when no worker/broker is running — the default in local dev without Docker."""
    return get_redis() is not None
