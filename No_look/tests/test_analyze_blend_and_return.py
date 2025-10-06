import json
from datetime import datetime, timedelta, timezone

JST = timezone(timedelta(hours=9))

def _top_emotion(labels: dict) -> str:
    return max(labels, key=labels.get)

def test_upsert_same_day_blends_and_returns_new_labels(tmp_path):
    """
    同じCookie（=同じ生徒）×同じclass_id×同日 で
    1行にアップサートされ、2回目返却は“ブレンド後のnew_labels”になること。
    """
    m, client = make_client(tmp_path)

    # 1) 悲しい寄り
    r1 = client.post("/analyze", json={"class_id": "1-A", "prompt": "部活で失敗して落ち込んだ。つらい。"})
    assert r1.status_code == 200
    js1 = r1.json()
    id1 = js1["id"]
    sid1 = js1["student_id"]
    lab1 = js1["labels"]
    assert isinstance(lab1, dict) and len(lab1) == 6

    # 2) 直後に楽しい寄り（同じCookieセッション＝同じ生徒）
    r2 = client.post("/analyze", json={"class_id": "1-A", "prompt": "友達に褒められて嬉しい！ワクワクした！"})
    assert r2.status_code == 200
    js2 = r2.json()
    id2 = js2["id"]
    sid2 = js2["student_id"]
    lab2 = js2["labels"]

    # アップサート（同じ行を更新）なので id は同じ、生徒IDも同じ
    assert id2 == id1
    assert sid2 == sid1

    # 2回目返却が“最新ブレンド結果”になっていること（Joy寄りにシフト）
    assert lab2["楽しい"] > lab1.get("楽しい", 0.0)
    # 代表emotionもラベル最大と一致
    assert js2["emotion"] == _top_emotion(lab2)
    assert js2["score"] == lab2[js2["emotion"]]

def test_selected_emotion_one_hot_prioritized(tmp_path):
    """
    selected_emotion が来たら one-hot を完全優先して返却されること。
    """
    m, client = make_client(tmp_path)
    r = client.post("/analyze", json={"class_id": "1-A", "prompt": "文章は無視されるはず", "selected_emotion": "怒り"})
    assert r.status_code == 200
    js = r.json()
    lab = js["labels"]
    # one-hot
    assert lab["怒り"] == 1.0
    for k, v in lab.items():
        if k != "怒り":
            assert v == 0.0
    assert js["emotion"] == "怒り"
    assert js["score"] == 1.0

def test_class_boundary_creates_separate_rows(tmp_path):
    """
    同じ生徒でも class_id が違えば別行（別id）になること。
    """
    m, client = make_client(tmp_path)

    r1 = client.post("/analyze", json={"class_id": "1-A", "prompt": "悲しい…"})
    r2 = client.post("/analyze", json={"class_id": "1-B", "prompt": "悲しい…"})
    assert r1.status_code == 200 and r2.status_code == 200
    js1, js2 = r1.json(), r2.json()
    assert js1["student_id"] == js2["student_id"]  # Cookieは同じ
    assert js1["id"] != js2["id"]                  # ただしクラスが違うので別行

def test_different_cookie_makes_different_student(tmp_path):
    """
    Cookie（セッション）が違えば student_id が別になること。
    """
    m, client1 = make_client(tmp_path)  # セッション1
    m, client2 = make_client(tmp_path)  # セッション2（Cookie別）

    a = client1.post("/analyze", json={"class_id": "1-A", "prompt": "不安…"})
    b = client2.post("/analyze", json={"class_id": "1-A", "prompt": "不安…"})
    assert a.status_code == 200 and b.status_code == 200
    sid_a = a.json()["student_id"]
    sid_b = b.json()["student_id"]
    assert sid_a != sid_b

def test_response_shape_has_expected_fields(tmp_path):
    """
    返却フィールド（id/student_id/class_id/created_at/labels/emotion/score）が揃っていること。
    """
    m, client = make_client(tmp_path)
    r = client.post("/analyze", json={"class_id": "1-A", "prompt": "中立かも"})
    assert r.status_code == 200
    js = r.json()
    for key in ("id", "student_id", "class_id", "created_at", "labels", "emotion", "score"):
        assert key in js
    assert isinstance(js["labels"], dict) and len(js["labels"]) == 6
