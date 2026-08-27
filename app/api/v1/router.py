"""Aggregates every v1 endpoint router under a single APIRouter."""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    admin,
    auth,
    blogs,
    destinations,
    drive_links,
    expenses,
    guides,
    memories,
    notifications,
    payments,
    photos,
    planner,
    pricing,
    trips,
    users,
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(destinations.router)
api_router.include_router(trips.router)
api_router.include_router(expenses.router)
api_router.include_router(memories.router)
api_router.include_router(photos.router)
api_router.include_router(drive_links.router)
api_router.include_router(guides.router)
api_router.include_router(planner.router)
api_router.include_router(blogs.router)
api_router.include_router(pricing.router)
api_router.include_router(payments.router)
api_router.include_router(notifications.router)
api_router.include_router(admin.router)
