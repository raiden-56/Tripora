"""Guide booking workflow: request → accept/reject → complete."""

from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.core.constants import BookingStatus
from app.models.booking import GuideBooking
from app.repositories.booking_repository import BookingRepository
from app.repositories.guide_repository import GuideRepository
from app.schemas.booking import BookingCreate
from app.services.notification_service import NotificationService


class BookingService:
    def __init__(self, repo: BookingRepository, guide_repo: GuideRepository, notifications: NotificationService):
        self.repo = repo
        self.guide_repo = guide_repo
        self.notifications = notifications

    def request_booking(self, *, user_id: int, guide_id: int, payload: BookingCreate) -> GuideBooking:
        guide = self.guide_repo.get(guide_id)
        if not guide:
            raise NotFoundError("Guide not found.", code="GUIDE_NOT_FOUND")

        booking = GuideBooking(user_id=user_id, guide_id=guide_id, **payload.model_dump())
        booking = self.repo.add(booking)
        self.notifications.notify(
            user_id=guide.user_id,
            message=f"New booking request for {payload.booking_date} ({payload.people_count} people).",
            type_="info",
        )
        return booking

    def get_owned_by_user(self, booking_id: int, user_id: int) -> GuideBooking:
        booking = self.repo.get(booking_id)
        if not booking:
            raise NotFoundError("Booking not found.", code="BOOKING_NOT_FOUND")
        if booking.user_id != user_id:
            raise PermissionDeniedError("You do not have access to this booking.")
        return booking

    def update_status(self, *, booking_id: int, actor_user_id: int, actor_is_guide: bool, status: BookingStatus) -> GuideBooking:
        booking = self.repo.get(booking_id)
        if not booking:
            raise NotFoundError("Booking not found.", code="BOOKING_NOT_FOUND")

        guide = self.guide_repo.get(booking.guide_id)
        is_owner = booking.user_id == actor_user_id
        is_assigned_guide = actor_is_guide and guide is not None and guide.user_id == actor_user_id
        if not (is_owner or is_assigned_guide):
            raise PermissionDeniedError("You cannot modify this booking.")

        booking.status = status
        booking = self.repo.add(booking)
        self.notifications.notify(
            user_id=booking.user_id if is_assigned_guide else guide.user_id,
            message=f"Your booking on {booking.booking_date} is now {status.value}.",
            type_="success" if status == BookingStatus.ACCEPTED else "info",
        )
        return booking

    def list_for_user(self, user_id: int) -> list[GuideBooking]:
        return self.repo.list_for_user(user_id)

    def list_for_guide(self, guide_id: int) -> list[GuideBooking]:
        return self.repo.list_for_guide(guide_id)
