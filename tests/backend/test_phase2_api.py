"""Phase 2 endpoints: trip checklist & budget, public journeys, handles, notifications,
data export, account deletion, planner get/delete, and booking names."""

from datetime import date, timedelta


def _signup(client, email: str, first_name: str = "Other") -> dict:
    client.post(
        "/api/v1/auth/signup",
        json={"first_name": first_name, "last_name": "User", "email": email, "password": "Secret@123"},
    )
    login = client.post("/api/v1/auth/login", json={"email": email, "password": "Secret@123"})
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


def _trip(client, headers) -> int:
    response = client.post(
        "/api/v1/trips",
        json={"title": "Goa", "start_date": "2026-12-01", "end_date": "2026-12-04"},
        headers=headers,
    )
    return response.json()["id"]


def _share_trip(client, owner, trip_id, email, role) -> dict:
    member = _signup(client, email)
    invite = client.post(
        f"/api/v1/trips/{trip_id}/collaborators", json={"email": email, "role": role}, headers=owner
    ).json()
    client.post(f"/api/v1/trips/{trip_id}/collaborators/{invite['id']}/accept", headers=member)
    return member


# --- checklist --------------------------------------------------------------------------


def test_checklist_crud_and_permissions(client, auth_headers):
    trip_id = _trip(client, auth_headers)
    base = f"/api/v1/trips/{trip_id}/checklist"

    first = client.post(base, json={"text": "Passport"}, headers=auth_headers)
    second = client.post(base, json={"text": "  Sunscreen  "}, headers=auth_headers)
    assert first.status_code == 201 and second.json()["text"] == "Sunscreen"

    done = client.patch(f"{base}/{first.json()['id']}", json={"is_done": True}, headers=auth_headers)
    assert done.json()["is_done"] is True
    assert client.patch(f"{base}/{first.json()['id']}", json={"is_done": None}, headers=auth_headers).status_code == 422

    viewer = _share_trip(client, auth_headers, trip_id, "viewer@example.com", "viewer")
    assert [i["text"] for i in client.get(base, headers=viewer).json()] == ["Passport", "Sunscreen"]
    assert client.post(base, json={"text": "Hat"}, headers=viewer).status_code == 403

    editor = _share_trip(client, auth_headers, trip_id, "editor@example.com", "editor")
    assert client.post(base, json={"text": "Hat"}, headers=editor).status_code == 201

    stranger = _signup(client, "stranger@example.com")
    assert client.get(base, headers=stranger).status_code == 404

    assert client.delete(f"{base}/{second.json()['id']}", headers=auth_headers).status_code == 204
    assert len(client.get(base, headers=auth_headers).json()) == 2


def test_checklist_item_must_belong_to_trip(client, auth_headers):
    trip_a, trip_b = _trip(client, auth_headers), _trip(client, auth_headers)
    item = client.post(f"/api/v1/trips/{trip_a}/checklist", json={"text": "Tickets"}, headers=auth_headers).json()
    response = client.patch(f"/api/v1/trips/{trip_b}/checklist/{item['id']}", json={"is_done": True}, headers=auth_headers)
    assert response.status_code == 404


# --- budget ------------------------------------------------------------------------------


def test_budget_compares_planned_with_expenses(client, auth_headers):
    trip_id = _trip(client, auth_headers)
    payer = client.post(f"/api/v1/trips/{trip_id}/participants", json={"name": "Me"}, headers=auth_headers).json()
    for amount, category in ((1200, "food"), (300, "food"), (5000, "stay")):
        client.post(
            f"/api/v1/trips/{trip_id}/expenses",
            json={"description": "x", "amount": amount, "category": category, "paid_by_id": payer["id"]},
            headers=auth_headers,
        )

    response = client.put(
        f"/api/v1/trips/{trip_id}/budget",
        json={"items": [{"category": "food", "planned_amount": 2000}, {"category": "transport", "planned_amount": 800}]},
        headers=auth_headers,
    )
    assert response.status_code == 200
    body = response.json()
    lines = {line["category"]: line for line in body["lines"]}
    assert lines["food"] == {"category": "food", "planned_amount": 2000, "spent": 1500}
    assert lines["transport"]["spent"] == 0
    assert lines["stay"] == {"category": "stay", "planned_amount": 0, "spent": 5000}  # spent but unplanned
    assert body["total_planned"] == 2800 and body["total_spent"] == 6500

    # Replacing drops categories that aren't sent again.
    body = client.put(
        f"/api/v1/trips/{trip_id}/budget", json={"items": [{"category": "food", "planned_amount": 1000}]},
        headers=auth_headers,
    ).json()
    assert {line["category"] for line in body["lines"]} == {"food", "stay"}

    duplicate = client.put(
        f"/api/v1/trips/{trip_id}/budget",
        json={"items": [{"category": "Food", "planned_amount": 1}, {"category": "food", "planned_amount": 2}]},
        headers=auth_headers,
    )
    assert duplicate.status_code == 422


