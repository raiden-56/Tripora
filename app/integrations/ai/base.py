"""Interface for AI-backed content: travel stories, trip plans, and the travel chat.

Two implementations: ClaudeProvider (used when AI_API_KEY is set) and
TemplateAIProvider (deterministic, always available). Callers fall back to the
template/rule-based path whenever a provider raises AIUnavailableError, so the app
works the same with or without a key. The key only ever lives in backend env vars.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass


class AIUnavailableError(Exception):
    """No AI service is configured, it failed, or it declined the request.
    The message is safe to show to users."""


@dataclass(frozen=True)
class ChatTurn:
    role: str  # "user" | "assistant"
    content: str


class AIProvider(ABC):
    #: Shown to users so they know whether replies come from an AI model.
    name: str = "template"

    @abstractmethod
    def generate_blog_sections(self, *, title: str, facts: dict) -> list[dict]:
        """Returns a list of {"heading": str, "content": str} sections."""
        raise NotImplementedError

    def plan_trip(self, *, request: dict) -> dict:
        """Returns {"days": [{"title", "activities": [{"kind", "description"}]}],
        "estimated_budget_min", "estimated_budget_max", "distance_km", "route_description"}."""
        raise AIUnavailableError("AI trip planning isn't configured.")

    def chat(self, *, turns: list[ChatTurn], traveler_context: str) -> str:
        """Answers the latest user turn, grounded in the traveler's own data."""
        raise AIUnavailableError("The AI travel assistant isn't configured.")
