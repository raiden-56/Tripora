"""Celery application instance, shared by all background tasks."""

import redis
from celery import Celery

from app.core.config import get_settings

settings = get_settings()

celery_app = Celery("travel_diaries", broker=settings.redis_url, backend=settings.redis_url)
celery_app.conf.update(task_serializer="json", result_serializer="json", accept_content=["json"])


def is_broker_available() -> bool:
    """A fast, short-timeout check so callers can go straight to a synchronous
    fallback instead of waiting through redis-py/Celery's internal reconnect
    retries (tens of seconds) when no worker/broker is running — the default in
    local dev without Docker."""
    try:
        client = redis.Redis.from_url(settings.redis_url, socket_connect_timeout=0.2, socket_timeout=0.2)
        return bool(client.ping())
    except Exception:  # noqa: BLE001 - any connection failure means "unavailable"
        return False
