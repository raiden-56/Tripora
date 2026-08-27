"""Guide search, profile, booking, and review endpoints."""

from fastapi import APIRouter, Depends

from app.api.dependencies import CurrentUser, DbSession
from app.core.constants import BookingStatus, UserRole
from app.repositories.booking_repository import BookingRepository
from app.repositories.guide_repository import GuideRepository
from app.schemas.booking import BookingCreate, BookingOut, BookingStatusUpdate
from app.schemas.common import Page
from app.schemas.guide import GuideCreate, GuideOut, GuideReviewCreate, GuideReviewOut
from app.services.booking_service import BookingService
from app.services.guide_service import GuideService
from app.services.notification_service import NotificationService
from app.repositories.notification_repository import NotificationRepository
from app.utils.pagination import PaginationParams, build_page_meta

router = APIRouter(tags=["guides"])


def _guide_service(db: DbSession) -> GuideService:
    return GuideService(GuideRepository(db))


def _booking_service(db: DbSession) -> BookingService:
    return BookingService(BookingRepository(db), GuideRepository(db), NotificationService(NotificationRepository(db)))


def _guide_out(guide) -> GuideOut:
    out = GuideOut.model_validate(guide)
    out.languages = GuideService.languages_list(guide)
    return out


@router.get("/guides", response_model=Page[GuideOut])
def search_guides(
    pagination: PaginationParams = Depends(),
    destination_name: str | None = None,
    min_rating: float | None = None,
    max_price: float | None = None,
    language: str | None = None,
    service: GuideService = Depends(_guide_service),
) -> Page[GuideOut]:
    items, total = service.search(
        destination_name=destination_name, min_rating=min_rating, max_price=max_price,
        language=language, page=pagination.page, page_size=pagination.page_size,
    )
    return Page(data=[_guide_out(g) for g in items], meta=build_page_meta(total, pagination.page, pagination.page_size))


@router.get("/guides/{guide_id}", response_model=GuideOut)
def get_guide(guide_id: int, service: GuideService = Depends(_guide_service)) -> GuideOut:
    return _guide_out(service.get(guide_id))


@router.get("/guides/me/profile", response_model=GuideOut | None)
def get_my_guide_profile(user: CurrentUser, service: GuideService = Depends(_guide_service)) -> GuideOut | None:
    guide = service.repo.get_by_user_id(user.id)
    return _guide_out(guide) if guide else None


@router.post("/guides", response_model=GuideOut, status_code=201)
def create_guide_profile(payload: GuideCreate, user: CurrentUser, db: DbSession, service: GuideService = Depends(_guide_service)) -> GuideOut:
    return _guide_out(GuideService(service.repo, db).create_profile(user, payload))


@router.post("/guides/{guide_id}/booking", response_model=BookingOut, status_code=201)
def request_booking(guide_id: int, payload: BookingCreate, user: CurrentUser, service: BookingService = Depends(_booking_service)) -> BookingOut:
    return BookingOut.model_validate(service.request_booking(user_id=user.id, guide_id=guide_id, payload=payload))


@router.post("/guides/{guide_id}/reviews", response_model=GuideReviewOut, status_code=201)
def review_guide(
    guide_id: int,
    payload: GuideReviewCreate,
    user: CurrentUser,
    db: DbSession,
    guide_service: GuideService = Depends(_guide_service),
) -> GuideReviewOut:
    booking = BookingRepository(db).get(payload.booking_id)
    belongs_to_user = bool(booking and booking.user_id == user.id and booking.status == BookingStatus.COMPLETED)
    review = guide_service.add_review(guide_id=guide_id, user_id=user.id, payload=payload, booking_belongs_to_user=belongs_to_user)
    return GuideReviewOut.model_validate(review)


@router.get("/bookings", response_model=list[BookingOut])
def list_my_bookings(user: CurrentUser, service: BookingService = Depends(_booking_service)) -> list[BookingOut]:
    return [BookingOut.model_validate(b) for b in service.list_for_user(user.id)]


@router.get("/bookings/received", response_model=list[BookingOut])
def list_bookings_received(
    user: CurrentUser, guide_service: GuideService = Depends(_guide_service), service: BookingService = Depends(_booking_service)
) -> list[BookingOut]:
    guide = guide_service.repo.get_by_user_id(user.id)
    if not guide:
        return []
    return [BookingOut.model_validate(b) for b in service.list_for_guide(guide.id)]


@router.get("/bookings/{booking_id}", response_model=BookingOut)
def get_booking(booking_id: int, user: CurrentUser, service: BookingService = Depends(_booking_service)) -> BookingOut:
    return BookingOut.model_validate(service.get_owned_by_user(booking_id, user.id))


@router.patch("/bookings/{booking_id}", response_model=BookingOut)
def update_booking_status(booking_id: int, payload: BookingStatusUpdate, user: CurrentUser, service: BookingService = Depends(_booking_service)) -> BookingOut:
    is_guide = user.role == UserRole.GUIDE
    return BookingOut.model_validate(
        service.update_status(booking_id=booking_id, actor_user_id=user.id, actor_is_guide=is_guide, status=payload.status)
    )
