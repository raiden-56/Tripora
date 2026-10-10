"""AI features: provider selection and fallback, the planner's use of AI plans, the
assistant chat endpoint, and the Claude provider's request/response handling.
No test calls the real Anthropic API."""

import json
from types import SimpleNamespace

import anthropic
import pytest

from app.api.v1.endpoints import assistant as assistant_endpoint
from app.integrations.ai import AIUnavailableError
from app.integrations.ai.base import AIProvider
from app.integrations.ai.claude_provider import FALLBACK_BETA, ClaudeProvider
from app.services import planner_service

PLAN_REQUEST = {
    "origin": "Bengaluru", "destination": "Coorg", "days": 2, "people": 2,
    "budget": 12000, "travel_style": "relaxed", "interests": ["nature"],
}


class FakeProvider(AIProvider):
    name = "fake"

    def __init__(self, plan=None, reply="Try Chikmagalur next.", fail=False):
        self.plan, self.reply, self.fail = plan, reply, fail
        self.seen_context = None

    def generate_blog_sections(self, *, title, facts):
        return [{"heading": "Hi", "content": "There"}]

    def plan_trip(self, *, request):
        if self.fail:
            raise AIUnavailableError("down")
        return self.plan

    def chat(self, *, turns, traveler_context):
        if self.fail:
            raise AIUnavailableError("The AI service is busy right now.")
        self.seen_context = traveler_context
        return self.reply


def _use(monkeypatch, provider):
    monkeypatch.setattr(planner_service, "get_ai_provider", lambda: provider)
    monkeypatch.setattr(assistant_endpoint, "get_ai_provider", lambda: provider)


GOOD_PLAN = {
    "days": [
        {"title": "Arrive & unwind", "activities": [{"kind": "place", "description": "Raja's Seat at sunset"}]},
        {"title": "Coffee country", "activities": [
            {"kind": "activity", "description": "Plantation walk"},
            {"kind": "weird", "description": "  Dubare elephant camp  "},
        ]},
        {"title": "Extra day the model added", "activities": [{"kind": "food", "description": "x"}]},
    ],
    "estimated_budget_min": 14000, "estimated_budget_max": 9000,
    "distance_km": 265, "route_description": "Via Mysuru",
}


def test_without_key_assistant_reports_unavailable(client, auth_headers):
    assert client.get("/api/v1/assistant/status", headers=auth_headers).json() == {"available": False, "provider": "template"}
    response = client.post(
        "/api/v1/assistant/chat", json={"messages": [{"role": "user", "content": "Where next?"}]}, headers=auth_headers
    )
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "AI_UNAVAILABLE"


def test_planner_uses_ai_plan_and_cleans_it(client, auth_headers, monkeypatch):
    _use(monkeypatch, FakeProvider(plan=GOOD_PLAN))
    body = client.post("/api/v1/planner/generate", json=PLAN_REQUEST, headers=auth_headers).json()
    assert body["generated_by"] == "fake"
    assert [d["title"] for d in body["days_detail"]] == ["Arrive & unwind", "Coffee country"]  # trimmed to 2 days
    kinds = [a["kind"] for a in body["days_detail"][1]["activities"]]
    assert kinds == ["activity", "activity"]  # unknown kind normalised
    assert body["days_detail"][1]["activities"][1]["description"] == "Dubare elephant camp"
    assert (body["estimated_budget_min"], body["estimated_budget_max"]) == (9000, 14000)  # swapped into order
    assert body["distance_km"] == 265


@pytest.mark.parametrize(
    "provider",
    [FakeProvider(fail=True), FakeProvider(plan={**GOOD_PLAN, "days": GOOD_PLAN["days"][:1]})],
    ids=["ai-down", "too-few-days"],
)
def test_planner_falls_back_to_rules(client, auth_headers, monkeypatch, provider):
    _use(monkeypatch, provider)
    body = client.post("/api/v1/planner/generate", json=PLAN_REQUEST, headers=auth_headers).json()
    assert body["generated_by"] == "rules"
    assert len(body["days_detail"]) == 2


