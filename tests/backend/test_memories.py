"""Memory CRUD, including the tags round-trip (Memory.tags is stored as a
comma-separated string; MemoryOut must serialize it back to a real list)."""


def _create_destination(client, headers) -> int:
    payload = {"name": "Coorg", "country": "India", "latitude": 12.4244, "longitude": 75.7382, "status": "visited"}
    return client.post("/api/v1/destinations", json=payload, headers=headers).json()["id"]


def test_create_memory_with_tags(client, auth_headers):
    destination_id = _create_destination(client, auth_headers)

    response = client.post(
        "/api/v1/memories",
        json={
            "destination_id": destination_id,
            "title": "Sunset at Raja's Seat",
            "description": "Beautiful evening with the gang.",
            "memory_date": "2026-08-29",
            "tags": ["sunset", "friends"],
        },
        headers=auth_headers,
    )
    assert response.status_code == 201
    body = response.json()
    assert body["tags"] == ["sunset", "friends"]


def test_create_memory_without_tags(client, auth_headers):
    destination_id = _create_destination(client, auth_headers)

    response = client.post(
        "/api/v1/memories",
        json={"destination_id": destination_id, "title": "Quiet morning", "memory_date": "2026-08-30"},
        headers=auth_headers,
    )
    assert response.status_code == 201
    assert response.json()["tags"] == []


def test_list_and_update_memory_tags(client, auth_headers):
    destination_id = _create_destination(client, auth_headers)
    created = client.post(
        "/api/v1/memories",
        json={"destination_id": destination_id, "title": "Waterfall hike", "memory_date": "2026-08-28", "tags": ["hike"]},
        headers=auth_headers,
    ).json()

    listed = client.get("/api/v1/memories", headers=auth_headers).json()
    assert listed["meta"]["total"] == 1
    assert listed["data"][0]["tags"] == ["hike"]

    updated = client.put(
        f"/api/v1/memories/{created['id']}",
        json={"tags": ["hike", "waterfall", "coffee"]},
        headers=auth_headers,
    )
    assert updated.status_code == 200
    assert updated.json()["tags"] == ["hike", "waterfall", "coffee"]
