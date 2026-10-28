from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "YClick Backend"

def test_generate_validation_failure():
    # Missing consent & photo should return 422 or 400
    response = client.post("/api/designs/generate", json={
        "userId": "user-123",
        "preferences": {
            "categoryId": "home-rooms",
            "subcategoryId": "living-room",
            "photoUri": "",
            "consentGiven": False,
            "budgetChoice": "Not sure yet",
            "style": "Modern"
        }
    })
    assert response.status_code == 400
