"""Admin-only management endpoints — every route requires the ADMIN role."""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import func, or_, select, update

from app.api.dependencies import CurrentUser, DbSession, require_role
from app.core.constants import DestinationStatus, SubscriptionStatus, UserRole
from app.core.exceptions import AppError, NotFoundError
from app.models.booking import GuideBooking
from app.models.community import CommunityPost
from app.models.destination import Destination
from app.models.guide import GuideProfile
from app.models.memory import Memory
from app.models.photo import Photo
from app.models.subscription import Subscription
from app.models.trip import Trip
from app.models.user import RefreshToken, User
from app.schemas.booking import BookingOut
from app.schemas.common import Page, PatchModel
from app.schemas.guide import GuideOut
from app.services.guide_service import GuideService
from app.utils.pagination import PaginationParams, build_page_meta

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_role(UserRole.ADMIN))])


class AdminUserOut(BaseModel):
    id: int
    email: str
    name: str
    role: UserRole
    is_active: bool
    created_at: datetime
    destinations: int
    trips: int


class AdminUserUpdate(PatchModel):
    required_fields = frozenset({"is_active", "role"})

    is_active: bool | None = None
    role: UserRole | None = None


class GuideVerification(BaseModel):
    is_verified: bool


class NamedCount(BaseModel):
    name: str
    count: int


class AdminReport(BaseModel):
    total_users: int
    active_users: int
    new_users_30d: int
    total_destinations: int
    total_trips: int
    total_memories: int
    total_photos: int
    total_posts: int
    total_guides: int
    unverified_guides: int
    total_bookings: int
    active_subscriptions: int
    signups_by_month: list[NamedCount]
    popular_destinations: list[NamedCount]
    popular_states: list[NamedCount]


def _count(db, model, *where) -> int:
    return db.scalar(select(func.count()).select_from(model).where(*where)) or 0


def _admin_users(db, users: list[User]) -> list[AdminUserOut]:
    ids = [u.id for u in users]
    dest_counts = dict(
        db.execute(select(Destination.user_id, func.count()).where(Destination.user_id.in_(ids)).group_by(Destination.user_id)).all()
    )
    trip_counts = dict(
        db.execute(select(Trip.user_id, func.count()).where(Trip.user_id.in_(ids)).group_by(Trip.user_id)).all()
    )
    return [
        AdminUserOut(
            id=u.id, email=u.email, name=u.name, role=u.role, is_active=u.is_active, created_at=u.created_at,
            destinations=dest_counts.get(u.id, 0), trips=trip_counts.get(u.id, 0),
        )
        for u in users
    ]


@router.get("/users", response_model=Page[AdminUserOut])
def list_users(
    db: DbSession,
    pagination: PaginationParams = Depends(),
    search: str | None = Query(default=None, max_length=100),
    role: UserRole | None = None,
    active: bool | None = None,
) -> Page[AdminUserOut]:
    filters = []
    if search:
        pattern = f"%{search.strip().lower()}%"
        filters.append(or_(func.lower(User.email).like(pattern), func.lower(User.name).like(pattern)))
    if role is not None:
        filters.append(User.role == role)
    if active is not None:
        filters.append(User.is_active.is_(active))
    total = _count(db, User, *filters)
    users = list(
        db.scalars(
            select(User)
            .where(*filters)
            .order_by(User.created_at.desc(), User.id.desc())
            .offset((pagination.page - 1) * pagination.page_size)
            .limit(pagination.page_size)
        )
    )
    return Page(data=_admin_users(db, users), meta=build_page_meta(total, pagination.page, pagination.page_size))


