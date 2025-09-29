from fastapi import APIRouter, Body, HTTPException
from app.core.db import session_scope, init_db
from app.models.orm import EmotionLog
from app.services.emotion import classify_by_rules
from datetime import datetime, UTC
from app.metrics import EMOTION_TOTAL 

router = APIRouter()
_initialized = False

EMOTION_KEYS = ["楽しい","悲しい","怒り","不安","しんどい","中立"]

@router.post("", summary="テキストを6分類で解析（text / prompt 両対応）")
def analyze(payload: dict = Body(...)):
    """
    後方互換: JSON の "text" でも "prompt" でもOK。dict受けで422を回避。
    常に emotion / score / labels / signals を返す。
    """
    global _initialized
    if not _initialized:
        init_db()
        _initialized = True

    raw = (payload.get("text") or payload.get("prompt") or "")
    text = str(raw).strip()
    if not text:
        raise HTTPException(status_code=400, detail="text/prompt が空です。")

    topic_hint = payload.get("topic_hint") or []
    class_id = payload.get("class_id")

    rr = classify_by_rules(text, topic_hint)
    selected = payload.get("selected_emotion")
    final_emotion = (selected or rr.emotion)

    # ---- 追い越しルール（否定/反転/ブースト）ここから ----
    def _any(s: str, parts: tuple[str, ...]) -> bool:
        return any(p in s for p in parts)

    NEG_TO_NEUTRAL = ("じゃなくて", "ではない", "じゃない")
    RESOLVED = ("けど意外と平気", "けど大丈夫", "が大丈夫", "が平気")
    JOY_NEG = ("うれしくない", "嬉しくない", "楽しくない", "たのしくない", "喜べない")

    BOOSTS: dict[str, tuple[str, ...]] = {
        "楽しい": ("褒められ", "テンション上が", "推し", "新曲", "元気出た", "最高"),
        "怒り":   ("約束破ら", "腹が立つ", "イラッ", "理不尽", "キレそう", "刺さって", "ムカつ"),
        "不安":   ("そわそわ", "心配", "不安", "眠れない", "どうなるか"),
        "しんどい":("ヘトヘト", "何もしたくない", "キャパオーバー", "だるい", "体が重い", "しんど"),
        "悲しい": ("落ち込", "泣きたい", "つらい", "ショック"),
    }

    if _any(text, JOY_NEG):
        final_emotion = "悲しい"
    elif _any(text, NEG_TO_NEUTRAL) and _any(text, ("ムカつ", "怒", "イラ")):
        final_emotion = "中立"
    elif _any(text, RESOLVED):
        final_emotion = "中立"
    elif final_emotion == "中立":
        for emo, cues in BOOSTS.items():
            if _any(text, cues):
                final_emotion = emo
                break
    # ---- 追い越しルールここまで ----

    score = float(rr.labels.get(final_emotion, 1.0))

    with session_scope() as s:
        row = EmotionLog(
            class_id=class_id,
            emotion=final_emotion,
            score=score,
            relationship_mention=False,
            negation_index=0.0,
            avoidance=0.0,
            labels={k: float(rr.labels.get(k, 0.0)) for k in EMOTION_KEYS},
            topic_tags=list(rr.topic_tags or []),
            created_at=datetime.now(UTC).replace(tzinfo=None),
        )
        s.add(row)

    EMOTION_TOTAL.labels(emotion=final_emotion).inc()

    return {
        "emotion": final_emotion,
        "score": score,
        "labels": {k: float(rr.labels.get(k, 0.0)) for k in EMOTION_KEYS},
        "signals": {
            "relationship_mention": False,
            "negation_index": 0.0,
            "avoidance": 0.0,
            "topic_tags": rr.topic_tags or [],
        },
    }
