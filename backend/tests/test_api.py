import io
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

AUTH_HEADER = {"Authorization": "Bearer test-token-user-123"}

def test_health_check_public():
    """Health check endpoint must be public without authentication."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "YClick Backend"

def test_generate_requires_auth():
    """Generating designs without Bearer token must return 401."""
    response = client.post("/api/designs/generate", json={
        "userId": "user-123",
        "preferences": {
            "categoryId": "home-rooms",
            "subcategoryId": "living-room",
            "photoUri": "https://example.com/room.jpg",
            "consentGiven": True,
            "budgetChoice": "Budget",
            "style": "Modern"
        }
    })
    assert response.status_code == 401

def test_generate_mismatched_user_id_returns_403():
    """Generating designs with token for user-123 but body for user-999 must return 403."""
    response = client.post(
        "/api/designs/generate",
        headers=AUTH_HEADER,  # token UID is 'user-123'
        json={
            "userId": "different-user-999",
            "preferences": {
                "categoryId": "home-rooms",
                "subcategoryId": "living-room",
                "photoUri": "https://example.com/room.jpg",
                "consentGiven": True,
                "budgetChoice": "Budget",
                "style": "Modern"
            }
        }
    )
    assert response.status_code == 403
    assert "Forbidden" in response.json()["detail"]

def test_generate_validation_missing_photo():
    """Missing photoUri must return 400."""
    response = client.post(
        "/api/designs/generate",
        headers=AUTH_HEADER,
        json={
            "userId": "user-123",
            "preferences": {
                "categoryId": "home-rooms",
                "subcategoryId": "living-room",
                "photoUri": "",
                "consentGiven": False,
                "budgetChoice": "Not sure yet",
                "style": "Modern"
            }
        }
    )
    assert response.status_code == 400

def test_generate_validation_missing_consent():
    """Missing user consent must return 400."""
    response = client.post(
        "/api/designs/generate",
        headers=AUTH_HEADER,
        json={
            "userId": "user-123",
            "preferences": {
                "categoryId": "home-rooms",
                "subcategoryId": "living-room",
                "photoUri": "https://example.com/photo.jpg",
                "consentGiven": False,
                "budgetChoice": "Budget",
                "style": "Modern"
            }
        }
    )
    assert response.status_code == 400
    assert "consent" in response.json()["detail"].lower()

def test_chat_requires_auth():
    """Chat endpoint must reject unauthenticated requests."""
    response = client.post("/api/designs/chat", json={
        "messages": [{"role": "user", "content": "How do I light a small bedroom?"}],
        "roomContext": "small bedroom"
    })
    assert response.status_code == 401

def test_analyze_requires_auth():
    """Image analysis must reject unauthenticated requests."""
    dummy_file = io.BytesIO(b"fake image content")
    response = client.post(
        "/api/designs/analyze",
        files={"file": ("test.jpg", dummy_file, "image/jpeg")}
    )
    assert response.status_code == 401

def test_analyze_rejects_invalid_mime():
    """Image analysis must reject non-image file types with 400."""
    dummy_file = io.BytesIO(b"malicious script")
    response = client.post(
        "/api/designs/analyze",
        headers=AUTH_HEADER,
        files={"file": ("test.pdf", dummy_file, "application/pdf")}
    )
    assert response.status_code == 400
    assert "Invalid file type" in response.json()["detail"]

def test_analyze_rejects_empty_file():
    """Image analysis must reject empty file with 400."""
    empty_file = io.BytesIO(b"")
    response = client.post(
        "/api/designs/analyze",
        headers=AUTH_HEADER,
        files={"file": ("empty.jpg", empty_file, "image/jpeg")}
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()

def test_auth_sync_claims_requires_token():
    """Sync claims endpoint must require authentication."""
    response = client.post("/api/auth/sync-claims")
    assert response.status_code == 401

def test_auth_sync_claims_success():
    """Sync claims succeeds with valid test token."""
    response = client.post("/api/auth/sync-claims", headers=AUTH_HEADER)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["uid"] == "user-123"
    assert data["claims"]["role"] == "authenticated"


def test_delete_account_requires_auth():
    """Account deletion must reject unauthenticated requests with 401."""
    response = client.delete("/api/auth/delete-account")
    assert response.status_code == 401

def test_delete_account_success():
    """Account deletion succeeds with valid auth token."""
    response = client.delete("/api/auth/delete-account", headers=AUTH_HEADER)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["uid"] == "user-123"
