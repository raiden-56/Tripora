"""Shared pytest fixtures: an isolated database per test + a TestClient with the
get_db dependency overridden (never touches the real DATABASE_URL).

Defaults to in-memory SQLite. Set TEST_DATABASE_URL to an empty, throwaway Postgres
database to run the same suite against Postgres (catches length / FK / enum issues
SQLite lets through); every table is created and dropped around each test.
"""

import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core import redis_client
from app.db import session as db_session_module
from app.db.base import Base
from app.db.session import enable_sqlite_foreign_keys, get_db
from app.main import app

redis_client.disable()

TEST_DATABASE_URL = os.environ.get("TEST_DATABASE_URL")


def _make_engine():
    if TEST_DATABASE_URL:
        return create_engine(TEST_DATABASE_URL)
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    enable_sqlite_foreign_keys(engine)
    return engine


@pytest.fixture()
def db_session(monkeypatch):
    engine = _make_engine()
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    # Background tasks (blog/animation generation) open their own session via
    # app.db.session.SessionLocal — point them at the same isolated test database.
    monkeypatch.setattr(db_session_module, "SessionLocal", TestingSessionLocal)
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
