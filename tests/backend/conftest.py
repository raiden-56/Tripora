"""Shared pytest fixtures: an isolated in-memory SQLite DB per test + a TestClient
with the get_db dependency overridden (never touches the real DATABASE_URL)."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.session import get_db
from app.main import app


@pytest.fixture()
def db_session():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db_session):
    def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def auth_headers(client):
    client.post(
        "/api/v1/auth/signup",
        json={"first_name": "Test", "last_name": "User", "email": "test@example.com", "password": "Test@1234"},
    )
    response = client.post("/api/v1/auth/login", json={"email": "test@example.com", "password": "Test@1234"})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
