"""Regression tests for the Phase 1 audit fixes: references to other users' rows,
upload verification, booking/review rules, null/limit validation, and resilience."""

import io
from datetime import date, timedelta
from pathlib import Path

import pytest
from PIL import Image

from app.core.config import Settings
from app.models.user import User


def _signup(client, email: str) -> dict:
    client.post(
        "/api/v1/auth/signup",
        json={"first_name": "Other", "last_name": "User", "email": email, "password": "Secret@123"},
    )
    login = client.post("/api/v1/auth/login", json={"email": email, "password": "Secret@123"})
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


def _png() -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", (16, 16), (30, 160, 90)).save(buffer, format="PNG")
    return buffer.getvalue()


def _destination(client, headers, name="Coorg") -> int:
    response = client.post(
        "/api/v1/destinations",
        json={"name": name, "country": "India", "latitude": 12.4, "longitude": 75.7},
        headers=headers,
    )
    assert response.status_code == 201, response.text
    return response.json()["id"]


def _trip(client, headers, destination_ids=()) -> int:
    response = client.post(
        "/api/v1/trips",
        json={
            "title": "Weekend",
            "start_date": "2026-11-01",
            "end_date": "2026-11-03",
            "destination_ids": list(destination_ids),
        },
        headers=headers,
    )
    assert response.status_code == 201, response.text
    return response.json()["id"]


# --- references to someone else's rows -------------------------------------------------


def test_memory_cannot_point_at_another_users_destination(client, auth_headers):
    other = _signup(client, "other@example.com")
    theirs = _destination(client, other)

    response = client.post(
        "/api/v1/memories",
        json={"destination_id": theirs, "title": "Sneaky", "memory_date": "2026-01-01"},
        headers=auth_headers,
    )
    assert response.status_code == 404


def test_memory_cannot_point_at_another_users_trip(client, auth_headers):
    other = _signup(client, "other@example.com")
    their_trip = _trip(client, other)
    mine = _destination(client, auth_headers)

    response = client.post(
        "/api/v1/memories",
        json={"destination_id": mine, "trip_id": their_trip, "title": "Sneaky", "memory_date": "2026-01-01"},
        headers=auth_headers,
    )
    assert response.status_code == 404


def test_trip_cannot_link_another_users_destination(client, auth_headers):
    other = _signup(client, "other@example.com")
    theirs = _destination(client, other)

    response = client.post(
        "/api/v1/trips",
        json={"title": "x", "start_date": "2026-11-01", "end_date": "2026-11-02", "destination_ids": [theirs]},
        headers=auth_headers,
    )
    assert response.status_code == 404

    trip_id = _trip(client, auth_headers)
    response = client.put(f"/api/v1/trips/{trip_id}", json={"destination_ids": [theirs]}, headers=auth_headers)
    assert response.status_code == 404


def test_photo_cannot_attach_to_another_users_destination(client, auth_headers):
    other = _signup(client, "other@example.com")
    theirs = _destination(client, other)

    response = client.post(
        "/api/v1/photos",
        files={"file": ("a.png", _png(), "image/png")},
        data={"destination_id": str(theirs)},
        headers=auth_headers,
    )
    assert response.status_code == 404


def test_drive_link_cannot_attach_to_another_users_destination(client, auth_headers):
    other = _signup(client, "other@example.com")
    theirs = _destination(client, other)

    response = client.post(
        "/api/v1/drive-links",
        json={"title": "Pics", "drive_url": "https://drive.google.com/drive/folders/abc", "destination_id": theirs},
        headers=auth_headers,
    )
    assert response.status_code == 404


# --- uploads ---------------------------------------------------------------------------


