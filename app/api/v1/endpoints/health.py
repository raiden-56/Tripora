"""Liveness/readiness health check — used by Docker healthchecks and monitoring."""

from fastapi import APIRouter
from sqlalchemy import text

from app.core.config import get_settings
from app.db.session import SessionLocal

router = APIRouter(tags=["health"])
settings = get_settings()

APP_VERSION = "0.1.0"


@router.get("/health")
def health_check() -> dict:
    db_status = "ok"
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
    except Exception:  # noqa: BLE001
        db_status = "unavailable"

    redis_status = "ok"
    try:
        import redis

        client = redis.from_url(settings.redis_url, socket_connect_timeout=0.5)
        client.ping()
    except Exception:  # noqa: BLE001
        redis_status = "unavailable"

    return {
        "status": "ok" if db_status == "ok" else "degraded",
        "version": APP_VERSION,
        "database": db_status,
        "redis": redis_status,
    }
