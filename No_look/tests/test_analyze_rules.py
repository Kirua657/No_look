from fastapi.testclient import TestClient
from app.main import app

c = TestClient(app)

def test_analyze_fun():
    r = c.post("/analyze", json={"text":"自己ベストで最高に嬉しい！", "class_id":"1-A"})
    j = r.json()
    assert r.status_code == 200
    assert j["emotion"] in ["楽しい","中立"]
    assert 0.0 <= j["score"] <= 1.0
