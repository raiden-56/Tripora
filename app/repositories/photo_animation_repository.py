"""Photo animation persistence."""

from sqlalchemy import select

from app.models.photo_animation import PhotoAnimation, PhotoAnimationItem
from app.repositories.base import BaseRepository


class PhotoAnimationRepository(BaseRepository[PhotoAnimation]):
    model = PhotoAnimation

    def list_for_user(self, user_id: int) -> list[PhotoAnimation]:
        stmt = (
            select(PhotoAnimation)
            .where(PhotoAnimation.user_id == user_id)
            .order_by(PhotoAnimation.created_at.desc())
        )
        return list(self.db.scalars(stmt).all())

    def create_with_items(self, animation: PhotoAnimation, photo_ids: list[int]) -> PhotoAnimation:
        self.db.add(animation)
        self.db.flush()
        for index, photo_id in enumerate(photo_ids):
            self.db.add(PhotoAnimationItem(photo_animation_id=animation.id, photo_id=photo_id, order_index=index))
        self.db.commit()
        self.db.refresh(animation)
        return animation
