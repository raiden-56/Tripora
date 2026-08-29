"""Photo metadata + shareable-album persistence."""

from sqlalchemy import select

from app.models.photo import Photo, PhotoShare, PhotoShareItem
from app.repositories.base import BaseRepository


class PhotoRepository(BaseRepository[Photo]):
    model = Photo

    def list_for_user(self, user_id: int, *, destination_id: int | None = None, trip_id: int | None = None, memory_id: int | None = None):
        stmt = select(Photo).where(Photo.user_id == user_id)
        if destination_id:
            stmt = stmt.where(Photo.destination_id == destination_id)
        if trip_id:
            stmt = stmt.where(Photo.trip_id == trip_id)
        if memory_id:
            stmt = stmt.where(Photo.memory_id == memory_id)
        return list(self.db.scalars(stmt.order_by(Photo.created_at.desc())).all())

    def get_owned_many(self, ids: list[int], user_id: int) -> list[Photo]:
        stmt = select(Photo).where(Photo.id.in_(ids), Photo.user_id == user_id)
        return list(self.db.scalars(stmt).all())

    def list_for_trip(self, trip_id: int) -> list[Photo]:
        """All photos on a shared trip, regardless of which collaborator uploaded them."""
        stmt = select(Photo).where(Photo.trip_id == trip_id).order_by(Photo.created_at.desc())
        return list(self.db.scalars(stmt).all())


class PhotoShareRepository(BaseRepository[PhotoShare]):
    model = PhotoShare

    def get_by_token(self, token: str) -> PhotoShare | None:
        stmt = select(PhotoShare).where(PhotoShare.share_token == token, PhotoShare.is_public.is_(True))
        return self.db.scalar(stmt)

    def create_with_items(self, share: PhotoShare, photo_ids: list[int]) -> PhotoShare:
        self.db.add(share)
        self.db.flush()
        for photo_id in photo_ids:
            self.db.add(PhotoShareItem(photo_share_id=share.id, photo_id=photo_id))
        self.db.commit()
        self.db.refresh(share)
        return share
