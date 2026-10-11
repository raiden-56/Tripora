"""Trip itinerary: day-by-day stops, day titles, reordering, permissions, planner import."""


def _signup(client, email: str) -> dict:
    client.post(
        "/api/v1/auth/signup",
        json={"first_name": "Other", "last_name": "User", "email": email, "password": "Secret@123"},
    )
    login = client.post("/api/v1/auth/login", json={"email": email, "password": "Secret@123"})
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


def _trip(client, headers, start="2026-12-01", end="2026-12-03") -> int:
    return client.post(
        "/api/v1/trips", json={"title": "Coorg", "start_date": start, "end_date": end}, headers=headers
    ).json()["id"]


def _add(client, headers, trip_id, day, title, **extra):
    response = client.post(
        f"/api/v1/trips/{trip_id}/itinerary/items",
        json={"day_number": day, "title": title, **extra},
        headers=headers,
    )
    assert response.status_code == 201, response.text
    return response.json()


def test_days_follow_trip_dates_and_items_keep_order(client, auth_headers):
    trip_id = _trip(client, auth_headers)
    a = _add(client, auth_headers, trip_id, 1, "Check in", kind="stay", start_time="14:00", cost=4500)
    b = _add(client, auth_headers, trip_id, 1, "Abbey Falls", kind="place")
    _add(client, auth_headers, trip_id, 2, "Coffee estate walk")

    body = client.get(f"/api/v1/trips/{trip_id}/itinerary", headers=auth_headers).json()
    assert [d["date"] for d in body["days"]] == ["2026-12-01", "2026-12-02", "2026-12-03"]
    assert [i["title"] for i in body["days"][0]["items"]] == ["Check in", "Abbey Falls"]
    assert body["days"][2]["items"] == []
    assert body["total_cost"] == 4500
    assert a["position"] < b["position"]


def test_validation(client, auth_headers):
    trip_id = _trip(client, auth_headers)
    base = f"/api/v1/trips/{trip_id}/itinerary/items"
    assert client.post(base, json={"day_number": 1, "title": "x", "start_time": "25:00"}, headers=auth_headers).status_code == 422
    assert client.post(base, json={"day_number": 0, "title": "x"}, headers=auth_headers).status_code == 422
    assert client.post(base, json={"day_number": 1, "title": "x", "kind": "party"}, headers=auth_headers).status_code == 422
    item = _add(client, auth_headers, trip_id, 1, "Lunch", kind="food", notes="try pandi curry")
    patched = client.patch(f"{base}/{item['id']}", json={"notes": None, "cost": 800}, headers=auth_headers).json()
    assert patched["notes"] is None and patched["cost"] == 800
    assert client.patch(f"{base}/{item['id']}", json={"title": None}, headers=auth_headers).status_code == 422


def test_move_between_days_and_reorder(client, auth_headers):
    trip_id = _trip(client, auth_headers)
    first = _add(client, auth_headers, trip_id, 1, "First")
    second = _add(client, auth_headers, trip_id, 1, "Second")
    other = _add(client, auth_headers, trip_id, 2, "Day two")

    moved = client.patch(
        f"/api/v1/trips/{trip_id}/itinerary/items/{first['id']}", json={"day_number": 2}, headers=auth_headers
    ).json()
    assert moved["day_number"] == 2 and moved["position"] > other["position"]

    body = client.put(
        f"/api/v1/trips/{trip_id}/itinerary/order",
        json={"days": [{"day_number": 1, "item_ids": [first["id"], second["id"]]}, {"day_number": 2, "item_ids": [other["id"]]}]},
        headers=auth_headers,
    ).json()
    assert [i["title"] for i in body["days"][0]["items"]] == ["First", "Second"]

    bad = client.put(
        f"/api/v1/trips/{trip_id}/itinerary/order",
        json={"days": [{"day_number": 1, "item_ids": [first["id"], first["id"]]}]},
        headers=auth_headers,
    )
    assert bad.status_code == 422


def test_items_beyond_trip_length_stay_visible(client, auth_headers):
    trip_id = _trip(client, auth_headers)
    _add(client, auth_headers, trip_id, 5, "Late addition")
    days = client.get(f"/api/v1/trips/{trip_id}/itinerary", headers=auth_headers).json()["days"]
    assert len(days) == 5 and days[4]["items"][0]["title"] == "Late addition"


def test_day_titles(client, auth_headers):
    trip_id = _trip(client, auth_headers)
    body = client.put(f"/api/v1/trips/{trip_id}/itinerary/days/1", json={"title": "Arrival"}, headers=auth_headers).json()
    assert body["days"][0]["title"] == "Arrival"
    body = client.put(f"/api/v1/trips/{trip_id}/itinerary/days/1", json={"title": "  "}, headers=auth_headers).json()
    assert body["days"][0]["title"] is None


def test_permissions(client, auth_headers):
    trip_id = _trip(client, auth_headers)
    item = _add(client, auth_headers, trip_id, 1, "Stop")

    viewer = _signup(client, "viewer@example.com")
    invite = client.post(
        f"/api/v1/trips/{trip_id}/collaborators", json={"email": "viewer@example.com", "role": "viewer"}, headers=auth_headers
    ).json()
    client.post(f"/api/v1/trips/{trip_id}/collaborators/{invite['id']}/accept", headers=viewer)
    assert client.get(f"/api/v1/trips/{trip_id}/itinerary", headers=viewer).status_code == 200
    assert client.post(
        f"/api/v1/trips/{trip_id}/itinerary/items", json={"day_number": 1, "title": "x"}, headers=viewer
    ).status_code == 403

    stranger = _signup(client, "stranger@example.com")
    assert client.get(f"/api/v1/trips/{trip_id}/itinerary", headers=stranger).status_code == 404

    other_trip = _trip(client, auth_headers)
    assert client.delete(f"/api/v1/trips/{other_trip}/itinerary/items/{item['id']}", headers=auth_headers).status_code == 404


def test_import_plan(client, auth_headers):
    plan = client.post(
        "/api/v1/planner/generate",
        json={"origin": "Bangalore", "destination": "Coorg", "days": 3, "people": 2, "budget": 15000,
              "travel_style": "relaxed", "interests": []},
        headers=auth_headers,
    ).json()
    trip_id = _trip(client, auth_headers)
    _add(client, auth_headers, trip_id, 1, "Will be replaced")

    body = client.post(
        f"/api/v1/trips/{trip_id}/itinerary/import-plan", json={"plan_id": plan["id"]}, headers=auth_headers
    ).json()
    assert body["days"][0]["title"] == "Arrival in Coorg"
    titles = [i["title"] for d in body["days"] for i in d["items"]]
    assert "Will be replaced" not in titles
    assert len(titles) == sum(len(d["activities"]) for d in plan["days_detail"])

    appended = client.post(
        f"/api/v1/trips/{trip_id}/itinerary/import-plan", json={"plan_id": plan["id"], "mode": "append"}, headers=auth_headers
    ).json()
    assert sum(len(d["items"]) for d in appended["days"]) == 2 * len(titles)

    other = _signup(client, "other@example.com")
    their_trip = _trip(client, other)
    assert client.post(
        f"/api/v1/trips/{their_trip}/itinerary/import-plan", json={"plan_id": plan["id"]}, headers=other
    ).status_code == 404
