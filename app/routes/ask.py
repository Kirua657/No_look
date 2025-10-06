# app/routes/ask.py
from __future__ import annotations
import os, random, logging
from typing import Optional, Dict, Tuple, Any
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Request, Response, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.orm import EmotionLog
from app.services.analyze_service import analyze_text_to_labels, one_hot_from_selected
from app.services.normalizer import normalize_emotion

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ask", tags=["ask"])

# ====== 返信テンプレ ======
REPLIES = {
    "buddy": {
        "楽しい": ["それ最高じゃん！その勢い、次もいけそう。", "自己ベストおめでとう！次は何に挑戦する？"],
        "悲しい": ["それはつらかったね…。ここで吐き出せたのえらいよ。", "話してくれてありがとう。今日は少し休もう。"],
        "怒り":   ["ムカつくよね。その感覚は正しいし、無理に抑えなくていい。", "わかる。そのとき一番嫌だった点はどこ？"],
        "不安":   ["不安になるよね。いま“ひとつだけ”できることは？", "心配だね。期限と優先度を一緒に整理しよ。"],
        "しんどい":["おつかれさま。まずは深呼吸を3回。一歩ずつでOK。", "無理しないで。助けが要るときは合図してね。"],
        "中立":   ["OK、受け取ったよ。次の一歩を一緒に決めよ。", "今日の小さなハイライトを1つ教えて！"],
    },
    "teacher": {
        "楽しい": ["前向きで素晴らしい。記録に残して次の目標に繋げよう。"],
        "悲しい": ["気持ちの整理が先です。要因を一言メモにして共有しよう。"],
        "怒り":   ["事実ベースで振り返り、改善案を1点に絞って書こう。"],
        "不安":   ["不明点を“質問”に変えてみよう。答えやすくなるよ。"],
        "しんどい":["回復→軽負荷→通常の順で戻そう。今日は小さな達成でOK。"],
        "中立":   ["記録ありがとう。次回の目標を1行で追記しよう。"],
    }
}
FOLLOWUP_TAIL = {
    "buddy": " よかったら、もう少し詳しく教えて？",
    "teacher": " 次回は具体例を1つ添えてみましょう。",
}

# ====== Cookie / class_id 補助 ======
COOKIE_NAME = os.environ.get("NOLOOK_SID_COOKIE", "nll_sid")
SID_LEN = int(os.environ.get("NOLOOK_SID_LEN", "18"))
JST = timezone(timedelta(hours=9))

def _ensure_student_id(request: Request, response: Response) -> str:
    sid = request.cookies.get(COOKIE_NAME)
    if not sid:
        import secrets as _secrets
        sid = _secrets.token_urlsafe(SID_LEN)
        response.set_cookie(key=COOKIE_NAME, value=sid, max_age=60 * 60 * 24 * 365, httponly=True, samesite="lax")
    return sid

def _require_or_default_class_id(v: Optional[str]) -> str:
    strict = os.getenv("NOLOOK_CLASS_ID_STRICT", "0") == "1"
    default_cid = os.getenv("NOLOOK_CLASS_ID_DEFAULT", "default")
    if strict:
        if not v or not v.strip():
            raise HTTPException(status_code=422, detail="class_id は必須です。")
        return v.strip()
    return (v.strip() if v and v.strip() else default_cid)

def pick_rule_reply(emotion: str, style: Optional[str], followup: bool) -> str:
    s = style if style in REPLIES else "buddy"
    arr = REPLIES[s].get(emotion, REPLIES[s]["中立"])
    base = random.choice(arr) if arr else REPLIES["buddy"]["中立"][0]
    if followup:
        base += FOLLOWUP_TAIL.get(s, FOLLOWUP_TAIL["buddy"])
    return base

# ====== OpenAI（あれば上書き） ======
try:
    from openai import OpenAI
except Exception:
    OpenAI = None  # type: ignore

def _get_openai():
    if OpenAI is None:
        return None
    key = os.getenv("OPENAI_API_KEY") or ""
    return OpenAI(api_key=key) if key else None

def _get_model_name() -> str:
    name = (os.getenv("NOLOOK_LLM_MODEL") or "").strip()
    if not name or name.endswith("-"):
        return "gpt-4o-mini"
    return name

