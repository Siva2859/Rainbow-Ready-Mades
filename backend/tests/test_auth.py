from fastapi.testclient import TestClient


def test_register_customer_success(client: TestClient):
    """Customer can successfully register with valid details."""
    resp = client.post("/api/v1/auth/register", json={
        "full_name": "Aarav Patel",
        "email": "aarav@example.com",
        "password": "Password123!",
        "phone": "+919876543222"
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["success"] is True
    assert data["data"]["email"] == "aarav@example.com"
    assert data["data"]["role"] == "USER"


def test_register_duplicate_email_fails(client: TestClient, regular_user):
    """Registration with an already existing email returns 409 Conflict."""
    resp = client.post("/api/v1/auth/register", json={
        "full_name": "Duplicate User",
        "email": "customer@example.com",
        "password": "Password123!"
    })
    assert resp.status_code == 409
    assert resp.json()["success"] is False


def test_login_success(client: TestClient, regular_user):
    """Customer can log in with valid credentials and receive a JWT token."""
    resp = client.post("/api/v1/auth/login", json={
        "email": "customer@example.com",
        "password": "SecretPassword123!"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert data["data"]["user"]["email"] == "customer@example.com"


def test_login_invalid_password(client: TestClient, regular_user):
    """Login with wrong password returns 401 Unauthorized."""
    resp = client.post("/api/v1/auth/login", json={
        "email": "customer@example.com",
        "password": "WrongPassword999!"
    })
    assert resp.status_code == 401
    assert resp.json()["success"] is False


def test_get_current_user_profile(client: TestClient, auth_headers):
    """Authenticated user can fetch their personal profile."""
    resp = client.get("/api/v1/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["data"]["email"] == "customer@example.com"


def test_protected_endpoint_without_token_fails(client: TestClient):
    """Accessing protected endpoint without token returns 401."""
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 401
