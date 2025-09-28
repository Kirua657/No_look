# app/services/emotion.py
import re
from typing import Dict, List, Optional
from pydantic import BaseModel

EMOTION_KEYS = ["楽しい","悲しい","怒り","不安","しんどい","中立"]

LEXICON: Dict[str, List[str]] = {
    "楽しい": ["楽しい","嬉しい","うれしい","わくわく","最高","自己ベスト","満点","優勝","合格","やった"],
    # ★ 萎え / 落ち込 / 最悪 を悲しいへ
    "悲しい": ["悲しい","さみし","寂し","つらい","辛い","泣","凹む","落ち込","最悪","萎え","ショック"],
    # ★ イライラ / ムカつ を怒りへ
    "怒り": ["怒","ムカつ","むかつ","腹立","イライラ","キレ","理不尽","ぷんぷん"],
    "不安": ["不安","心配","怖い","こわい","緊張","焦り","びくびく","ドキドキ","パニック"],
    "しんどい": ["疲れ","だる","しんど","眠い","限界","きつ","めんど","体調悪","倦怠"],
}

class RuleResult(BaseModel):
    emotion: str
    labels: Dict[str, float]
    topic_tags: List[str] = []

def _normalize(labels: Dict[str, float]) -> Dict[str, float]:
    s = sum(labels.values())
    if s <= 0:
        return {k: (1.0 if k == "中立" else 0.0) for k in EMOTION_KEYS}
    return {k: v/s for k,v in labels.items()}

def classify_by_rules(text: str, topic_hint: Optional[List[str]] = None) -> RuleResult:
    t = text or ""

    # ★ 強制 Sad
    if ("落ち込" in t) or ("最悪" in t) or ("萎え" in t):
        labels = {k: 0.0 for k in EMOTION_KEYS}
        labels["悲しい"] = 1.0
        return RuleResult(emotion="悲しい", labels=labels, topic_tags=topic_hint or [])

    counts = {k: 0 for k in EMOTION_KEYS}
    for emo, kws in LEXICON.items():
        for kw in kws:
            counts[emo] += len(re.findall(re.escape(kw), t))

    if sum(counts.values()) == 0:
        labels = {k: 0.0 for k in EMOTION_KEYS}
        labels["中立"] = 1.0
        return RuleResult(emotion="中立", labels=labels, topic_tags=topic_hint or [])

    labels_f = _normalize({k: float(v) for k,v in counts.items()})
    top = max(labels_f, key=lambda k: labels_f[k])
    return RuleResult(emotion=top, labels={k: float(labels_f.get(k, 0.0)) for k in EMOTION_KEYS}, topic_tags=topic_hint or [])
