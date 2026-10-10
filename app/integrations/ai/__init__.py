"""AI providers. `get_ai_provider()` returns Claude when AI_API_KEY is configured,
otherwise the deterministic template provider."""

from functools import lru_cache

from app.core.config import get_settings
from app.integrations.ai.base import AIProvider, AIUnavailableError, ChatTurn
from app.integrations.ai.template_provider import TemplateAIProvider

__all__ = ["AIProvider", "AIUnavailableError", "ChatTurn", "get_ai_provider"]


@lru_cache
def get_ai_provider() -> AIProvider:
    settings = get_settings()
    if settings.ai_api_key:
        from app.integrations.ai.claude_provider import ClaudeProvider

        return ClaudeProvider(api_key=settings.ai_api_key, model=settings.ai_model)
    return TemplateAIProvider()
