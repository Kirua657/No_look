# app/services/normalizer.py
from __future__ import annotations
from pathlib import Path
import yaml

_CANON = ["楽しい", "悲しい", "怒り", "不安", "しんどい", "中立"]

# 最低限の内蔵エイリアス（YAMLが読めない環境でもテストを通す）
_FALLBACK = {
    "嬉しい": "楽しい", "うれしい": "楽しい", "たのしい": "楽しい", "楽しみ": "楽しい",
    "ok": "中立", "ふつう": "中立", "普通": "中立",
    "怒": "怒り", "ムカつ": "怒り", "イラ": "怒り",
    "不安": "不安",
    "しんど": "しんどい", "疲れ": "しんどい", "ヘトヘト": "しんどい",
    "悲しい": "悲しい", "落ち込": "悲しい", "ショック": "悲しい",
}

_alias_map = None

def _load_alias_map():
    global _alias_map
    if _alias_map is not None:
        return _alias_map
    # プロジェクト内 YAML を優先してロード
    candidates = [
        Path("config/emotion_aliases.yaml"),
        Path(__file__).resolve().parents[2] / "config" / "emotion_aliases.yaml",
    ]
    for p in candidates:
        if p.is_file():
            try:
                with p.open("r", encoding="utf-8") as f:
                    data = yaml.safe_load(f) or {}
                # 期待する形式: {"aliases": {"嬉しい": "楽しい", ...}}
                mapping = data.get("aliases") if isinstance(data, dict) else {}
                _alias_map = {**_FALLBACK, **(mapping or {})}
                return _alias_map
            except Exception:
                break
    _alias_map = dict(_FALLBACK)
    return _alias_map

def normalize_emotion(raw: str | None) -> str | None:
    if not raw:
        return None
    s = str(raw).strip()
    # そのまま canonical の場合
    if s in _CANON:
        return s
    m = _load_alias_map()
    # 完全一致か、部分一致（prefix/contains）で拾う
    if s in m:
        return m[s]
    for k, v in m.items():
        if k and k in s:
            return v
    return None
