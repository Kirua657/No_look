# app/rules/__init__.py
from __future__ import annotations
import re
from typing import Literal

Emotion = Literal["楽しい", "悲しい", "怒り", "不安", "しんどい", "中立"]

# 単純ルール：上から優先
_PATTERNS = [
    # 悲しい（萎え/へこむ 追加）
    (re.compile(r"(落ち込|最悪|悲しい|萎え|へこむ)"), "悲しい"),
    # 怒り（イライラ 追加）
    (re.compile(r"(ムカつ|ふざけんな|怒|腹立|イライラ|いらいら)"), "怒り"),
    # 不安
    (re.compile(r"(不安|心配)"), "不安"),
    # しんどい
    (re.compile(r"(しんど|疲れ|無理)"), "しんどい"),
    # 楽しい
    (re.compile(r"(楽しい|嬉しい|最高|自己ベスト|優勝)"), "楽しい"),
]

def classify_emotion_rule(text: str) -> Emotion:
    t = (text or "").strip()
    if not t:
        return "中立"
    for pat, label in _PATTERNS:
        if pat.search(t):
            return label  # type: ignore[return-value]
    return "中立"
