"""Google Drive link persistence."""

from sqlalchemy import select

from app.models.drive_link import GoogleDriveLink
from app.repositories.base import BaseRepository


class DriveLinkRepository(BaseRepository[GoogleDriveLink]):
    model = GoogleDriveLink

    def list_for_user(self, user_id: int, *, destination_id: int | None = None, trip_id: int | None = None):
        stmt = select(GoogleDriveLink).where(GoogleDriveLink.user_id == user_id)
        if destination_id:
            stmt = stmt.where(GoogleDriveLink.destination_id == destination_id)
        if trip_id:
            stmt = stmt.where(GoogleDriveLink.trip_id == trip_id)
        return list(self.db.scalars(stmt).all())
