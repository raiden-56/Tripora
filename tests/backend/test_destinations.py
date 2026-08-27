"""Destination CRUD + ownership enforcement."""


def test_create_and_list_destination(client, auth_headers):
    payload = {
        "name": "Coorg", "country": "India", "state": "Karnataka",
        "latitude": 12.4244, "longitude": 75.7382, "status": "visited",
    }
    create_response = client.post("/api/v1/destinations", json=payload, headers=auth_headers)
    assert create_response.status_code == 201
    destination_id = create_response.json()["id"]

    list_response = client.get("/api/v1/destinations", headers=auth_headers)
    assert list_response.status_code == 200
    body = list_response.json()
    assert body["meta"]["total"] == 1
    assert body["data"][0]["id"] == destination_id


def test_update_destination_status(client, auth_headers):
    payload = {"name": "Ladakh", "country": "India", "latitude": 34.1526, "longitude": 77.5771, "status": "wishlist"}
    created = client.post("/api/v1/destinations", json=payload, headers=auth_headers).json()

    updated = client.put(
        f"/api/v1/destinations/{created['id']}", json={"status": "planned"}, headers=auth_headers
    )
    assert updated.status_code == 200
    assert updated.json()["status"] == "planned"


def test_delete_destination(client, auth_headers):
    payload = {"name": "Gokarna", "country": "India", "latitude": 14.5479, "longitude": 74.317, "status": "wishlist"}
    created = client.post("/api/v1/destinations", json=payload, headers=auth_headers).json()

    delete_response = client.delete(f"/api/v1/destinations/{created['id']}", headers=auth_headers)
    assert delete_response.status_code == 204

    get_response = client.get(f"/api/v1/destinations/{created['id']}", headers=auth_headers)
    assert get_response.status_code == 404


def test_user_cannot_access_another_users_destination(client, auth_headers):
    payload = {"name": "Munnar", "country": "India", "latitude": 10.0889, "longitude": 77.0595, "status": "visited"}
    created = client.post("/api/v1/destinations", json=payload, headers=auth_headers).json()

    client.post(
        "/api/v1/auth/signup",
        json={"first_name": "Other", "last_name": "User", "email": "other@example.com", "password": "Secret@123"},
    )
    other_login = client.post("/api/v1/auth/login", json={"email": "other@example.com", "password": "Secret@123"})
    other_headers = {"Authorization": f"Bearer {other_login.json()['access_token']}"}

    response = client.get(f"/api/v1/destinations/{created['id']}", headers=other_headers)
    assert response.status_code == 403
