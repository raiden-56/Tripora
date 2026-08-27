"""Guide marketplace business logic."""

from app.core.constants import UserRole
from app.core.exceptions import ConflictError, NotFoundError, PermissionDeniedError
from app.models.guide import GuideProfile, GuideReview
from app.models.user import User
from app.repositories.guide_repository import GuideRepository
from app.schemas.guide import GuideCreate, GuideReviewCreate
from app.utils.validators import csv_to_list, list_to_csv


class GuideService:
    def __init__(self, repo: GuideRepository, db=None):
        self.repo = repo
        self.db = db if db is not None else repo.db

    def search(self, **filters) -> tuple[list[GuideProfile], int]:
        return self.repo.search(**filters)

    def get(self, guide_id: int) -> GuideProfile:
        guide = self.repo.get(guide_id)
        if not guide:
            raise NotFoundError("Guide not found.", code="GUIDE_NOT_FOUND")
        return guide

    def create_profile(self, user: User, payload: GuideCreate) -> GuideProfile:
        """Self-service "Become a Guide" — any authenticated user may apply;
        their account role is upgraded to GUIDE once their profile is created."""
        if self.repo.get_by_user_id(user.id):
            raise ConflictError("A guide profile already exists for this account.")
        data = payload.model_dump(exclude={"languages"})
        guide = GuideProfile(user_id=user.id, languages=list_to_csv(payload.languages), **data)
        guide = self.repo.add(guide)
        if user.role == UserRole.USER:
            user.role = UserRole.GUIDE
            self.db.commit()
        return guide

    def add_review(self, *, guide_id: int, user_id: int, payload: GuideReviewCreate, booking_belongs_to_user: bool) -> GuideReview:
        if not booking_belongs_to_user:
            raise PermissionDeniedError("You can only review your own completed bookings.")
        if self.repo.review_exists_for_booking(payload.booking_id):
            raise ConflictError("This booking has already been reviewed.", code="ALREADY_REVIEWED")
        review = GuideReview(
            guide_id=guide_id, user_id=user_id, booking_id=payload.booking_id,
            rating=payload.rating, comment=payload.comment,
        )
        return self.repo.add_review(review)

    @staticmethod
    def languages_list(guide: GuideProfile) -> list[str]:
        return csv_to_list(guide.languages)
