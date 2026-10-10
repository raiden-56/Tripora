"""Application configuration, loaded from environment variables."""

from functools import lru_cache

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Secrets that ship in this repo (.env.example, .env.development, the default below).
# Fine for local work; the app refuses to start with them anywhere else.
INSECURE_JWT_SECRETS = {"change-me-in-production", "dev-only-insecure-secret-do-not-use-in-production"}
LOCAL_ENVIRONMENTS = {"development", "test"}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # General
    app_name: str = "Travel Diaries API"
    environment: str = "development"
    api_v1_prefix: str = "/api/v1"

    # Database
    database_url: str = "sqlite:///./travel_diaries.db"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Auth
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 30

    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:5174,http://localhost:5175"

    # Rate limiting
    rate_limit_login_per_minute: int = 5
    rate_limit_ai_per_minute: int = 10
    rate_limit_default_per_minute: int = 60

    # Integrations (all optional — features degrade gracefully without them)
    ai_api_key: str | None = None
    maps_api_key: str | None = None
    google_client_id: str | None = None
    google_client_secret: str | None = None
    storage_bucket: str | None = None
    storage_access_key: str | None = None
    storage_secret_key: str | None = None
    payment_key: str | None = None
    payment_secret: str | None = None

    @property
    def is_local(self) -> bool:
        return self.environment.lower() in LOCAL_ENVIRONMENTS

    @model_validator(mode="after")
    def _require_real_secret_outside_dev(self) -> "Settings":
        if not self.is_local and (self.jwt_secret in INSECURE_JWT_SECRETS or len(self.jwt_secret) < 32):
            raise ValueError(
                f"ENVIRONMENT={self.environment!r} requires JWT_SECRET to be a unique value of at "
                "least 32 characters (e.g. `python -c \"import secrets; print(secrets.token_urlsafe(48))\"`)."
            )
        return self

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
