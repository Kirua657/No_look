# tests/test_selected_normalize.py
def test_selected_emotion_normalize(client):
    r = client.post("/analyze", json={"class_id":"1-A","prompt":"x","selected_emotion":"怒怒りり"})
    assert r.status_code == 200
    assert r.json()["emotion"] == "怒り"

def test_selected_emotion_reject(client):
    r = client.post("/analyze", json={"class_id":"1-A","prompt":"x","selected_emotion":"キラキラ"})
    assert r.status_code == 422

def test_class_id_required_strict(monkeypatch, client):
    monkeypatch.setenv("NOLOOK_CLASS_ID_STRICT","1")
    r = client.post("/analyze", json={"prompt":"x"})
    assert r.status_code == 422

def test_class_id_default_when_not_strict(monkeypatch, client):
    monkeypatch.setenv("NOLOOK_CLASS_ID_STRICT","0")
    monkeypatch.setenv("NOLOOK_CLASS_ID_DEFAULT","default")
    r = client.post("/analyze", json={"prompt":"x"})
    assert r.status_code == 200
