from __future__ import annotations
import os, sys, logging
from importlib import import_module
from typing import Dict, Any

logger = logging.getLogger(__name__)

# --- OpenAI は任意依存 ---
try:
    from openai import OpenAI  # type: ignore
    from openai import (
        OpenAIError, APIError, APIConnectionError, RateLimitError,
        BadRequestError, AuthenticationError,
    )
except Exception:
    OpenAI = None  # type: ignore
    class _E(Exception): pass
    OpenAIError = APIError = APIConnectionError = RateLimitError = BadRequestError = AuthenticationError = _E  # type: ignore

# --- FastAPI 本体 ---
try:
    _base = import_module("app.main")
    app = getattr(_base, "app")
except Exception:
    from fastapi import FastAPI
    app = FastAPI()
    _base = None  # type: ignore

# --- verify_api_key / rate_limiter ダミー対応 ---
def _dummy_verify():
    return True

def _dummy_rate(_req=None):
    return True

verify_api_key = getattr(_base, "verify_api_key", _dummy_verify) if _base else _dummy_verify
rate_limiter   = getattr(_base, "rate_limiter", _dummy_rate)     if _base else _dummy_rate

# 🔹 テスト互換のため、モジュールに直接属性を生やす
current_module = sys.modules[__name__]
setattr(current_module, "verify_api_key", verify_api_key)
setattr(current_module, "rate_limiter", rate_limiter)

# ---- ラベル定義 ----
EMOTION_KEYS = tuple(getattr(
    _base, "EMOTION_KEYS",
    ("楽しい", "悲しい", "怒り", "不安", "しんどい", "中立"),
))
ALIAS_MAP: Dict[str, str] = dict(getattr(_base, "ALIAS_MAP", {k: k for k in EMOTION_KEYS}))

# ---- LLM ラッパ ----
def llm_classify(prompt: str) -> Dict[str, Any]:
    if OpenAI is None:
        return {"ok": False, "reason": "no_client"}

    api_key = os.getenv("OPENAI_API_KEY") or os.getenv("OPENAI_APIKEY") or ""
    if not api_key:
        return {"ok": False, "reason": "no_api_key"}

    client = OpenAI(api_key=api_key)
    try:
        model = os.getenv("OPENAI_MODEL", os.getenv("NOLOOK_LLM_MODEL", "gpt-4o-mini"))
        resp = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a short Japanese text classifier."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.0,
            max_tokens=200,
        )
        if hasattr(_base, "parse_llm_output"):
            return {"ok": True, "resp": _base.parse_llm_output(resp)}  # type: ignore[attr-defined]
        return {"ok": True, "resp": resp}
    except (RateLimitError, APIConnectionError, BadRequestError, AuthenticationError, APIError, OpenAIError) as e:
        logger.warning("LLM fallback(OpenAI): %s: %s", type(e).__name__, e)
        return {"ok": False, "reason": "llm_error"}
    except Exception as e:
        logger.exception("LLM unexpected error: %s", e)
        return {"ok": False, "reason": "llm_error"}

__all__ = [
    "app",
    "verify_api_key",
    "rate_limiter",
    "EMOTION_KEYS",
    "ALIAS_MAP",
    "llm_classify",
]
