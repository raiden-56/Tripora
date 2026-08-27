"""Current user + profile endpoints."""

from fastapi import APIRouter, Depends

from app.api.dependencies import CurrentUser, DbSession
from app.models.user import UserProfile
from app.schemas.user import UserOut, UserProfileOut, UserProfileUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def get_me(user: CurrentUser) -> UserOut:
    return UserOut.model_validate(user)


@router.get("/me/profile", response_model=UserProfileOut)
def get_my_profile(user: CurrentUser) -> UserProfileOut:
    return UserProfileOut.model_validate(user.profile)


@router.put("/me/profile", response_model=UserProfileOut)
def update_my_profile(payload: UserProfileUpdate, user: CurrentUser, db: DbSession) -> UserProfileOut:
    profile: UserProfile = user.profile
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return UserProfileOut.model_validate(profile)
