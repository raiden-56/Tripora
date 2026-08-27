"""Pricing plan business logic (Redis-cached, since plans change rarely)."""

from app.core.cache import cache_delete, cache_get, cache_set
from app.repositories.pricing_repository import PricingRepository

_CACHE_KEY = "pricing:plans"


class PricingService:
    def __init__(self, repo: PricingRepository):
        self.repo = repo

    def list_plans(self) -> list[dict]:
        cached = cache_get(_CACHE_KEY)
        if cached is not None:
            return cached

        plans = self.repo.list_active()
        data = [
            {
                "id": p.id,
                "code": p.code,
                "name": p.name,
                "price": p.price,
                "currency": p.currency,
                "billing_period": p.billing_period,
                "features": [f.strip() for f in p.features.split(",") if f.strip()],
                "is_active": p.is_active,
            }
            for p in plans
        ]
        cache_set(_CACHE_KEY, data, ttl_seconds=3600)
        return data

    def invalidate_cache(self) -> None:
        cache_delete(_CACHE_KEY)
