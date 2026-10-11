"""Guide booking workflow: request → accept/reject → complete (or cancel)."""

from datetime import date

from app.core.constants import BookingStatus
from app.core.exceptions import AppError, ConflictError, NotFoundError, PermissionDeniedError
from app.models.booking import GuideBooking
from app.repositories.booking_repository import BookingRepository
from app.repositories.guide_repository import GuideRepository
from app.schemas.booking import BookingCreate
from app.services.notification_service import NotificationService

# Who may move a booking from one status to another. Anything not listed is refused,
# so e.g. a traveler can never mark their own booking accepted or completed.
_GUIDE_TRANSITIONS = {
    BookingStatus.PENDING: {BookingStatus.ACCEPTED, BookingStatus.REJECTED},
    BookingStatus.ACCEPTED: {BookingStatus.COMPLETED, BookingStatus.CANCELLED},
}
_TRAVELER_TRANSITIONS = {
    BookingStatus.PENDING: {BookingStatus.CANCELLED},
    BookingStatus.ACCEPTED: {BookingStatus.CANCELLED},
}


class BookingService:
    def __init__(self, repo: BookingRepository, guide_repo: GuideRepository, notifications: NotificationService):
        self.repo = repo
        self.guide_repo = guide_repo
        self.notifications = notifications

    def request_booking(self, *, user_id: int, guide_id: int, payload: BookingCreate) -> GuideBooking:
        guide = self.guide_repo.get(guide_id)
        if not guide:
            raise NotFoundError("Guide not found.", code="GUIDE_NOT_FOUND")
        if guide.user_id == user_id:
            raise AppError("You can't book yourself.", code="SELF_BOOKING", status_code=422)
        if payload.booking_date < date.today():
            raise AppError("Pick a date that isn't in the past.", code="INVALID_DATE", status_code=422)

        booking = GuideBooking(user_id=user_id, guide_id=guide_id, **payload.model_dump())
        booking = self.repo.add(booking)
        self.notifications.notify(
            user_id=guide.user_id,
            message=f"New booking request for {payload.booking_date} ({payload.people_count} people).",
            type_="info",
        )
        return booking

    def get_visible(self, booking_id: int, user_id: int) -> GuideBooking:
        """The traveler who made the booking or the guide it was made with."""
        booking = self.repo.get(booking_id)
        if not booking:
            raise NotFoundError("Booking not found.", code="BOOKING_NOT_FOUND")
        guide = self.guide_repo.get(booking.guide_id)
        if booking.user_id != user_id and (guide is None or guide.user_id != user_id):
            raise PermissionDeniedError("You do not have access to this booking.")
        return booking

    def update_status(self, *, booking_id: int, actor_user_id: int, status: BookingStatus) -> GuideBooking:
        booking = self.repo.get(booking_id)
        if not booking:
            raise NotFoundError("Booking not found.", code="BOOKING_NOT_FOUND")

        guide = self.guide_repo.get(booking.guide_id)
        is_assigned_guide = guide is not None and guide.user_id == actor_user_id
        is_owner = booking.user_id == actor_user_id
        if not (is_owner or is_assigned_guide):
            raise PermissionDeniedError("You cannot modify this booking.")

        allowed = (_GUIDE_TRANSITIONS if is_assigned_guide else _TRAVELER_TRANSITIONS).get(booking.status, set())
        if status not in allowed:
            raise ConflictError(
                f"A {booking.status.value} booking can't be marked {status.value}.", code="INVALID_TRANSITION"
            )

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
