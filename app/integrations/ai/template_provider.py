"""Deterministic, template-based AI provider used when no AI_API_KEY is configured.

This keeps the AI blog feature fully functional in development/demo without
requiring a paid API key, while remaining behind the same AIProvider
interface a real LLM-backed provider would implement.
"""

from app.integrations.ai.base import AIProvider


class TemplateAIProvider(AIProvider):
    def generate_blog_sections(self, *, title: str, facts: dict) -> list[dict]:
        destination = facts.get("destination_name", "this destination")
        days = facts.get("days", 1)
        memory_titles: list[str] = facts.get("memory_titles", [])
        places: list[str] = facts.get("places", [])
        rating = facts.get("rating")

        intro = (
            f"Somewhere between the planning and the packing, {destination} became more than a "
            f"pin on a map. Over {days} day{'s' if days != 1 else ''}, it turned into a story worth telling."
        )

        highlights = (
            "The trip's standout moments included " + ", ".join(memory_titles[:5]) + "."
            if memory_titles
            else "Every stop added a new layer to the journey, even the unplanned ones."
        )

        places_text = (
            "Along the way, the journey covered " + ", ".join(places[:6]) + "."
            if places
            else "The journey wove through a handful of memorable stops."
        )

        rating_text = (
            f"Looking back, this trip earned a well-deserved {rating}/5 — one to revisit."
            if rating
            else "It's the kind of trip that quietly earns a repeat visit."
        )

        conclusion = (
            f"{destination} is now part of the map, not just a memory — a reminder that the best "
            "journeys are the ones you keep coming back to, even in your own stories."
        )

        return [
            {"heading": "How It Began", "content": intro},
            {"heading": "Highlights Along the Way", "content": highlights},
            {"heading": "Places That Made the Trip", "content": places_text},
            {"heading": "Looking Back", "content": rating_text},
            {"heading": "Closing Thoughts", "content": conclusion},
        ]


def get_ai_provider() -> AIProvider:
    """Returns the configured AI provider. Falls back to the template provider
    whenever no external AI credentials are configured."""
    return TemplateAIProvider()
