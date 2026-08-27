"""Guide profile + review persistence."""

from sqlalchemy import func, select

from app.models.guide import GuideProfile, GuideReview
from app.repositories.base import BaseRepository


class GuideRepository(BaseRepository[GuideProfile]):
    model = GuideProfile

    def search(
        self,
        *,
        destination_name: str | None = None,
        min_rating: float | None = None,
        max_price: float | None = None,
        language: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[GuideProfile], int]:
        stmt = select(GuideProfile)
        if destination_name:
            stmt = stmt.where(GuideProfile.destination_name.ilike(f"%{destination_name}%"))
        if min_rating is not None:
            stmt = stmt.where(GuideProfile.rating_avg >= min_rating)
        if max_price is not None:
            stmt = stmt.where(GuideProfile.price_per_day <= max_price)
        if language:
            stmt = stmt.where(GuideProfile.languages.ilike(f"%{language}%"))

        total = len(self.db.scalars(stmt).all())
        stmt = stmt.order_by(GuideProfile.rating_avg.desc()).offset((page - 1) * page_size).limit(page_size)
        return list(self.db.scalars(stmt).all()), total

    def get_by_user_id(self, user_id: int) -> GuideProfile | None:
        stmt = select(GuideProfile).where(GuideProfile.user_id == user_id)
        return self.db.scalar(stmt)

    def add_review(self, review: GuideReview) -> GuideReview:
        self.db.add(review)
        self.db.commit()
        self.db.refresh(review)
        self._recalculate_rating(review.guide_id)
        return review

    def _recalculate_rating(self, guide_id: int) -> None:
        stmt = select(func.avg(GuideReview.rating), func.count(GuideReview.id)).where(GuideReview.guide_id == guide_id)
        avg_rating, count = self.db.execute(stmt).one()
        guide = self.get(guide_id)
        if guide:
            guide.rating_avg = round(float(avg_rating or 0), 2)
            guide.rating_count = int(count or 0)
            self.db.commit()

    def review_exists_for_booking(self, booking_id: int) -> bool:
        stmt = select(GuideReview).where(GuideReview.booking_id == booking_id)
        return self.db.scalar(stmt) is not None
