"""Interface for AI-backed content generation (blogs, recommendations).

Swap TemplateAIProvider for a real provider (OpenAI, Anthropic, etc.) by
implementing this interface and wiring it in AIProvider.get_default().
The API key for a real provider must only ever live in backend env vars
(AI_API_KEY) — never sent to or read by the frontend.
"""

from abc import ABC, abstractmethod


class AIProvider(ABC):
    @abstractmethod
    def generate_blog_sections(self, *, title: str, facts: dict) -> list[dict]:
        """Returns a list of {"heading": str, "content": str} sections."""
        raise NotImplementedError
