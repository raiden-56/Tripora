"""Photo upload, listing, and secure album-sharing endpoints."""

from fastapi import APIRouter, Depends, File, Form, UploadFile

from app.api.dependencies import CurrentUser, DbSession
from app.core.exceptions import AppError, NotFoundError
from app.repositories.photo_repository import PhotoRepository, PhotoShareRepository
from app.schemas.photo import PhotoOut, PhotoShareCreate, PhotoShareOut, PublicPhotoShareOut
from app.services.photo_service import PhotoService

router = APIRouter(tags=["photos"])
MAX_UPLOAD_BYTES = 10 * 1024 * 1024
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}


def _service(db: DbSession) -> PhotoService:
    return PhotoService(PhotoRepository(db), PhotoShareRepository(db))


@router.get("/photos", response_model=list[PhotoOut])
def list_photos(
    user: CurrentUser,
    db: DbSession,
    destination_id: int | None = None,
    trip_id: int | None = None,
    memory_id: int | None = None,
) -> list[PhotoOut]:
    repo = PhotoRepository(db)
    photos = repo.list_for_user(user.id, destination_id=destination_id, trip_id=trip_id, memory_id=memory_id)
    return [PhotoOut.model_validate(p) for p in photos]


@router.post("/photos", response_model=PhotoOut, status_code=201)
async def upload_photo(
    user: CurrentUser,
    file: UploadFile = File(...),
    destination_id: int | None = Form(default=None),
    memory_id: int | None = Form(default=None),
    trip_id: int | None = Form(default=None),
    caption: str | None = Form(default=None),
    service: PhotoService = Depends(_service),
) -> PhotoOut:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise AppError("Only JPEG, PNG, or WEBP images are allowed.", code="INVALID_FILE_TYPE", status_code=422)

    content = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(content) > MAX_UPLOAD_BYTES:
        raise AppError("Image exceeds the 10 MB upload limit.", code="FILE_TOO_LARGE", status_code=422)

    photo = service.upload(
        user_id=user.id,
        content=content,
        content_type=file.content_type,
        filename=file.filename or "photo.jpg",
        destination_id=destination_id,
        memory_id=memory_id,
        trip_id=trip_id,
        caption=caption,
    )
    return PhotoOut.model_validate(photo)


@router.post("/photos/share", response_model=PhotoShareOut, status_code=201)
def share_photos(payload: PhotoShareCreate, user: CurrentUser, service: PhotoService = Depends(_service)) -> PhotoShareOut:
    share = service.create_share(
        user_id=user.id, title=payload.title, description=payload.description,
        photo_ids=payload.photo_ids, is_public=payload.is_public,
    )
    return PhotoShareOut.model_validate(share)


@router.delete("/photos/{photo_id}", status_code=204)
def delete_photo(photo_id: int, user: CurrentUser, service: PhotoService = Depends(_service)) -> None:
    service.delete(photo_id, user.id)


@router.get("/share/{token}", response_model=PublicPhotoShareOut)
def get_public_share(token: str, db: DbSession) -> PublicPhotoShareOut:
    service = _service(db)
    result = service.get_public_share(token)
    if not result:
        raise NotFoundError("This shared album does not exist or is no longer available.", code="SHARE_NOT_FOUND")
    share, photos = result
    return PublicPhotoShareOut(title=share.title, description=share.description, photos=[PhotoOut.model_validate(p) for p in photos])
