"""Shared, failure-tolerant Redis connection.

Redis is optional (caching, rate limiting, Celery broker): every caller must keep
working when it's down. After a failed connection attempt we remember the failure
for RETRY_AFTER_SECONDS instead of paying a fresh connect timeout on every request,
and callers drop a broken client via mark_failed() so a mid-run outage degrades to
"disabled" rather than raising.
"""

import threading
import time

import redis

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)

RETRY_AFTER_SECONDS = 30.0

_lock = threading.Lock()
_client: redis.Redis | None = None
_failed_at: float | None = None
_disabled = False


def get_redis() -> redis.Redis | None:
    global _client, _failed_at
    if _disabled:
        return None
    if _client is not None:
        return _client
    if _failed_at is not None and time.monotonic() - _failed_at < RETRY_AFTER_SECONDS:
        return None
    with _lock:
        if _client is not None:
            return _client
        try:
            client = redis.from_url(
                get_settings().redis_url, socket_connect_timeout=0.5, socket_timeout=0.5
            )
            client.ping()
        except Exception:  # noqa: BLE001 - any failure means "unavailable"
            if _failed_at is None:
                logger.warning("Redis unavailable — caching, rate limiting and Celery are disabled.")
            _failed_at = time.monotonic()
            return None
        if _failed_at is not None:
            logger.info("Redis reachable again.")
        _client, _failed_at = client, None
        return client


def mark_failed() -> None:
    """Drop the current client after an operation error; the next call re-checks after the back-off."""
    global _client, _failed_at
    with _lock:
        if _client is not None:
            logger.warning("Redis operation failed — treating Redis as unavailable for now.")
        _client, _failed_at = None, time.monotonic()


def disable() -> None:
    """Treat Redis as permanently unavailable (used by tests, so a locally running
    Redis can't leak rate-limit counters or cached data between test runs)."""
    global _client, _disabled
    with _lock:
        _client, _disabled = None, True
