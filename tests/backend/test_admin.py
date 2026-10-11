"""Admin dashboard API: user management, guide verification and reports."""

import pytest

from app.core.constants import UserRole
from app.models.user import User


def _signup(client, email: str, first_name: str = "Member") -> dict:
    client.post(
        "/api/v1/auth/signup",
        json={"first_name": first_name, "last_name": "User", "email": email, "password": "Secret@123"},
    )
    tokens = client.post("/api/v1/auth/login", json={"email": email, "password": "Secret@123"}).json()
    return {"Authorization": f"Bearer {tokens['access_token']}", "_refresh": tokens["refresh_token"]}


@pytest.fixture()
def admin(client, db_session):
    headers = _signup(client, "admin@example.com", first_name="Ada")
    user = db_session.query(User).filter(User.email == "admin@example.com").one()
    user.role = UserRole.ADMIN
    db_session.commit()
    return {"id": user.id, "headers": {"Authorization": headers["Authorization"]}}


def test_non_admins_are_refused(client, auth_headers):
    for path in ("/api/v1/admin/users", "/api/v1/admin/reports", "/api/v1/admin/guides"):
        assert client.get(path, headers=auth_headers).status_code == 403
    assert client.patch("/api/v1/admin/users/1", json={"is_active": False}, headers=auth_headers).status_code == 403


def test_list_and_search_users(client, admin, auth_headers):
    client.post(
        "/api/v1/destinations",
        json={"name": "Coorg", "country": "India", "latitude": 12.4, "longitude": 75.7},
        headers=auth_headers,
    )
    page = client.get("/api/v1/admin/users", headers=admin["headers"]).json()
    assert page["meta"]["total"] == 2
    test_user = next(u for u in page["data"] if u["email"] == "test@example.com")
    assert test_user["destinations"] == 1 and test_user["trips"] == 0

    found = client.get("/api/v1/admin/users?search=ADA", headers=admin["headers"]).json()
    assert [u["email"] for u in found["data"]] == ["admin@example.com"]
    admins = client.get("/api/v1/admin/users?role=ADMIN", headers=admin["headers"]).json()
    assert admins["meta"]["total"] == 1


def test_deactivate_signs_user_out_and_blocks_login(client, admin):
    member = _signup(client, "member@example.com")
    member_id = next(
        u["id"] for u in client.get("/api/v1/admin/users?search=member@", headers=admin["headers"]).json()["data"]
    )

    response = client.patch(f"/api/v1/admin/users/{member_id}", json={"is_active": False}, headers=admin["headers"])
    assert response.status_code == 200 and response.json()["is_active"] is False

    assert client.post("/api/v1/auth/refresh", json={"refresh_token": member["_refresh"]}).status_code == 401
    login = client.post("/api/v1/auth/login", json={"email": "member@example.com", "password": "Secret@123"})
    assert login.status_code == 401

    client.patch(f"/api/v1/admin/users/{member_id}", json={"is_active": True}, headers=admin["headers"])
    assert client.post("/api/v1/auth/login", json={"email": "member@example.com", "password": "Secret@123"}).status_code == 200


def test_admin_cannot_lock_themselves_out(client, admin):
    for body in ({"is_active": False}, {"role": "USER"}):
        response = client.patch(f"/api/v1/admin/users/{admin['id']}", json=body, headers=admin["headers"])
        assert response.status_code == 422
    assert client.patch(f"/api/v1/admin/users/{admin['id']}", json={"role": None}, headers=admin["headers"]).status_code == 422


def test_role_change_and_guide_verification(client, admin):
    guide_headers = _signup(client, "guide@example.com")
    guide = client.post(
        "/api/v1/guides",
        json={"headline": "Walks", "destination_name": "Coorg", "price_per_day": 1000},
        headers={"Authorization": guide_headers["Authorization"]},
    ).json()
    assert guide["is_verified"] is False

    verified = client.patch(f"/api/v1/admin/guides/{guide['id']}", json={"is_verified": True}, headers=admin["headers"])
    assert verified.json()["is_verified"] is True
    assert client.patch("/api/v1/admin/guides/999", json={"is_verified": True}, headers=admin["headers"]).status_code == 404

    promoted = client.patch(f"/api/v1/admin/users/{guide['user_id']}", json={"role": "ADMIN"}, headers=admin["headers"])
    assert promoted.json()["role"] == "ADMIN"


def test_reports(client, admin, auth_headers):
    for name, state in (("Coorg", "Karnataka"), ("Hampi", "Karnataka"), ("Coorg", "Karnataka")):
        client.post(
            "/api/v1/destinations",
            json={"name": name, "country": "India", "state": state, "latitude": 12.4, "longitude": 75.7,
                  "status": "visited"},
            headers=auth_headers if name != "Coorg" or state != "Karnataka" else admin["headers"],
        )
    report = client.get("/api/v1/admin/reports", headers=admin["headers"]).json()
    assert report["total_users"] == 2 and report["active_users"] == 2 and report["new_users_30d"] == 2
    assert report["total_destinations"] == 3
    assert report["popular_destinations"][0] == {"name": "Coorg", "count": 2}
    assert report["popular_states"] == [{"name": "Karnataka", "count": 3}]
    assert len(report["signups_by_month"]) >= 6
    assert sum(m["count"] for m in report["signups_by_month"]) == 2
