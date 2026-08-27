"""Google Drive folder link endpoints — stores/validates the URL only (see
integrations/google_drive for what a real API integration would add)."""

from fastapi import APIRouter, Depends

from app.api.dependencies import CurrentUser, DbSession
from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.models.drive_link import GoogleDriveLink
from app.repositories.drive_link_repository import DriveLinkRepository
from app.schemas.drive_link import DriveLinkCreate, DriveLinkOut

router = APIRouter(prefix="/drive-links", tags=["google-drive"])


@router.get("", response_model=list[DriveLinkOut])
def list_drive_links(
    user: CurrentUser,
    db: DbSession,
    destination_id: int | None = None,
    trip_id: int | None = None,
) -> list[DriveLinkOut]:
    repo = DriveLinkRepository(db)
    return [DriveLinkOut.model_validate(link) for link in repo.list_for_user(user.id, destination_id=destination_id, trip_id=trip_id)]


@router.post("", response_model=DriveLinkOut, status_code=201)
def create_drive_link(payload: DriveLinkCreate, user: CurrentUser, db: DbSession) -> DriveLinkOut:
    repo = DriveLinkRepository(db)
    link = GoogleDriveLink(user_id=user.id, **payload.model_dump())
    return DriveLinkOut.model_validate(repo.add(link))


@router.delete("/{link_id}", status_code=204)
def delete_drive_link(link_id: int, user: CurrentUser, db: DbSession) -> None:
    repo = DriveLinkRepository(db)
    link = repo.get(link_id)
    if not link:
        raise NotFoundError("Drive link not found.", code="DRIVE_LINK_NOT_FOUND")
    if link.user_id != user.id:
        raise PermissionDeniedError("You do not have access to this Drive link.")
    repo.delete(link)
