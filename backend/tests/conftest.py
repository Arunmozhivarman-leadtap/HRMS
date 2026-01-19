import pytest
import os
import sys
from typing import AsyncGenerator, Generator
from fastapi.testclient import TestClient
from httpx import AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from main import app
from core.database import Base, get_db
from core.config import settings

# Use a test database or an in-memory SQLite for speed/isolation if possible, 
# but for this audit we might want to test against a real DB structure.
# For now, we will assume we are testing against the main DB but with transactional rollback.
# WARNING: Be careful not to commit data to prod DB if credentials match.
# Ideally, we should override settings.DATABASE_URL here.

@pytest.fixture(scope="session")
def db_engine():
    engine = create_engine(settings.DATABASE_URL)
    return engine

@pytest.fixture(scope="function")
def db_session(db_engine) -> Generator[Session, None, None]:
    """
    Creates a new database session for a test.
    Rolls back the transaction after the test is complete.
    """
    connection = db_engine.connect()
    transaction = connection.begin()
    session = sessionmaker(bind=connection)()

    yield session

    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db_session) -> Generator[TestClient, None, None]:
    """
    Fixture for FastAPI TestClient with overridden DB dependency.
    """
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture
def auth_headers(client):
    """
    Helper to get auth headers for a test user.
    Note: We need a way to get a valid token. 
    Either mock the auth dependency or login real user.
    """
    # For now, we'll try to login with a known test user if they exist, 
    # or creates one. 
    # TODO: Implement token retrieval logic
    return {}
