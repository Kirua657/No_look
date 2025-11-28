# genai/main.py — 旧 import パス互換の薄いラッパー（堅牢版）
from importlib import import_module

_base = import_module("app.main")

# 必須
app = getattr(_base, "app")

# 6感情キー（フォールバックあり）
EMOTION_KEYS = getattr(
    _base,
    "EMOTION_KEYS",
    ["楽しい", "悲しい", "怒り", "不安", "しんどい", "中立"],
)

# alias マップ（テストが key の存在を見ているので最低限は満たす）
ALIAS_MAP = getattr(
    _base,
    "ALIAS_MAP",
    {k: k for k in EMOTION_KEYS},
)

__all__ = ["app", "EMOTION_KEYS", "ALIAS_MAP"]
