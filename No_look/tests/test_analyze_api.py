from fastapi.testclient import TestClient
from app.main import app

c = TestClient(app)

def test_analyze_accepts_prompt_and_text():
    r1 = c.post("/analyze", json={"prompt":"今日は萎えたー","class_id":"1-A"})
    r2 = c.post("/analyze", json={"text":"部活でムカついた","class_id":"1-A"})
    for r in (r1, r2):
        assert r.status_code == 200
        js = r.json()
        assert set(js) >= {"id","created_at","class_id","emotion","score","labels","features","signals"}
        assert all(isinstance(v, float) for v in js["labels"].values())

def test_analyze_selected_emotion_overrides():
    r = c.post("/analyze", json={"prompt":"うれしくない", "selected_emotion":"楽しい"})
    assert r.status_code == 200
    assert r.json()["emotion"] == "楽しい"  # 手動優先

def test_analyze_joy_negation_rule():
    r = c.post("/analyze", json={"prompt":"今日は楽しくない…"})
    assert r.status_code == 200
    assert r.json()["emotion"] in {"悲しい","中立"}

def test_analyze_empty_400():
    r = c.post("/analyze", json={"prompt":"   "})
    assert r.status_code == 400
