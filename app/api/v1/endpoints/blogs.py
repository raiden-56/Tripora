"""AI-generated travel-story ("blog") endpoints. Generation runs in the background
(Celery if configured, a FastAPI BackgroundTask fallback otherwise) so the request
never blocks on the AI call — see app/tasks/blog_tasks.py."""

from fastapi import APIRouter, BackgroundTasks, Depends

from app.api.dependencies import CurrentUser, DbSession
from app.core.exceptions import NotFoundError
from app.models.destination import Destination
from app.models.memory import Memory
from app.models.trip import Trip
from app.repositories.blog_repository import BlogRepository
from app.schemas.blog import BlogGenerateRequest, BlogGenerateResponse, BlogOut
from app.services.blog_service import BlogService
from app.tasks.blog_tasks import run_blog_generation

router = APIRouter(prefix="/blogs", tags=["blogs"])


def _service(db: DbSession) -> BlogService:
    return BlogService(BlogRepository(db))


def _gather_facts(db: DbSession, user_id: int, trip_id: int | None, destination_id: int | None) -> tuple[str, dict]:
    if trip_id:
        trip = db.get(Trip, trip_id)
        if not trip or trip.user_id != user_id:
            raise NotFoundError("Trip not found.", code="TRIP_NOT_FOUND")
        memories = [m for m in db.query(Memory).filter(Memory.trip_id == trip_id).all()]
        title = f"The {trip.title} Story"
        facts = {
            "destination_name": trip.title,
            "days": max(1, (trip.end_date - trip.start_date).days + 1),
            "memory_titles": [m.title for m in memories],
            "places": [],
            "rating": None,
        }
        return title, facts

    if destination_id:
        destination = db.get(Destination, destination_id)
        if not destination or destination.user_id != user_id:
            raise NotFoundError("Destination not found.", code="DESTINATION_NOT_FOUND")
        memories = db.query(Memory).filter(Memory.destination_id == destination_id).all()
        title = f"My Journey Through {destination.name}"
        facts = {
            "destination_name": destination.name,
            "days": 1,
            "memory_titles": [m.title for m in memories],
            "places": [],
            "rating": destination.rating,
        }
        return title, facts

    return "My Travel Story", {"destination_name": "my travels", "days": 1, "memory_titles": [], "places": [], "rating": None}


@router.post("/generate", response_model=BlogGenerateResponse, status_code=202)
def generate_blog(
    payload: BlogGenerateRequest,
    user: CurrentUser,
    db: DbSession,
    background_tasks: BackgroundTasks,
    service: BlogService = Depends(_service),
) -> BlogGenerateResponse:
    title, facts = _gather_facts(db, user.id, payload.trip_id, payload.destination_id)
    blog = service.create_pending(user.id, trip_id=payload.trip_id, title=title)
    run_blog_generation(blog_id=blog.id, facts=facts, background_tasks=background_tasks)
    return BlogGenerateResponse(blog_id=blog.id, status=blog.status)


@router.get("", response_model=list[BlogOut])
def list_blogs(user: CurrentUser, service: BlogService = Depends(_service)) -> list[BlogOut]:
    return [BlogOut.model_validate(b) for b in service.list_for_user(user.id)]


@router.get("/{blog_id}", response_model=BlogOut)
def get_blog(blog_id: int, user: CurrentUser, service: BlogService = Depends(_service)) -> BlogOut:
    return BlogOut.model_validate(service.get_owned(blog_id, user.id))


@router.delete("/{blog_id}", status_code=204)
def delete_blog(blog_id: int, user: CurrentUser, service: BlogService = Depends(_service)) -> None:
    service.delete(blog_id, user.id)