def test_chat_is_grounded_in_the_travelers_data(client, auth_headers, monkeypatch):
    fake = FakeProvider()
    _use(monkeypatch, fake)
    client.post(
        "/api/v1/destinations",
        json={"name": "Hampi", "country": "India", "state": "Karnataka", "latitude": 15.3, "longitude": 76.4,
              "status": "visited", "is_favorite": True},
        headers=auth_headers,
    )
    client.put("/api/v1/users/me/profile", json={"home_location": "Bengaluru"}, headers=auth_headers)

    response = client.post(
        "/api/v1/assistant/chat",
        json={"messages": [
            {"role": "user", "content": "Hi"},
            {"role": "assistant", "content": "Hello!"},
            {"role": "user", "content": "Where next?"},
        ]},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json() == {"reply": "Try Chikmagalur next.", "generated_by": "fake"}
    assert "Home city: Bengaluru" in fake.seen_context
    assert "Hampi (Karnataka, India) [favorite]" in fake.seen_context


def test_chat_validation(client, auth_headers, monkeypatch):
    _use(monkeypatch, FakeProvider())
    ends_with_assistant = {"messages": [{"role": "assistant", "content": "Hello"}]}
    assert client.post("/api/v1/assistant/chat", json=ends_with_assistant, headers=auth_headers).status_code == 422
    too_long = {"messages": [{"role": "user", "content": "x" * 4001}]}
    assert client.post("/api/v1/assistant/chat", json=too_long, headers=auth_headers).status_code == 422


def test_chat_ai_failure_is_503_with_message(client, auth_headers, monkeypatch):
    _use(monkeypatch, FakeProvider(fail=True))
    response = client.post(
        "/api/v1/assistant/chat", json={"messages": [{"role": "user", "content": "Hi"}]}, headers=auth_headers
    )
    assert response.status_code == 503
    assert response.json()["error"]["message"] == "The AI service is busy right now."


# --- ClaudeProvider with a stubbed SDK client ----------------------------------------------


def _claude(monkeypatch, response=None, error=None):
    provider = ClaudeProvider(api_key="test-key", model="claude-opus-5-5")
    calls = []

    def create(**kwargs):
        calls.append(kwargs)
        if error:
            raise error
        return response

    monkeypatch.setattr(provider.client.beta.messages, "create", create)
    return provider, calls


def _response(payload, stop_reason="end_turn"):
    return SimpleNamespace(
        stop_reason=stop_reason,
        content=[SimpleNamespace(type="thinking", thinking=""), SimpleNamespace(type="text", text=json.dumps(payload))],
        _request_id="req_test",
    )


def test_claude_request_shape_and_parsing(monkeypatch):
    provider, calls = _claude(monkeypatch, _response({"reply": "Go to Gokarna."}))
    reply = provider.chat(turns=[], traveler_context="Visited: Goa")
    assert reply == "Go to Gokarna."
    sent = calls[0]
    assert sent["model"] == "claude-opus-5-5"
    assert sent["betas"] == [FALLBACK_BETA] and sent["fallbacks"] == "default"
    assert sent["output_config"]["format"]["type"] == "json_schema"
    assert sent["output_config"]["effort"] == "low"
    assert sent["system"][-1]["cache_control"] == {"type": "ephemeral"}
    assert "Visited: Goa" in sent["system"][-1]["text"]
    assert "thinking" not in sent and "temperature" not in sent


@pytest.mark.parametrize("stop_reason", ["refusal", "max_tokens"])
def test_claude_unusable_stops_raise_unavailable(monkeypatch, stop_reason):
    provider, _ = _claude(monkeypatch, _response({"reply": "x"}, stop_reason=stop_reason))
    with pytest.raises(AIUnavailableError):
        provider.chat(turns=[], traveler_context="")


def test_claude_api_errors_raise_unavailable(monkeypatch):
    request = SimpleNamespace(method="POST", url="https://api.anthropic.com/v1/messages")
    error = anthropic.APIConnectionError(request=request)
    provider, _ = _claude(monkeypatch, error=error)
    with pytest.raises(AIUnavailableError, match="can't be reached"):
        provider.plan_trip(request=PLAN_REQUEST)


def test_claude_story_sections_are_cleaned(monkeypatch):
    payload = {"sections": [{"heading": " Day one ", "content": " Mist everywhere. "}, {"heading": "", "content": "dropped"}]}
    provider, _ = _claude(monkeypatch, _response(payload))
    assert provider.generate_blog_sections(title="Coorg", facts={}) == [{"heading": "Day one", "content": "Mist everywhere."}]
