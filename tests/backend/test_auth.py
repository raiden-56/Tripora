"""Auth flow: signup, login, invalid credentials, refresh, and role protection."""


def test_signup_creates_account_and_returns_tokens(client):
    response = client.post(
        "/api/v1/auth/signup",
        json={"first_name": "Jane", "last_name": "Doe", "email": "jane@example.com", "password": "Secret@123"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["user"]["email"] == "jane@example.com"
    assert body["access_token"]
    assert body["refresh_token"]


def test_signup_rejects_duplicate_email(client):
    payload = {"first_name": "Jane", "last_name": "Doe", "email": "dup@example.com", "password": "Secret@123"}
    client.post("/api/v1/auth/signup", json=payload)
    response = client.post("/api/v1/auth/signup", json=payload)
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "EMAIL_TAKEN"


def test_login_with_wrong_password_is_rejected(client):
    client.post(
        "/api/v1/auth/signup",
        json={"first_name": "Jane", "last_name": "Doe", "email": "wrongpass@example.com", "password": "Secret@123"},
    )
    response = client.post("/api/v1/auth/login", json={"email": "wrongpass@example.com", "password": "nope"})
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "INVALID_CREDENTIALS"


def test_refresh_rotates_tokens(client):
    client.post(
        "/api/v1/auth/signup",
        json={"first_name": "Jane", "last_name": "Doe", "email": "refresh@example.com", "password": "Secret@123"},
    )
    login = client.post("/api/v1/auth/login", json={"email": "refresh@example.com", "password": "Secret@123"})
    refresh_token = login.json()["refresh_token"]

    response = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert response.status_code == 200
    assert response.json()["access_token"]

    # The old refresh token must now be revoked (rotation).
    reused = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert reused.status_code == 401


def test_protected_endpoint_requires_token(client):
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401


def test_protected_endpoint_works_with_token(client, auth_headers):
    response = client.get("/api/v1/users/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"


def test_admin_endpoint_rejects_regular_user(client, auth_headers):
    response = client.get("/api/v1/admin/reports", headers=auth_headers)
    assert response.status_code == 403
