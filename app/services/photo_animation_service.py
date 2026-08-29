"""Photo animation (GIF) generation. Request/list/get are synchronous here; the
actual image processing runs in app/tasks/animation_tasks.py via Celery (with a
FastAPI BackgroundTask fallback), mirroring BlogService/blog_tasks.py."""

import io
import secrets

from PIL import Image

from app.core.constants import GenerationStatus
from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.integrations.storage.local_storage import get_storage_service
from app.models.photo_animation import PhotoAnimation
from app.repositories.photo_animation_repository import PhotoAnimationRepository
from app.repositories.photo_repository import PhotoRepository

_CANVAS_SIZE = (720, 720)
_FRAME_DURATION_MS = 800


class PhotoAnimationService:
    def __init__(self, repo: PhotoAnimationRepository, photo_repo: PhotoRepository):
        self.repo = repo
        self.photo_repo = photo_repo
        self.storage = get_storage_service()

    def create_pending(
        self, user_id: int, *, title: str, photo_ids: list[int], trip_id: int | None
    ) -> PhotoAnimation:
        owned = self.photo_repo.get_owned_many(photo_ids, user_id)
        if len(owned) != len(set(photo_ids)):
            raise PermissionDeniedError("You can only animate photos you own.")
        animation = PhotoAnimation(user_id=user_id, trip_id=trip_id, title=title, status=GenerationStatus.PENDING)
        return self.repo.create_with_items(animation, photo_ids)

    def get_owned(self, animation_id: int, user_id: int) -> PhotoAnimation:
        animation = self.repo.get(animation_id)
        if not animation:
            raise NotFoundError("Animation not found.", code="ANIMATION_NOT_FOUND")
        if animation.user_id != user_id:
            raise PermissionDeniedError("You do not have access to this animation.")
        return animation

    def list_for_user(self, user_id: int) -> list[PhotoAnimation]:
        return self.repo.list_for_user(user_id)

    def delete(self, animation_id: int, user_id: int) -> None:
        self.repo.delete(self.get_owned(animation_id, user_id))

    def process_generation(self, animation_id: int) -> None:
        """Builds the actual GIF. Called from the Celery task — kept synchronous/pure
        here so it's independently testable without a worker."""
        animation = self.repo.get(animation_id)
        if not animation:
            return
        animation.status = GenerationStatus.PROCESSING
        self.repo.db.commit()

        try:
            frames = [self._to_frame(item.photo.storage_key) for item in animation.items]
            if not frames:
                raise ValueError("No photos to animate.")

            buffer = io.BytesIO()
            frames[0].save(
                buffer,
                format="GIF",
                save_all=True,
                append_images=frames[1:],
                duration=_FRAME_DURATION_MS,
                loop=0,
            )
            key = f"{animation.user_id}/animations/{secrets.token_hex(8)}.gif"
            animation.output_url = self.storage.save(key=key, content=buffer.getvalue(), content_type="image/gif")
            animation.status = GenerationStatus.COMPLETED
        except Exception as exc:  # noqa: BLE001 - generation failures must not crash the worker
            animation.status = GenerationStatus.FAILED
            animation.error_message = str(exc)
        self.repo.db.commit()

    def _to_frame(self, storage_key: str) -> Image.Image:
        """Loads a source photo and fits it onto a fixed-size canvas so every frame
        in the GIF shares identical dimensions (required for a clean loop)."""
        content = self.storage.load(key=storage_key)
        photo = Image.open(io.BytesIO(content)).convert("RGB")
        photo.thumbnail(_CANVAS_SIZE)
        canvas = Image.new("RGB", _CANVAS_SIZE, (12, 12, 12))
        offset = ((_CANVAS_SIZE[0] - photo.width) // 2, (_CANVAS_SIZE[1] - photo.height) // 2)
        canvas.paste(photo, offset)
        return canvas
