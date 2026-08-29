"""Trip collaborator invite/accept flow and the permission gate it puts on trip photos."""


def _signup_and_login(client, email: str) -> dict:
    client.post(
        "/api/v1/auth/signup",
        json={"first_name": "Collab", "last_name": "User", "email": email, "password": "Secret@123"},
    )
    login = client.post("/api/v1/auth/login", json={"email": email, "password": "Secret@123"})
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


def _create_trip(client, headers) -> int:
    payload = {"title": "Coorg Weekend", "start_date": "2026-09-01", "end_date": "2026-09-03", "status": "planned"}
    return client.post("/api/v1/trips", json=payload, headers=headers).json()["id"]


def test_owner_can_invite_existing_user(client, auth_headers):
    trip_id = _create_trip(client, auth_headers)
    _signup_and_login(client, "viewer@example.com")

    response = client.post(
        f"/api/v1/trips/{trip_id}/collaborators",
        json={"email": "viewer@example.com", "role": "viewer"},
        headers=auth_headers,
    )
    assert response.status_code == 201
    body = response.json()
    assert body["status"] == "pending"
    assert body["role"] == "viewer"
    assert body["trip_title"] == "Coorg Weekend"


def test_cannot_invite_unregistered_email(client, auth_headers):
    trip_id = _create_trip(client, auth_headers)
    response = client.post(
        f"/api/v1/trips/{trip_id}/collaborators",
        json={"email": "nobody@example.com", "role": "viewer"},
        headers=auth_headers,
    )
    assert response.status_code == 404


def test_non_owner_cannot_invite(client, auth_headers):
    trip_id = _create_trip(client, auth_headers)
    other_headers = _signup_and_login(client, "outsider@example.com")
    _signup_and_login(client, "target@example.com")

    response = client.post(
        f"/api/v1/trips/{trip_id}/collaborators",
        json={"email": "target@example.com", "role": "viewer"},
        headers=other_headers,
    )
    assert response.status_code == 403


def test_accept_flow_grants_trip_access_and_role(client, auth_headers):
    trip_id = _create_trip(client, auth_headers)
    viewer_headers = _signup_and_login(client, "viewer2@example.com")

    invite = client.post(
        f"/api/v1/trips/{trip_id}/collaborators",
        json={"email": "viewer2@example.com", "role": "viewer"},
        headers=auth_headers,
    ).json()

    # Not yet visible in /trips before acceptance.
    before = client.get("/api/v1/trips", headers=viewer_headers).json()
    assert before["meta"]["total"] == 0

    accept = client.post(
        f"/api/v1/trips/{trip_id}/collaborators/{invite['id']}/accept", headers=viewer_headers
    )
    assert accept.status_code == 200
    assert accept.json()["status"] == "accepted"

    after = client.get("/api/v1/trips", headers=viewer_headers).json()
    assert after["meta"]["total"] == 1
    assert after["data"][0]["role"] == "viewer"


def test_declining_invite_removes_it(client, auth_headers):
    trip_id = _create_trip(client, auth_headers)
    viewer_headers = _signup_and_login(client, "decliner@example.com")

    invite = client.post(
        f"/api/v1/trips/{trip_id}/collaborators",
        json={"email": "decliner@example.com", "role": "viewer"},
        headers=auth_headers,
    ).json()

    decline = client.post(
        f"/api/v1/trips/{trip_id}/collaborators/{invite['id']}/decline", headers=viewer_headers
    )
    assert decline.status_code == 204

    remaining = client.get("/api/v1/trips", headers=viewer_headers).json()
    assert remaining["meta"]["total"] == 0


def test_viewer_can_see_photos_but_not_upload(client, auth_headers):
    trip_id = _create_trip(client, auth_headers)
    viewer_headers = _signup_and_login(client, "vieweronly@example.com")
    invite = client.post(
        f"/api/v1/trips/{trip_id}/collaborators",
        json={"email": "vieweronly@example.com", "role": "viewer"},
        headers=auth_headers,
    ).json()
    client.post(f"/api/v1/trips/{trip_id}/collaborators/{invite['id']}/accept", headers=viewer_headers)

    owner_upload = client.post(
        "/api/v1/photos",
        data={"trip_id": str(trip_id)},
        files={"file": ("trip.png", b"fake-bytes", "image/png")},
        headers=auth_headers,
    )
    assert owner_upload.status_code == 201

    viewer_list = client.get(f"/api/v1/photos?trip_id={trip_id}", headers=viewer_headers)
    assert viewer_list.status_code == 200
    assert len(viewer_list.json()) == 1

    viewer_upload = client.post(
        "/api/v1/photos",
        data={"trip_id": str(trip_id)},
        files={"file": ("nope.png", b"fake-bytes", "image/png")},
        headers=viewer_headers,
    )
    assert viewer_upload.status_code == 403


def test_editor_can_upload_photos(client, auth_headers):
    trip_id = _create_trip(client, auth_headers)
    editor_headers = _signup_and_login(client, "editor@example.com")
    invite = client.post(
        f"/api/v1/trips/{trip_id}/collaborators",
        json={"email": "editor@example.com", "role": "editor"},
        headers=auth_headers,
    ).json()
    client.post(f"/api/v1/trips/{trip_id}/collaborators/{invite['id']}/accept", headers=editor_headers)

    upload = client.post(
        "/api/v1/photos",
        data={"trip_id": str(trip_id)},
        files={"file": ("trip.png", b"fake-bytes", "image/png")},
        headers=editor_headers,
    )
    assert upload.status_code == 201


def test_stranger_cannot_view_trip_photos(client, auth_headers):
    trip_id = _create_trip(client, auth_headers)
    stranger_headers = _signup_and_login(client, "stranger@example.com")

    response = client.get(f"/api/v1/photos?trip_id={trip_id}", headers=stranger_headers)
    assert response.status_code == 403
