"""Photo upload + secure album-sharing business logic."""

import secrets
from datetime import datetime, timezone

from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.integrations.storage.local_storage import get_storage_service
from app.models.photo import Photo, PhotoShare
from app.repositories.photo_repository import PhotoRepository, PhotoShareRepository
from app.services.reference_guard import ReferenceGuard
from app.services.trip_collaborator_service import TripCollaboratorService
from app.utils.images import inspect_image


class PhotoService:
    def __init__(self, repo: PhotoRepository, share_repo: PhotoShareRepository, trip_access: TripCollaboratorService):
        self.repo = repo
        self.share_repo = share_repo
        self.trip_access = trip_access
        self.storage = get_storage_service()
        self.guard = ReferenceGuard(repo.db)

    def list_for_user(
        self,
        user_id: int,
        *,
        destination_id: int | None = None,
        trip_id: int | None = None,
        memory_id: int | None = None,
    ) -> list[Photo]:
        if trip_id is not None:
            if self.trip_access.get_access_role(trip_id, user_id) is None:
                raise PermissionDeniedError("You do not have access to this trip's photos.")
            return self.repo.list_for_trip(trip_id)
        return self.repo.list_for_user(user_id, destination_id=destination_id, memory_id=memory_id)

    def upload(
        self,
        *,
        user_id: int,
        content: bytes,
        destination_id: int | None,
        memory_id: int | None,
        trip_id: int | None,
        caption: str | None,
    ) -> Photo:
        if trip_id is not None and self.trip_access.get_access_role(trip_id, user_id) not in ("owner", "editor"):
            raise PermissionDeniedError("You do not have permission to add photos to this trip.")
        self.guard.destination(destination_id, user_id)
        self.guard.memory(memory_id, user_id)

        image = inspect_image(content)
        # The stored name is entirely server-generated: no client filename, so no
        # path tricks, and the extension always matches the verified image format.
        safe_name = f"{user_id}/{secrets.token_hex(16)}.{image.extension}"
        url = self.storage.save(key=safe_name, content=content, content_type=image.content_type)
        photo = Photo(
            user_id=user_id,
            destination_id=destination_id,
            memory_id=memory_id,
            trip_id=trip_id,
            storage_key=safe_name,
            url=url,
            caption=caption,
            taken_at=image.taken_at or datetime.now(timezone.utc),
        )
        return self.repo.add(photo)

    def create_share(self, *, user_id: int, title: str, description: str | None, photo_ids: list[int], is_public: bool) -> PhotoShare:
        owned = self.repo.get_owned_many(photo_ids, user_id)
        if len(owned) != len(set(photo_ids)):
            raise PermissionDeniedError("You can only share photos you own.")

        share = PhotoShare(
            user_id=user_id,
            share_token=secrets.token_urlsafe(16),
            title=title,
            description=description,
            is_public=is_public,
        )
        return self.share_repo.create_with_items(share, photo_ids)

    def get_public_share(self, token: str) -> tuple[PhotoShare, list[Photo]] | None:
        share = self.share_repo.get_by_token(token)
        if not share:
            return None
        photos = [item.photo for item in share.items]
        return share, photos

    def delete(self, photo_id: int, user_id: int) -> None:
        photo = self.repo.get(photo_id)
        if not photo:
            raise NotFoundError("Photo not found.", code="PHOTO_NOT_FOUND")
        if photo.user_id != user_id:
            raise PermissionDeniedError("You do not have access to this photo.")
        self.storage.delete(key=photo.storage_key)
        self.repo.delete(photo)
