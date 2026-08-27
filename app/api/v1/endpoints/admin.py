"""Admin-only management endpoints — every route requires the ADMIN role."""

from fastapi import APIRouter, Depends
from sqlalchemy import func, select

from app.api.dependencies import DbSession, require_role
from app.core.constants import SubscriptionStatus, UserRole
from app.models.booking import GuideBooking
from app.models.destination import Destination
from app.models.guide import GuideProfile
from app.models.subscription import Subscription
from app.models.user import User
from app.schemas.booking import BookingOut
from app.schemas.guide import GuideOut
from app.schemas.user import UserOut
from app.services.guide_service import GuideService
from app.utils.pagination import PaginationParams, build_page_meta
from app.schemas.common import Page

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_role(UserRole.ADMIN))])


@router.get("/users", response_model=Page[UserOut])
def list_users(db: DbSession, pagination: PaginationParams = Depends()) -> Page[UserOut]:
    stmt = select(User)
    total = len(db.scalars(stmt).all())
    stmt = stmt.order_by(User.created_at.desc()).offset((pagination.page - 1) * pagination.page_size).limit(pagination.page_size)
    users = db.scalars(stmt).all()
    return Page(data=[UserOut.model_validate(u) for u in users], meta=build_page_meta(total, pagination.page, pagination.page_size))


@router.get("/guides", response_model=list[GuideOut])
def list_guides(db: DbSession) -> list[GuideOut]:
    guides = db.scalars(select(GuideProfile)).all()
    out = []
    for g in guides:
        item = GuideOut.model_validate(g)
        item.languages = GuideService.languages_list(g)
        out.append(item)
    return out


@router.get("/bookings", response_model=list[BookingOut])
def list_bookings(db: DbSession) -> list[BookingOut]:
    bookings = db.scalars(select(GuideBooking).order_by(GuideBooking.created_at.desc())).all()
    return [BookingOut.model_validate(b) for b in bookings]


@router.get("/reports", response_model=dict)
def get_reports(db: DbSession) -> dict:
    return {
        "total_users": db.scalar(select(func.count()).select_from(User)) or 0,
        "total_destinations": db.scalar(select(func.count()).select_from(Destination)) or 0,
        "total_guides": db.scalar(select(func.count()).select_from(GuideProfile)) or 0,
        "total_bookings": db.scalar(select(func.count()).select_from(GuideBooking)) or 0,
        "active_subscriptions": db.scalar(
            select(func.count()).select_from(Subscription).where(Subscription.status == SubscriptionStatus.ACTIVE)
        )
        or 0,
    }
