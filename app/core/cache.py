"""Small Redis-backed cache helper used by services for expensive/frequent reads.

Degrades gracefully to "no cache" if Redis is unreachable — caching is a
performance optimization, not a correctness requirement, so it must never
turn into an outage.
"""

import json
from typing import Any

from app.core.redis_client import get_redis, mark_failed


def cache_get(key: str) -> Any | None:
    client = get_redis()
    if client is None:
        return None
    try:
        raw = client.get(key)
    except Exception:  # noqa: BLE001
        mark_failed()
        return None
    return json.loads(raw) if raw else None


def cache_set(key: str, value: Any, ttl_seconds: int = 300) -> None:
    client = get_redis()
    if client is None:
        return
    try:
        client.set(key, json.dumps(value), ex=ttl_seconds)
    except Exception:  # noqa: BLE001
        mark_failed()


def cache_delete(*keys: str) -> None:
    client = get_redis()
    if client is None or not keys:
        return
    try:
        client.delete(*keys)
    except Exception:  # noqa: BLE001
        mark_failed()
