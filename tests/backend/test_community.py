"""Community feed: media-first posts (a shared album or animation), likes, comments."""

import io

from PIL import Image

from app.repositories.photo_animation_repository import PhotoAnimationRepository
from app.repositories.photo_repository import PhotoRepository
from app.services.photo_animation_service import PhotoAnimationService


def _tiny_png(color=(200, 50, 50)) -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", (40, 40), color).save(buffer, format="PNG")
    return buffer.getvalue()


def _signup_and_login(client, email: str) -> dict:
    client.post(
        "/api/v1/auth/signup",
        json={"first_name": "Community", "last_name": "User", "email": email, "password": "Secret@123"},
    )
    login = client.post("/api/v1/auth/login", json={"email": email, "password": "Secret@123"})
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


def _create_album(client, headers) -> int:
    photo = client.post(
        "/api/v1/photos",
        files={"file": ("p.png", _tiny_png(), "image/png")},
        headers=headers,
    ).json()
    share = client.post(
        "/api/v1/photos/share",
        json={"title": "My Album", "photo_ids": [photo["id"]], "is_public": True},
        headers=headers,
    ).json()
    return share["id"]


def _create_completed_animation(client, headers, db_session) -> int:
    photo_ids = [
        client.post(
            "/api/v1/photos", files={"file": ("a.png", _tiny_png((r, 0, 0)), "image/png")}, headers=headers
        ).json()["id"]
        for r in (10, 60)
    ]
    animation = client.post(
        "/api/v1/photos/animations",
        json={"title": "Highlights", "photo_ids": photo_ids},
        headers=headers,
    ).json()
    PhotoAnimationService(
        PhotoAnimationRepository(db_session), PhotoRepository(db_session)
    ).process_generation(animation["id"])
    return animation["id"]


def test_create_album_post_and_see_it_in_feed(client, auth_headers):
    share_id = _create_album(client, auth_headers)

    response = client.post(
        "/api/v1/community/posts",
        json={"photo_share_id": share_id, "caption": "What a trip!"},
        headers=auth_headers,
    )
    assert response.status_code == 201
    body = response.json()
    assert body["media_type"] == "album"
    assert body["like_count"] == 0
    assert body["comment_count"] == 0

    feed = client.get("/api/v1/community/feed", headers=auth_headers).json()
    assert feed["meta"]["total"] == 1
    assert feed["data"][0]["caption"] == "What a trip!"


def test_cannot_post_incomplete_animation(client, auth_headers):
    photo_ids = [
        client.post(
            "/api/v1/photos", files={"file": ("a.png", _tiny_png(), "image/png")}, headers=auth_headers
        ).json()["id"]
        for _ in range(2)
    ]
    animation = client.post(
        "/api/v1/photos/animations",
        json={"title": "Still cooking", "photo_ids": photo_ids},
        headers=auth_headers,
    ).json()

    response = client.post(
        "/api/v1/community/posts",
        json={"photo_animation_id": animation["id"]},
        headers=auth_headers,
    )
    assert response.status_code == 409


def test_can_post_completed_animation(client, auth_headers, db_session):
    animation_id = _create_completed_animation(client, auth_headers, db_session)

    response = client.post(
        "/api/v1/community/posts",
        json={"photo_animation_id": animation_id, "caption": "Highlight reel"},
        headers=auth_headers,
    )
    assert response.status_code == 201
    assert response.json()["media_type"] == "animation"
    assert response.json()["media_url"] is not None


def test_requires_exactly_one_media_reference(client, auth_headers):
    share_id = _create_album(client, auth_headers)
    response = client.post(
        "/api/v1/community/posts",
        json={"photo_share_id": share_id, "photo_animation_id": 999},
        headers=auth_headers,
    )
    assert response.status_code == 422

    response = client.post("/api/v1/community/posts", json={}, headers=auth_headers)
    assert response.status_code == 422


def test_cannot_post_someone_elses_album(client, auth_headers):
    share_id = _create_album(client, auth_headers)
    other_headers = _signup_and_login(client, "other-poster@example.com")

    response = client.post(
        "/api/v1/community/posts",
        json={"photo_share_id": share_id},
        headers=other_headers,
    )
    assert response.status_code == 403


def test_private_post_hidden_from_others_but_visible_to_author(client, auth_headers):
    share_id = _create_album(client, auth_headers)
    post = client.post(
        "/api/v1/community/posts",
        json={"photo_share_id": share_id, "visibility": "private"},
        headers=auth_headers,
    ).json()

    own_feed = client.get("/api/v1/community/feed", headers=auth_headers).json()
    assert own_feed["meta"]["total"] == 1

    other_headers = _signup_and_login(client, "viewer-only@example.com")
    other_feed = client.get("/api/v1/community/feed", headers=other_headers).json()
    assert other_feed["meta"]["total"] == 0

    like_attempt = client.post(f"/api/v1/community/posts/{post['id']}/like", headers=other_headers)
    assert like_attempt.status_code == 403


def test_like_toggle_and_comment_flow(client, auth_headers):
    share_id = _create_album(client, auth_headers)
    post = client.post(
        "/api/v1/community/posts", json={"photo_share_id": share_id}, headers=auth_headers
    ).json()
    other_headers = _signup_and_login(client, "liker@example.com")

    liked = client.post(f"/api/v1/community/posts/{post['id']}/like", headers=other_headers).json()
    assert liked["like_count"] == 1
    assert liked["liked_by_me"] is True

    unliked = client.post(f"/api/v1/community/posts/{post['id']}/like", headers=other_headers).json()
    assert unliked["like_count"] == 0
    assert unliked["liked_by_me"] is False

    commented = client.post(
        f"/api/v1/community/posts/{post['id']}/comments",
        json={"body": "Beautiful shots!"},
        headers=other_headers,
    ).json()
    assert commented["comment_count"] == 1
    assert commented["comments"][0]["body"] == "Beautiful shots!"


def test_only_author_or_post_owner_can_delete_comment(client, auth_headers):
    share_id = _create_album(client, auth_headers)
    post = client.post(
        "/api/v1/community/posts", json={"photo_share_id": share_id}, headers=auth_headers
    ).json()
    commenter_headers = _signup_and_login(client, "commenter@example.com")
    stranger_headers = _signup_and_login(client, "stranger-commenter@example.com")

    comment = client.post(
        f"/api/v1/community/posts/{post['id']}/comments",
        json={"body": "Nice!"},
        headers=commenter_headers,
    ).json()["comments"][0]

    forbidden = client.delete(
        f"/api/v1/community/posts/{post['id']}/comments/{comment['id']}", headers=stranger_headers
    )
    assert forbidden.status_code == 403

    # The post owner (not the commenter) can moderate comments on their own post.
    allowed = client.delete(
        f"/api/v1/community/posts/{post['id']}/comments/{comment['id']}", headers=auth_headers
    )
    assert allowed.status_code == 204
