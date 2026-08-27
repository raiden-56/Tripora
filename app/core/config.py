"""Application configuration, loaded from environment variables."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


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
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