def llm_reply(user_text: str, emotion: str, style: str, followup: bool) -> Tuple[Optional[str], Optional[str]]:
    client = _get_openai()
    if not client:
        return None, "no_client"

    style_guides = {
        "buddy": "フレンドリーで寄り添う口調。やさしく短く。絵文字は使わない。",
        "teacher": "落ち着いた丁寧語。学習支援の観点で簡潔に助言。一文は短く。",
    }
    tail = FOLLOWUP_TAIL.get(style if style in style_guides else "buddy", "")
    sys = (
        "あなたは日本語で短い共感返信を作るアシスタントです。"
        "出力は1〜2文、合計120文字以内。助言は1点まで。箇条書き/絵文字禁止。"
        "ユーザーの感情（楽しい/悲しい/怒り/不安/しんどい/中立）とスタイルに従う。"
        "必要なら末尾に短いフォローアップを付ける。"
    )
    user = (
        f"# 入力\n{user_text}\n\n"
        f"# 感情: {emotion}\n"
        f"# スタイル: {style}\n"
        f"# 方針: {style_guides.get(style, style_guides['buddy'])}\n"
        f"# フォローアップ: {'あり' if followup else 'なし'}（末尾: {tail if followup else 'なし'}）\n"
    )
    try:
        resp = client.chat.completions.create(
            model=_get_model_name(),
            messages=[{"role": "system", "content": sys}, {"role": "user", "content": user}],
            temperature=0.3,
            max_tokens=120,
        )
        out = (resp.choices[0].message.content or "").strip()
        if not out:
            return None, "empty_output"
        return out[: int(os.getenv("NOLOOK_REPLY_MAX_CHARS", "160"))], None
    except Exception as e:
        return None, f"{type(e).__name__}: {e}"

# ====== I/O ======
class AskIn(BaseModel):
    prompt: str
    class_id: Optional[str] = None          # ★ 追加：DB保存用に任意クラスID
    selected_emotion: Optional[str] = None
    style: Optional[str] = "buddy"
    followup: bool = False

class AskOut(BaseModel):
    reply: str
    emotion: str
    labels: Dict[str, float]
    used_llm: bool = False
    llm_reason: Optional[str] = None
    style: Optional[str] = "buddy"
    followup: bool = False

@router.post("", response_model=AskOut)
def ask_route(payload: AskIn, request: Request, response: Response, db: Session = Depends(get_db)):
    manual_only = os.getenv("NOLOOK_MANUAL_ONLY", "0") == "1"
    if not payload.prompt or not payload.prompt.strip():
        raise HTTPException(status_code=400, detail="'prompt' is required.")

    # --- student_id & class_id 決定 ---
    sid = _ensure_student_id(request, response)
    class_id = _require_or_default_class_id(payload.class_id)

    # --- selected_emotion の前処理 ---
    sel_raw = payload.selected_emotion
    sel = (sel_raw or "").strip()
    invalid_tokens = {"未選択", "none", "null", "なし", "na", "n/a", "-"}
    if sel.lower() in invalid_tokens or sel == "":
        sel = None

    # --- ラベル決定 ---
    if sel is not None:
        norm = normalize_emotion(sel)
        if norm is None:
            if manual_only:
                raise HTTPException(status_code=422, detail="selected_emotion を正規化できません。")
            vec = analyze_text_to_labels(payload.prompt.strip())
        else:
            vec = one_hot_from_selected(norm)
    else:
        vec = analyze_text_to_labels(payload.prompt.strip())

    emo = max(vec, key=vec.get)
    score = float(vec[emo])

    # --- まずはルール返信 ---
    reply_text = pick_rule_reply(emo, payload.style, bool(payload.followup))

    # --- LLM 試行 ---
    llm_text, reason = llm_reply(payload.prompt.strip(), emo, payload.style or "buddy", bool(payload.followup))
    try:
        w = float(os.getenv("NOLOOK_LLM_WEIGHT", "1.0"))
        w = 0.0 if w < 0 else 1.0 if w > 1 else w
    except Exception:
        w = 1.0

    used_llm = False
    if llm_text:
        if w == 1.0 or (w > 0 and random.random() < w):
            reply_text = llm_text
            used_llm = True
        else:
            reason = (reason or "") + "|weighted_out"

    if os.getenv("DEBUG_LLM") == "1":
        logger.info(
            "ASK DEBUG | used_llm=%s reason=%s w=%.2f emo=%s style=%s followup=%s sel_raw=%r",
            used_llm, reason, w, emo, payload.style, payload.followup, sel_raw
        )

    # --- ★ DB保存（/analyze と同じ emotion_logs を使用） ---
    try:
        row = EmotionLog(
            class_id=class_id,
            student_id=sid,
            emotion=emo,
            score=score,
            labels=vec,
            topic_tags=[],
            relationship_mention=False,
            negation_index=0,
            avoidance=0,
        )
        db.add(row)
        db.commit()
    except Exception as e:
        # 失敗してもユーザー応答は返す（ログだけ残す）
        logger.exception("failed to insert emotion_log from /ask: %s", e)

    return AskOut(
        reply=reply_text,
        emotion=emo,
        labels=vec,
        used_llm=used_llm,
        llm_reason=reason,
        style=payload.style or "buddy",
        followup=payload.followup,
    )