# --- handles & public journeys -----------------------------------------------------------


def test_signup_gets_unique_handle(client):
    first = _signup(client, "a@example.com", first_name="Asha")
    second = _signup(client, "b@example.com", first_name="Asha")
    handle_a = client.get("/api/v1/users/me/profile", headers=first).json()["handle"]
    handle_b = client.get("/api/v1/users/me/profile", headers=second).json()["handle"]
    assert handle_a == "asha-user"
    assert handle_b.startswith("asha-user-") and handle_b != handle_a


def test_handle_validation_and_uniqueness(client, auth_headers):
    other = _signup(client, "other@example.com")
    assert client.put("/api/v1/users/me/profile", json={"handle": "taken-name"}, headers=other).status_code == 200

    assert client.put("/api/v1/users/me/profile", json={"handle": "taken-name"}, headers=auth_headers).status_code == 409
    assert client.put("/api/v1/users/me/profile", json={"handle": "Bad Handle!"}, headers=auth_headers).status_code == 422
    assert client.put("/api/v1/users/me/profile", json={"handle": "admin"}, headers=auth_headers).status_code == 409
    assert client.put("/api/v1/users/me/profile", json={"handle": "my-travels"}, headers=auth_headers).status_code == 200


def test_public_journey_only_when_public(client, auth_headers):
    client.put("/api/v1/users/me/profile", json={"handle": "wanderer", "bio": "Hills > beaches"}, headers=auth_headers)
    destination = client.post(
        "/api/v1/destinations",
        json={"name": "Coorg", "country": "India", "latitude": 12.4, "longitude": 75.7, "status": "visited"},
        headers=auth_headers,
    ).json()
    client.post(
        "/api/v1/memories",
        json={"destination_id": destination["id"], "title": "Coffee estate", "memory_date": "2026-03-02"},
        headers=auth_headers,
    )

    assert client.get("/api/v1/public/journeys/wanderer").status_code == 404  # private by default

    client.put("/api/v1/users/me/profile", json={"visibility": "friends"}, headers=auth_headers)
    assert client.get("/api/v1/public/journeys/wanderer").status_code == 404

    client.put("/api/v1/users/me/profile", json={"visibility": "public"}, headers=auth_headers)
    response = client.get("/api/v1/public/journeys/wanderer")  # no auth header
    assert response.status_code == 200
    body = response.json()
    assert body["bio"] == "Hills > beaches"
    assert [d["name"] for d in body["destinations"]] == ["Coorg"]
    assert [m["title"] for m in body["memories"]] == ["Coffee estate"]
    assert "email" not in body


# --- notifications -----------------------------------------------------------------------


def _book_guide(client, traveler, guide_id):
    return client.post(
        f"/api/v1/guides/{guide_id}/booking",
        json={"booking_date": str(date.today() + timedelta(days=3)), "booking_time": "10:00"},
        headers=traveler,
    )


def test_unread_count_mark_all_and_preference(client, auth_headers):
    guide_headers = _signup(client, "guide@example.com")
    guide_id = client.post(
        "/api/v1/guides", json={"headline": "Walks", "destination_name": "Coorg", "price_per_day": 1000},
        headers=guide_headers,
    ).json()["id"]

    _book_guide(client, auth_headers, guide_id)  # the guide is notified of each request
    _book_guide(client, auth_headers, guide_id)
    assert client.get("/api/v1/notifications/unread-count", headers=guide_headers).json()["unread"] == 2
    assert client.post("/api/v1/notifications/read-all", headers=guide_headers).status_code == 204
    assert client.get("/api/v1/notifications/unread-count", headers=guide_headers).json()["unread"] == 0

    client.put("/api/v1/users/me/profile", json={"notifications_enabled": False}, headers=guide_headers)
    _book_guide(client, auth_headers, guide_id)
    assert client.get("/api/v1/notifications/unread-count", headers=guide_headers).json()["unread"] == 0


