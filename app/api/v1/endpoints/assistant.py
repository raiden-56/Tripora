"""Canvas AI travel assistant: chat grounded in the traveler's own map.

`GET /assistant/status` tells the app whether an AI model is configured; when it
isn't, `POST /assistant/chat` answers 503 AI_UNAVAILABLE and the app falls back to
its built-in (offline) suggestions.
"""

from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import select

from app.api.dependencies import CurrentUser, DbSession
from app.core.config import get_settings
from app.core.constants import DestinationStatus
from app.core.exceptions import AppError
from app.integrations.ai import AIUnavailableError, ChatTurn, get_ai_provider
from app.middleware.rate_limit import RateLimiter
from app.models.destination import Destination
from app.models.trip import Trip

router = APIRouter(prefix="/assistant", tags=["assistant"])

MAX_TURNS = 20
MAX_PLACES_IN_CONTEXT = 60


class ChatMessageIn(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    messages: list[ChatMessageIn] = Field(min_length=1, max_length=MAX_TURNS)

    @field_validator("messages")
    @classmethod
    def _ends_with_user(cls, messages: list[ChatMessageIn]) -> list[ChatMessageIn]:
        if messages[-1].role != "user":
            raise ValueError("The last message must be from the user.")
        return messages


class ChatReply(BaseModel):
    reply: str
    generated_by: str


class AssistantStatus(BaseModel):
    available: bool
    provider: str


def traveler_context(db, user) -> str:
    """A compact, deterministic summary of what the traveler has recorded."""
    profile = user.profile
    destinations = list(
        db.scalars(select(Destination).where(Destination.user_id == user.id).order_by(Destination.id))
    )[:MAX_PLACES_IN_CONTEXT]
    trips = list(
        db.scalars(
            select(Trip).where(Trip.user_id == user.id, Trip.end_date >= date.today()).order_by(Trip.start_date)
        )
    )[:10]

    def place(d: Destination) -> str:
        where = ", ".join(x for x in (d.state, d.country) if x)
        extra = []
        if d.is_favorite:
            extra.append("favorite")
        if d.rating:
            extra.append(f"rated {d.rating}/5")
        return f"{d.name} ({where})" + (f" [{', '.join(extra)}]" if extra else "")

    lines = [f"Today: {date.today().isoformat()}"]
    if profile is not None:
        if profile.home_location:
            lines.append(f"Home city: {profile.home_location}")
        if profile.favorite_activities:
            lines.append(f"Interests: {profile.favorite_activities}")
        if profile.preferred_travel_style:
            lines.append(f"Travel style: {profile.preferred_travel_style}")
    for status, label in (
        (DestinationStatus.VISITED, "Visited"),
        (DestinationStatus.PLANNED, "Planned"),
        (DestinationStatus.WISHLIST, "Wishlist"),
    ):
        names = [place(d) for d in destinations if d.status == status]
        lines.append(f"{label}: " + ("; ".join(names) if names else "none"))
    lines.append(
        "Upcoming trips: "
        + ("; ".join(f"{t.title} {t.start_date.isoformat()} to {t.end_date.isoformat()}" for t in trips) or "none")
    )
    return "\n".join(lines)


@router.get("/status", response_model=AssistantStatus)
def assistant_status(user: CurrentUser) -> AssistantStatus:
    provider = get_ai_provider()
    return AssistantStatus(available=provider.name != "template", provider=provider.name)


@router.post(
    "/chat",
    response_model=ChatReply,
    dependencies=[Depends(RateLimiter(times=get_settings().rate_limit_ai_per_minute, seconds=60))],
)
def chat(payload: ChatRequest, user: CurrentUser, db: DbSession) -> ChatReply:
    provider = get_ai_provider()
    try:
        reply = provider.chat(
            turns=[ChatTurn(role=m.role, content=m.content.strip()) for m in payload.messages],
            traveler_context=traveler_context(db, user),
        )
    except AIUnavailableError as exc:
        raise AppError(str(exc), code="AI_UNAVAILABLE", status_code=503) from exc
    return ChatReply(reply=reply, generated_by=provider.name)
