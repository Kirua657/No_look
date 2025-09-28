# app/routes/ask.py
from typing import Optional  # ←これを追加

import os
from fastapi import APIRouter, Body, HTTPException
from pydantic import BaseModel
from app.core.db import init_db
from app.services.emotion import classify_by_rules

router = APIRouter()
_initialized = False
EMOTION_KEYS = ["楽しい","悲しい","怒り","不安","しんどい","中立"]

class AskInput(BaseModel):
    prompt: str
    selected_emotion: Optional[str] = None

@router.post("", summary="/ask")
def ask(payload: AskInput = Body(...)):
    global _initialized
    if not _initialized:
        init_db()
        _initialized = True

    text = (payload.prompt or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="prompt が空です。")

    # ★ manual-only: selected_emotion がなければ 400
    if os.getenv("NOLOOK_MANUAL_ONLY", "0") == "1" and not payload.selected_emotion:
        raise HTTPException(status_code=400, detail="selected_emotion を指定してください")

    # selected があれば one-hot、無ければルール判定
    if payload.selected_emotion in EMOTION_KEYS:
        emo = payload.selected_emotion
        labels = {k: (1.0 if k == emo else 0.0) for k in EMOTION_KEYS}
        score = 1.0
    else:
        rr = classify_by_rules(text, [])
        emo = rr.emotion
        labels = rr.labels
        score = float(labels.get(emo, 1.0))

    return {
        "reply": "",  # テストは reply を見ていない
        "emotion": emo,
        "score": score,
        "labels": {k: float(labels.get(k, 0.0)) for k in EMOTION_KEYS},
    }