@router.patch("/users/{user_id}", response_model=AdminUserOut)
def update_user(user_id: int, payload: AdminUserUpdate, admin: CurrentUser, db: DbSession) -> AdminUserOut:
    target = db.get(User, user_id)
    if target is None:
        raise NotFoundError("User not found.", code="USER_NOT_FOUND")
    data = payload.model_dump(exclude_unset=True)
    if target.id == admin.id and (data.get("is_active") is False or data.get("role", UserRole.ADMIN) != UserRole.ADMIN):
        raise AppError("You can't deactivate or demote your own account.", code="SELF_LOCKOUT", status_code=422)
    for field, value in data.items():
        setattr(target, field, value)
    if data.get("is_active") is False:
        # Sign them out everywhere: refresh tokens stop working immediately and the
        # current access token expires within its short lifetime.
        db.execute(update(RefreshToken).where(RefreshToken.user_id == target.id).values(revoked=True))
    db.commit()
    db.refresh(target)
    return _admin_users(db, [target])[0]


@router.get("/guides", response_model=list[GuideOut])
def list_guides(db: DbSession) -> list[GuideOut]:
    guides = db.scalars(select(GuideProfile).order_by(GuideProfile.is_verified, GuideProfile.id.desc())).all()
    out = []
    for g in guides:
        item = GuideOut.model_validate(g)
        item.languages = GuideService.languages_list(g)
        out.append(item)
    return out


@router.patch("/guides/{guide_id}", response_model=GuideOut)
def verify_guide(guide_id: int, payload: GuideVerification, db: DbSession) -> GuideOut:
    guide = db.get(GuideProfile, guide_id)
    if guide is None:
        raise NotFoundError("Guide not found.", code="GUIDE_NOT_FOUND")
    guide.is_verified = payload.is_verified
    db.commit()
    db.refresh(guide)
    item = GuideOut.model_validate(guide)
    item.languages = GuideService.languages_list(guide)
    return item


@router.get("/bookings", response_model=list[BookingOut])
def list_bookings(db: DbSession, limit: int = Query(default=100, ge=1, le=500)) -> list[BookingOut]:
    bookings = db.scalars(select(GuideBooking).order_by(GuideBooking.created_at.desc()).limit(limit)).all()
    return [BookingOut.model_validate(b) for b in bookings]


@router.get("/reports", response_model=AdminReport)
def get_reports(db: DbSession) -> AdminReport:
    now = datetime.now(timezone.utc)
    six_months_ago = (now.replace(day=1) - timedelta(days=150)).replace(day=1)
    signups: dict[str, int] = {}
    for (created,) in db.execute(select(User.created_at).where(User.created_at >= six_months_ago)):
        key = created.strftime("%Y-%m")
        signups[key] = signups.get(key, 0) + 1
    months = []
    cursor = six_months_ago
    while cursor <= now:
        months.append(cursor.strftime("%Y-%m"))
        cursor = (cursor + timedelta(days=32)).replace(day=1)

    def top(column, *where) -> list[NamedCount]:
        rows = db.execute(
            select(column, func.count())
            .where(column.is_not(None), *where)
            .group_by(column)
            .order_by(func.count().desc(), column)
            .limit(8)
        ).all()
        return [NamedCount(name=name, count=count) for name, count in rows]

    return AdminReport(
        total_users=_count(db, User),
        active_users=_count(db, User, User.is_active.is_(True)),
        new_users_30d=_count(db, User, User.created_at >= now - timedelta(days=30)),
        total_destinations=_count(db, Destination),
        total_trips=_count(db, Trip),
        total_memories=_count(db, Memory),
        total_photos=_count(db, Photo),
        total_posts=_count(db, CommunityPost),
        total_guides=_count(db, GuideProfile),
        unverified_guides=_count(db, GuideProfile, GuideProfile.is_verified.is_(False)),
        total_bookings=_count(db, GuideBooking),
        active_subscriptions=_count(db, Subscription, Subscription.status == SubscriptionStatus.ACTIVE),
        signups_by_month=[NamedCount(name=m, count=signups.get(m, 0)) for m in months],
        popular_destinations=top(Destination.name),
        popular_states=top(Destination.state, Destination.status == DestinationStatus.VISITED),
    )
