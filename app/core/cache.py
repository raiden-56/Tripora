"""Small Redis-backed cache helper used by services for expensive/frequent reads.

Degrades gracefully to "no cache" if Redis is unreachable — caching is a
performance optimization, not a correctness requirement, so it must never
turn into an outage.
"""

import json
from typing import Any

import redis

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)
settings = get_settings()

_client: redis.Redis | None = None
_warned = False


def _get_client() -> redis.Redis | None:
    global _client, _warned
    if _client is not None:
        return _client
    try:
        client = redis.from_url(settings.redis_url, socket_connect_timeout=0.5)
        client.ping()
        _client = client
        return client
    except Exception:  # noqa: BLE001
        if not _warned:
            logger.warning("Redis unavailable — caching is disabled for this process.")
            _warned = True
        return None


def cache_get(key: str) -> Any | None:
    client = _get_client()
    if client is None:
        return None
    raw = client.get(key)
    return json.loads(raw) if raw else None


def cache_set(key: str, value: Any, ttl_seconds: int = 300) -> None:
    client = _get_client()
    if client is None:
        return
    client.set(key, json.dumps(value), ex=ttl_seconds)


def cache_delete(*keys: str) -> None:
    client = _get_client()
    if client is None or not keys:
        return
    client.delete(*keys)
