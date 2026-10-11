"""Public profile handles (the `traveldiaries.app/u/<handle>` part)."""

import re
import secrets

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import UserProfile

HANDLE_PATTERN = r"^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$"
RESERVED_HANDLES = {"admin", "api", "app", "login", "signup", "share", "settings", "support", "help", "u", "journey"}


def slugify(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return slug[:24].strip("-") or "traveler"


def handle_available(db: Session, handle: str, *, exclude_user_id: int | None = None) -> bool:
    if handle in RESERVED_HANDLES:
        return False
    stmt = select(UserProfile.user_id).where(UserProfile.handle == handle)
    owner = db.scalar(stmt)
    return owner is None or owner == exclude_user_id


def generate_handle(db: Session, name: str) -> str:
    base = slugify(name)
    if len(base) < 3:
        base = f"{base}-traveler"
    if handle_available(db, base):
        return base
    for _ in range(20):
        candidate = f"{base}-{secrets.randbelow(9000) + 1000}"
        if handle_available(db, candidate):
            return candidate
    return f"traveler-{secrets.token_hex(4)}"
