"""AI blog generation background task.

Runs as a real Celery task when a worker + broker are available (see
docker-compose.yml's `worker` service). In local development without Redis
running, run_blog_generation() falls back to a FastAPI BackgroundTask so the
feature still works end-to-end without extra infrastructure.
"""

from fastapi import BackgroundTasks

from app.core.logging import get_logger
from app.db.session import SessionLocal
from app.repositories.blog_repository import BlogRepository
from app.services.blog_service import BlogService
from app.tasks.celery_app import celery_app, is_broker_available

logger = get_logger(__name__)


def _process(blog_id: int, facts: dict) -> None:
    db = SessionLocal()
    try:
        BlogService(BlogRepository(db)).process_generation(blog_id, facts)
    finally:
        db.close()


@celery_app.task(name="tasks.generate_blog")
def generate_blog_task(blog_id: int, facts: dict) -> None:
    _process(blog_id, facts)


def run_blog_generation(*, blog_id: int, facts: dict, background_tasks: BackgroundTasks) -> None:
    if not is_broker_available():
        logger.info("Celery broker unavailable — running blog generation inline via BackgroundTasks.")
        background_tasks.add_task(_process, blog_id, facts)
        return
    try:
        generate_blog_task.delay(blog_id, facts)
    except Exception:  # noqa: BLE001 - submission failed even though the broker answered
        logger.info("Could not submit Celery task — running blog generation inline via BackgroundTasks.")
        background_tasks.add_task(_process, blog_id, facts)
