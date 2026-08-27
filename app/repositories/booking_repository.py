"""Guide booking persistence."""

from sqlalchemy import select

from app.models.booking import GuideBooking
from app.repositories.base import BaseRepository


class BookingRepository(BaseRepository[GuideBooking]):
    model = GuideBooking

    def list_for_user(self, user_id: int) -> list[GuideBooking]:
        stmt = select(GuideBooking).where(GuideBooking.user_id == user_id).order_by(GuideBooking.booking_date.desc())
        return list(self.db.scalars(stmt).all())

    def list_for_guide(self, guide_id: int) -> list[GuideBooking]:
        stmt = select(GuideBooking).where(GuideBooking.guide_id == guide_id).order_by(GuideBooking.booking_date.desc())
        return list(self.db.scalars(stmt).all())
