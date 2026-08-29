"""Photo animation (GIF) endpoints. Generation runs in the background (Celery if
configured, a FastAPI BackgroundTask fallback otherwise) so the request never
blocks on image processing — see app/tasks/animation_tasks.py."""

from fastapi import APIRouter, BackgroundTasks, Depends

from app.api.dependencies import CurrentUser, DbSession
from app.repositories.photo_animation_repository import PhotoAnimationRepository
from app.repositories.photo_repository import PhotoRepository
from app.schemas.photo_animation import PhotoAnimationCreate, PhotoAnimationOut
from app.services.photo_animation_service import PhotoAnimationService
from app.tasks.animation_tasks import run_animation_generation

router = APIRouter(prefix="/photos/animations", tags=["photo-animations"])


def _service(db: DbSession) -> PhotoAnimationService:
    return PhotoAnimationService(PhotoAnimationRepository(db), PhotoRepository(db))


@router.post("", response_model=PhotoAnimationOut, status_code=202)
def create_animation(
    payload: PhotoAnimationCreate,
    user: CurrentUser,
    background_tasks: BackgroundTasks,
    service: PhotoAnimationService = Depends(_service),
) -> PhotoAnimationOut:
    animation = service.create_pending(
        user.id, title=payload.title, photo_ids=payload.photo_ids, trip_id=payload.trip_id
    )
    run_animation_generation(animation_id=animation.id, user_id=user.id, background_tasks=background_tasks)
    return PhotoAnimationOut.model_validate(animation)


@router.get("", response_model=list[PhotoAnimationOut])
def list_animations(user: CurrentUser, service: PhotoAnimationService = Depends(_service)) -> list[PhotoAnimationOut]:
    return [PhotoAnimationOut.model_validate(a) for a in service.list_for_user(user.id)]


@router.get("/{animation_id}", response_model=PhotoAnimationOut)
def get_animation(
    animation_id: int, user: CurrentUser, service: PhotoAnimationService = Depends(_service)
) -> PhotoAnimationOut:
    return PhotoAnimationOut.model_validate(service.get_owned(animation_id, user.id))


@router.delete("/{animation_id}", status_code=204)
def delete_animation(animation_id: int, user: CurrentUser, service: PhotoAnimationService = Depends(_service)) -> None:
    service.delete(animation_id, user.id)
