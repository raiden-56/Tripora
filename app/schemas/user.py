"""User + profile schemas."""

from pydantic import BaseModel, ConfigDict

from app.core.constants import UserRole


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    name: str
    role: UserRole
    is_active: bool


class UserProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    bio: str | None = None
    avatar_url: str | None = None
    home_location: str | None = None
    preferred_travel_style: str | None = None
    budget_preference: str | None = None
    favorite_activities: str | None = None
    trip_duration_preference: str | None = None
    group_size_preference: str | None = None
    visibility: str
    handle: str | None = None


class UserProfileUpdate(BaseModel):
    bio: str | None = None
    avatar_url: str | None = None
    home_location: str | None = None
    preferred_travel_style: str | None = None
    budget_preference: str | None = None
    favorite_activities: str | None = None
    trip_duration_preference: str | None = None
    group_size_preference: str | None = None
    visibility: str | None = None
