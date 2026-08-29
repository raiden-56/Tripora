"""Photo animation (GIF) generation: request -> background processing -> output.

The actual pixel processing is exercised by calling PhotoAnimationService.process_generation
directly against the test's db_session fixture — the same session the API client is wired
to (see conftest.py's get_db override) — rather than through the real HTTP request's
Celery/BackgroundTask path, which opens its own SessionLocal() against the app's configured
database and therefore can't see rows created inside an isolated per-test in-memory DB.
"""

import io

from PIL import Image

from app.repositories.photo_animation_repository import PhotoAnimationRepository
from app.repositories.photo_repository import PhotoRepository
from app.services.photo_animation_service import PhotoAnimationService


def _tiny_png(color: tuple[int, int, int]) -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", (40, 40), color).save(buffer, format="PNG")
    return buffer.getvalue()


def _upload_photo(client, headers, color) -> int:
    response = client.post(
        "/api/v1/photos",
        files={"file": ("photo.png", _tiny_png(color), "image/png")},
        headers=headers,
    )
    return response.json()["id"]


def test_generate_animation_from_own_photos(client, auth_headers, db_session):
    photo_ids = [
        _upload_photo(client, auth_headers, (255, 0, 0)),
        _upload_photo(client, auth_headers, (0, 255, 0)),
        _upload_photo(client, auth_headers, (0, 0, 255)),
    ]

    response = client.post(
        "/api/v1/photos/animations",
        json={"title": "Coorg Highlights", "photo_ids": photo_ids},
        headers=auth_headers,
    )
    assert response.status_code == 202
    animation_id = response.json()["id"]
    assert response.json()["status"] == "pending"

    PhotoAnimationService(
        PhotoAnimationRepository(db_session), PhotoRepository(db_session)
    ).process_generation(animation_id)

    result = client.get(f"/api/v1/photos/animations/{animation_id}", headers=auth_headers).json()
    assert result["status"] == "completed"
    assert result["output_url"] is not None
    assert result["output_url"].endswith(".gif")


def test_cannot_animate_someone_elses_photo(client, auth_headers):
    photo_id = _upload_photo(client, auth_headers, (255, 255, 0))

    client.post(
        "/api/v1/auth/signup",
        json={"first_name": "Other", "last_name": "User", "email": "animator@example.com", "password": "Secret@123"},
    )
    other_login = client.post("/api/v1/auth/login", json={"email": "animator@example.com", "password": "Secret@123"})
    other_headers = {"Authorization": f"Bearer {other_login.json()['access_token']}"}

    other_photo_id = _upload_photo(client, other_headers, (10, 10, 10))

    response = client.post(
        "/api/v1/photos/animations",
        json={"title": "Not mine", "photo_ids": [photo_id, other_photo_id]},
        headers=other_headers,
    )
    assert response.status_code == 403


def test_requires_at_least_two_photos(client, auth_headers):
    photo_id = _upload_photo(client, auth_headers, (100, 100, 100))
    response = client.post(
        "/api/v1/photos/animations",
        json={"title": "Too short", "photo_ids": [photo_id]},
        headers=auth_headers,
    )
    assert response.status_code == 422