def test_upload_rejects_non_image_bytes_even_with_image_content_type(client, auth_headers):
    response = client.post(
        "/api/v1/photos",
        files={"file": ("x.png", b"<html><script>alert(1)</script></html>", "image/png")},
        headers=auth_headers,
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "INVALID_FILE_TYPE"


def test_upload_ignores_client_filename(client, auth_headers):
    response = client.post(
        "/api/v1/photos",
        files={"file": ("..\\..\\..\\evil.html", _png(), "image/png")},
        headers=auth_headers,
    )
    assert response.status_code == 201
    url = response.json()["url"]
    assert url.endswith(".png")
    assert ".." not in url and "evil" not in url
    Path(url.lstrip("/")).unlink(missing_ok=True)


# --- guide bookings & reviews --------------------------------------------------------


@pytest.fixture()
def guide(client):
    headers = _signup(client, "guide@example.com")
    response = client.post(
        "/api/v1/guides", json={"headline": "Coorg walks", "destination_name": "Coorg", "price_per_day": 2000}, headers=headers
    )
    assert response.status_code == 201, response.text
    return {"id": response.json()["id"], "headers": headers}


def _book(client, headers, guide_id, days_ahead=7):
    return client.post(
        f"/api/v1/guides/{guide_id}/booking",
        json={"booking_date": str(date.today() + timedelta(days=days_ahead)), "booking_time": "09:00"},
        headers=headers,
    )


def test_traveler_cannot_accept_or_complete_own_booking(client, auth_headers, guide):
    booking_id = _book(client, auth_headers, guide["id"]).json()["id"]

    for status in ("accepted", "completed"):
        response = client.patch(f"/api/v1/bookings/{booking_id}", json={"status": status}, headers=auth_headers)
        assert response.status_code == 409

    response = client.patch(f"/api/v1/bookings/{booking_id}", json={"status": "cancelled"}, headers=auth_headers)
    assert response.status_code == 200


def test_guide_flow_and_review_must_match_guide(client, auth_headers, guide):
    booking_id = _book(client, auth_headers, guide["id"]).json()["id"]
    # The guide can see the booking made with them.
    assert client.get(f"/api/v1/bookings/{booking_id}", headers=guide["headers"]).status_code == 200

    # pending -> completed skips a step.
    skip = client.patch(f"/api/v1/bookings/{booking_id}", json={"status": "completed"}, headers=guide["headers"])
    assert skip.status_code == 409
    for status in ("accepted", "completed"):
        response = client.patch(f"/api/v1/bookings/{booking_id}", json={"status": status}, headers=guide["headers"])
        assert response.status_code == 200, response.text

    other_guide_headers = _signup(client, "guide2@example.com")
    other_guide = client.post(
        "/api/v1/guides", json={"headline": "Goa", "destination_name": "Goa", "price_per_day": 1500}, headers=other_guide_headers
    ).json()["id"]

    forged = client.post(
        f"/api/v1/guides/{other_guide}/reviews", json={"booking_id": booking_id, "rating": 1}, headers=auth_headers
    )
    assert forged.status_code == 403

    real = client.post(
        f"/api/v1/guides/{guide['id']}/reviews", json={"booking_id": booking_id, "rating": 5}, headers=auth_headers
    )
    assert real.status_code == 201


def test_cannot_book_yourself_or_the_past(client, auth_headers, guide):
    assert _book(client, guide["headers"], guide["id"]).status_code == 422
    assert _book(client, auth_headers, guide["id"], days_ahead=-1).status_code == 422


# --- validation ------------------------------------------------------------------------


def test_null_for_required_field_is_422_not_500(client, auth_headers):
    destination_id = _destination(client, auth_headers)
    trip_id = _trip(client, auth_headers)

    assert client.put(f"/api/v1/destinations/{destination_id}", json={"name": None}, headers=auth_headers).status_code == 422
    assert client.put(f"/api/v1/trips/{trip_id}", json={"title": None}, headers=auth_headers).status_code == 422
    assert client.put("/api/v1/users/me/profile", json={"visibility": None}, headers=auth_headers).status_code == 422
    assert client.put("/api/v1/users/me/profile", json={"visibility": "everyone"}, headers=auth_headers).status_code == 422


def test_optional_field_can_be_cleared(client, auth_headers):
    destination_id = _destination(client, auth_headers)
    client.put(f"/api/v1/destinations/{destination_id}", json={"notes": "bring jacket"}, headers=auth_headers)

    response = client.put(f"/api/v1/destinations/{destination_id}", json={"notes": None}, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["notes"] is None


def test_trip_dates_must_be_in_order(client, auth_headers):
    response = client.post(
        "/api/v1/trips",
        json={"title": "Backwards", "start_date": "2026-11-05", "end_date": "2026-11-01"},
        headers=auth_headers,
    )
    assert response.status_code == 422

    trip_id = _trip(client, auth_headers)
    response = client.put(f"/api/v1/trips/{trip_id}", json={"end_date": "2026-10-01"}, headers=auth_headers)
    assert response.status_code == 422


def test_overlong_strings_are_rejected(client, auth_headers):
    response = client.post(
        "/api/v1/destinations",
        json={"name": "x", "country": "India", "state": "s" * 101, "latitude": 1, "longitude": 1},
        headers=auth_headers,
    )
    assert response.status_code == 422


# --- resilience / auth ----------------------------------------------------------------


def test_feed_survives_deleted_animation(client, auth_headers, db_session):
    from app.repositories.photo_animation_repository import PhotoAnimationRepository
    from app.repositories.photo_repository import PhotoRepository
    from app.services.photo_animation_service import PhotoAnimationService

    photo_ids = [
        client.post("/api/v1/photos", files={"file": ("a.png", _png(), "image/png")}, headers=auth_headers).json()["id"]
        for _ in range(2)
    ]
    animation_id = client.post(
        "/api/v1/photos/animations", json={"title": "Reel", "photo_ids": photo_ids}, headers=auth_headers
    ).json()["id"]
    PhotoAnimationService(PhotoAnimationRepository(db_session), PhotoRepository(db_session)).process_generation(animation_id)
    assert client.post(
        "/api/v1/community/posts", json={"photo_animation_id": animation_id}, headers=auth_headers
    ).status_code == 201

    assert client.delete(f"/api/v1/photos/animations/{animation_id}", headers=auth_headers).status_code == 204
    feed = client.get("/api/v1/community/feed", headers=auth_headers)
    assert feed.status_code == 200
    assert feed.json()["data"] == []


def test_refresh_refused_for_deactivated_account(client, db_session):
    client.post(
        "/api/v1/auth/signup",
        json={"first_name": "Gone", "last_name": "", "email": "gone@example.com", "password": "Secret@123"},
    )
    tokens = client.post("/api/v1/auth/login", json={"email": "gone@example.com", "password": "Secret@123"}).json()

    user = db_session.query(User).filter(User.email == "gone@example.com").one()
    user.is_active = False
    db_session.commit()

    response = client.post("/api/v1/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert response.status_code == 401


def test_default_jwt_secret_refused_outside_development():
    with pytest.raises(ValueError):
        Settings(environment="production", jwt_secret="change-me-in-production", _env_file=None)
    assert Settings(environment="production", jwt_secret="x" * 40, _env_file=None).environment == "production"
