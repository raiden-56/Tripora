"""Shared constants: roles, statuses, and other fixed vocab used across the app."""

from enum import StrEnum


class UserRole(StrEnum):
    USER = "USER"
    GUIDE = "GUIDE"
    ADMIN = "ADMIN"


class DestinationStatus(StrEnum):
    VISITED = "visited"
    PLANNED = "planned"
    WISHLIST = "wishlist"


class BookingStatus(StrEnum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class GenerationStatus(StrEnum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class SubscriptionStatus(StrEnum):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    PENDING = "pending"


class PostVisibility(StrEnum):
    PUBLIC = "public"
    PRIVATE = "private"


DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100
