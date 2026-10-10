"""Claude-backed AI provider (Anthropic Messages API).

Every call asks for JSON that matches a schema (`output_config.format`), so the rest
of the app gets validated structures, not free text to parse. Requests opt into the
server-side refusal fallback, and any API failure surfaces as AIUnavailableError so
callers can fall back to the rule-based path.
"""

import json
from typing import Any

import anthropic

from app.core.logging import get_logger
from app.integrations.ai.base import AIProvider, AIUnavailableError, ChatTurn

logger = get_logger(__name__)

FALLBACK_BETA = "server-side-fallback-2026-07-01"

_STORY_SYSTEM = """You write warm, specific travel stories for a personal travel journal app.
Write in first person as the traveler, in plain English, no hashtags or emojis.
Only use the facts provided — never invent places, people, prices or events.
If the facts are thin, keep the story short rather than padding it."""

_PLANNER_SYSTEM = """You are a practical trip planner for Indian and international travelers.
Plan realistic days: travel time between stops, opening hours, meals at sensible times,
and the traveler's style, interests, group size and budget (in Indian rupees).
Every activity description is one concrete line (a named place or a specific thing to do),
at most 200 characters. Use kind "place" for sights, "activity" for things to do and
"food" for meals. Budget estimates are totals for the whole group for the whole trip, in INR.
distance_km is the one-way road/air distance from origin to destination, or null if unknown."""

_CHAT_SYSTEM = """You are Canvas, the travel assistant inside the Travel Diaries app.
Answer the traveler's questions about where to go and how to plan, using their own travel
history below (places visited, wishlist, upcoming trips, interests, home city) whenever it helps.
Be concise and concrete: a short answer, then at most 5 bullet points. Use Indian rupees for money.
If something depends on live information you don't have (prices today, opening hours, weather),
say so briefly instead of guessing. Don't claim to have booked or changed anything."""

_STORY_SCHEMA = {
    "type": "object",
    "properties": {
        "sections": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {"heading": {"type": "string"}, "content": {"type": "string"}},
                "required": ["heading", "content"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["sections"],
    "additionalProperties": False,
}

_PLAN_SCHEMA = {
    "type": "object",
    "properties": {
        "days": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "activities": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "kind": {"type": "string", "enum": ["place", "activity", "food"]},
                                "description": {"type": "string"},
                            },
                            "required": ["kind", "description"],
                            "additionalProperties": False,
                        },
                    },
                },
                "required": ["title", "activities"],
                "additionalProperties": False,
            },
        },
        "estimated_budget_min": {"type": "number"},
        "estimated_budget_max": {"type": "number"},
        "distance_km": {"type": ["number", "null"]},
        "route_description": {"type": "string"},
    },
    "required": ["days", "estimated_budget_min", "estimated_budget_max", "distance_km", "route_description"],
    "additionalProperties": False,
}

_CHAT_SCHEMA = {
    "type": "object",
    "properties": {"reply": {"type": "string"}},
    "required": ["reply"],
    "additionalProperties": False,
}


class ClaudeProvider(AIProvider):
    name = "claude"

    def __init__(self, *, api_key: str, model: str):
        self.model = model
        # The SDK retries 429/5xx/connection errors itself; keep requests well under
        # the HTTP timeouts of the API process.
        self.client = anthropic.Anthropic(api_key=api_key, max_retries=2, timeout=90.0)

    def _json(
        self,
        *,
        system: str,
        messages: list[dict[str, Any]],
        schema: dict,
        effort: str,
        max_tokens: int,
        cache_system: bool = False,
        extra_system: str | None = None,
    ) -> dict:
        system_blocks: list[dict[str, Any]] = [{"type": "text", "text": system}]
        if extra_system:
            system_blocks.append({"type": "text", "text": extra_system})
        if cache_system:
            # Stable for a whole conversation: instructions + this traveler's context.
            system_blocks[-1]["cache_control"] = {"type": "ephemeral"}
        try:
            response = self.client.beta.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                betas=[FALLBACK_BETA],
                fallbacks="default",
                system=system_blocks,
                messages=messages,
                output_config={"effort": effort, "format": {"type": "json_schema", "schema": schema}},
            )
        except anthropic.AuthenticationError as exc:
            logger.error("Claude rejected the configured AI_API_KEY: %s", exc)
            raise AIUnavailableError("The AI service isn't configured correctly.") from exc
        except anthropic.RateLimitError as exc:
            logger.warning("Claude rate limit hit: %s", exc)
            raise AIUnavailableError("The AI service is busy right now. Please try again in a minute.") from exc
        except anthropic.APIStatusError as exc:
            logger.warning("Claude API error %s: %s", exc.status_code, exc)
            raise AIUnavailableError("The AI service couldn't handle that request.") from exc
        except anthropic.APIConnectionError as exc:
            logger.warning("Could not reach Claude: %s", exc)
            raise AIUnavailableError("The AI service can't be reached right now.") from exc

        if response.stop_reason == "refusal":
            raise AIUnavailableError("The AI assistant can't help with that request.")
        if response.stop_reason == "max_tokens":
            logger.warning("Claude response truncated at max_tokens=%s (request %s)", max_tokens, response._request_id)
            raise AIUnavailableError("The AI response was too long. Try a shorter request.")
        text = next((b.text for b in response.content if b.type == "text"), None)
        try:
            return json.loads(text or "")
        except json.JSONDecodeError as exc:
            logger.warning("Claude returned non-JSON output (request %s)", response._request_id)
            raise AIUnavailableError("The AI service returned an unexpected answer.") from exc

    def generate_blog_sections(self, *, title: str, facts: dict) -> list[dict]:
        prompt = (
            f"Write a travel story titled {json.dumps(title)} in 3 to 5 sections, "
            "each with a short heading and one or two paragraphs.\n\nFacts:\n"
            + json.dumps(facts, ensure_ascii=False, sort_keys=True, indent=2)
        )
        data = self._json(
            system=_STORY_SYSTEM,
            messages=[{"role": "user", "content": prompt}],
            schema=_STORY_SCHEMA,
            effort="medium",
            max_tokens=8000,
        )
        sections = [
            {"heading": s["heading"].strip()[:200], "content": s["content"].strip()}
            for s in data.get("sections", [])
            if s.get("heading", "").strip() and s.get("content", "").strip()
        ]
        if not sections:
            raise AIUnavailableError("The AI service returned an empty story.")
        return sections

    def plan_trip(self, *, request: dict) -> dict:
        prompt = (
            "Plan this trip day by day. Return exactly "
            f"{request['days']} days, 3 to 6 activities per day.\n\n"
            + json.dumps(request, ensure_ascii=False, sort_keys=True, indent=2)
        )
        return self._json(
            system=_PLANNER_SYSTEM,
            messages=[{"role": "user", "content": prompt}],
            schema=_PLAN_SCHEMA,
            effort="medium",
            max_tokens=12000,
        )

    def chat(self, *, turns: list[ChatTurn], traveler_context: str) -> str:
        data = self._json(
            system=_CHAT_SYSTEM,
            extra_system="Traveler's data:\n" + traveler_context,
            cache_system=True,
            messages=[{"role": t.role, "content": t.content} for t in turns],
            schema=_CHAT_SCHEMA,
            effort="low",
            max_tokens=4000,
        )
        reply = str(data.get("reply", "")).strip()
        if not reply:
            raise AIUnavailableError("The AI assistant didn't return an answer.")
        return reply
