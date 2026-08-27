"""Trip planner generation is a real, persisted service (not a stub)."""


def test_generate_trip_plan(client, auth_headers):
    payload = {
        "origin": "Bangalore", "destination": "Coorg", "days": 3,
        "people": 2, "budget": 15000, "travel_style": "adventure", "interests": ["nature"],
    }
    response = client.post("/api/v1/planner/generate", json=payload, headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert len(body["days_detail"]) == 3
    assert body["destination_name"] == "Coorg"
    assert body["estimated_budget_max"] == 15000


def test_list_plans_returns_saved_generation(client, auth_headers):
    payload = {"origin": "Chennai", "destination": "Ooty", "days": 2, "budget": 8000, "travel_style": "relaxation", "interests": []}
    client.post("/api/v1/planner/generate", json=payload, headers=auth_headers)

    response = client.get("/api/v1/planner", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 1
