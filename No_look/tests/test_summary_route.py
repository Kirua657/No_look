# tests/test_summary_route.py
import importlib
from fastapi.testclient import TestClient

def make_client():
    m = importlib.import_module("app.main")
    return TestClient(m.app)

def test_summary_basic():
    c = make_client()
    r = c.get("/summary?days=3&tz=Asia/Tokyo")
    assert r.status_code == 200
    js = r.json()
    assert js["days"] == 3
    assert len(js["daily"]) == 3
    for d in js["daily"]:
        assert "counts" in d
        for k in ["楽しい","悲しい","怒り","不安","しんどい","中立"]:
            assert k in d["counts"]