# --- account -----------------------------------------------------------------------------


def test_update_name_export_and_delete_account(client, auth_headers):
    assert client.put("/api/v1/users/me", json={"name": "Renamed"}, headers=auth_headers).json()["name"] == "Renamed"
    assert client.put("/api/v1/users/me", json={"name": None}, headers=auth_headers).status_code == 422

    destination = client.post(
        "/api/v1/destinations",
        json={"name": "Hampi", "country": "India", "latitude": 15.3, "longitude": 76.4,
              "drive_folder_url": "https://drive.google.com/drive/folders/xyz"},
        headers=auth_headers,
    ).json()
    assert destination["drive_folder_url"] == "https://drive.google.com/drive/folders/xyz"
    trip_id = _trip(client, auth_headers)
    client.post(f"/api/v1/trips/{trip_id}/checklist", json={"text": "Tickets"}, headers=auth_headers)

    export = client.get("/api/v1/users/me/export", headers=auth_headers).json()
    assert export["account"]["email"] == "test@example.com"
    assert [d["name"] for d in export["destinations"]] == ["Hampi"]
    assert export["trips"][0]["checklist"] == [{"text": "Tickets", "is_done": False}]

    wrong = client.request("DELETE", "/api/v1/users/me", json={"password": "nope"}, headers=auth_headers)
    assert wrong.status_code == 401
    gone = client.request("DELETE", "/api/v1/users/me", json={"password": "Test@1234"}, headers=auth_headers)
    assert gone.status_code == 204
    assert client.post("/api/v1/auth/login", json={"email": "test@example.com", "password": "Test@1234"}).status_code == 401


# --- planner & bookings ------------------------------------------------------------------


def test_planner_get_and_delete_are_owner_only(client, auth_headers):
    plan = client.post(
        "/api/v1/planner/generate",
        json={"origin": "Bangalore", "destination": "Coorg", "days": 2, "people": 2, "budget": 9000,
              "travel_style": "relaxed", "interests": []},
        headers=auth_headers,
    ).json()
    other = _signup(client, "other@example.com")
    assert client.get(f"/api/v1/planner/{plan['id']}", headers=other).status_code == 404
    assert client.delete(f"/api/v1/planner/{plan['id']}", headers=other).status_code == 404
    assert client.get(f"/api/v1/planner/{plan['id']}", headers=auth_headers).status_code == 200
    assert client.delete(f"/api/v1/planner/{plan['id']}", headers=auth_headers).status_code == 204
    assert client.get("/api/v1/planner", headers=auth_headers).json() == []


def test_bookings_carry_guide_and_traveler_names(client, auth_headers):
    guide_headers = _signup(client, "guide@example.com", first_name="Ravi")
    guide = client.post(
        "/api/v1/guides",
        json={"headline": "Walks", "destination_name": "Coorg", "price_per_day": 1000},
        headers=guide_headers,
    ).json()
    _book_guide(client, auth_headers, guide["id"])
    mine = client.get("/api/v1/bookings", headers=auth_headers).json()[0]
    assert mine["guide_name"] == "Ravi User" and mine["guide_destination"] == "Coorg"
    received = client.get("/api/v1/bookings/received", headers=guide_headers).json()[0]
    assert received["traveler_name"] == "Test User"
    assert mine["reviewed"] is False

    booking_id = mine["id"]
    for status in ("accepted", "completed"):
        client.patch(f"/api/v1/bookings/{booking_id}", json={"status": status}, headers=guide_headers)
    client.post(f"/api/v1/guides/{guide['id']}/reviews", json={"booking_id": booking_id, "rating": 4}, headers=auth_headers)
    assert client.get("/api/v1/bookings", headers=auth_headers).json()[0]["reviewed"] is True
