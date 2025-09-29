from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Tuple, Any, Any
import os, random, logging

from app.services.emotion import classify_by_rules
from app.metrics import EMOTION_TOTAL  # 任意メトリクス

# ---- OpenAI v1 SDK（必要時にだけ作る遅延初期化） ----
try:
    from openai import OpenAI
    from openai import (
        OpenAIError, APIError, APIConnectionError,
        RateLimitError, BadRequestError, AuthenticationError,
    )
except Exception:
    OpenAI = None  # type: ignore
# -----------------------------------------------------

router = APIRouter(prefix="/ask", tags=["ask"])
log = logging.getLogger(__name__)

EMOTION_KEYS = ["楽しい", "悲しい", "怒り", "不安", "しんどい", "中立"]
DEBUG_LLM = os.getenv("DEBUG_LLM", "0") == "1"


class AskInput(BaseModel):
    prompt: str
    selected_emotion: Optional[str] = None
    style: Optional[str] = "buddy"   # "buddy" / "teacher" など
    followup: bool = True


class AskOutput(BaseModel):
    reply: str
    emotion: str
    style: str
    followup: bool
    used_llm: bool
    labels: Dict[str, float]
    llm_debug: Optional[Dict[str, Any]] = None
    llm_debug: Optional[Dict[str, Any]] = None
# ---- テンプレ（必ずフォールバックで出る）----
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


def pick_rule_reply(emotion: str, style: str, followup: bool) -> str:
    style = style if style in REPLIES else "buddy"
    arr = REPLIES[style].get(emotion, REPLIES[style]["中立"])
    base = random.choice(arr) if arr else REPLIES["buddy"]["中立"][0]
    if followup:
        base += FOLLOWUP_TAIL.get(style, FOLLOWUP_TAIL["buddy"])
    return base


def get_openai_client():
    """毎リクエストで鍵を見る遅延初期化。"""
    if OpenAI is None:
        return None
    key = os.getenv("OPENAI_API_KEY") or ""
    if not key:
        return None
    return OpenAI(api_key=key)


# ---- LLM短文返信（使えれば上書き）----
def llm_reply(user_text: str, emotion: str, style: str, followup: bool) -> Tuple[Optional[str], Optional[str]]:
    client = get_openai_client()
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
        "ユーザーの感情分類（楽しい/悲しい/怒り/不安/しんどい/中立）とスタイル方針に従う。"
        "必要なら末尾に短いフォローアップの一言を付ける。"
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
            model=os.getenv("NOLOOK_LLM_MODEL", "gpt-4o-mini"),
            messages=[{"role": "system", "content": sys}, {"role": "user", "content": user}],
            temperature=0.3,
            max_tokens=120,
        )
        out = (resp.choices[0].message.content or "").strip()
        if not out:
            return None, "empty_output"
        return out[:160], None
    except (RateLimitError, APIConnectionError, BadRequestError, AuthenticationError, APIError, OpenAIError) as e:
        return None, f"{type(e).__name__}: {e}"
    except Exception as e:
        return None, f"unexpected_error: {e}"


@router.post("", response_model=AskOutput)
def ask(body: AskInput):
    debug_llm = os.getenv("DEBUG_LLM", "0") == "1"

    text = (body.prompt or "").strip()
    if not text:
        raise HTTPException(status_code=422, detail="'prompt' is required.")

    # 1) まず辞書で感情判定
    rr = classify_by_rules(text, topic_hint=[])
    sel = (body.selected_emotion or "").strip()
    emotion = sel if sel in EMOTION_KEYS else rr.emotion
    labels = {k: float(rr.labels.get(k, 0.0)) for k in EMOTION_KEYS}

    # 2) ルール返信
    reply_text = pick_rule_reply(emotion, body.style or "buddy", bool(body.followup))

    # 3) LLM 上書き
    llm_text, llm_reason = llm_reply(text, emotion, body.style or "buddy", bool(body.followup))
    used_llm = bool(llm_text)
    if used_llm:
        reply_text = llm_text

    try:
        EMOTION_TOTAL.labels(emotion=emotion).inc()
    except Exception:
        pass

    resp = {
        "reply": reply_text,
        "emotion": emotion,
        "style": body.style or "buddy",
        "followup": bool(body.followup),
        "used_llm": used_llm,
        "labels": labels,
    }
    if debug_llm:
        resp["llm_debug"] = {
            "has_api_key": bool(os.getenv("OPENAI_API_KEY")),
            "model": os.getenv("NOLOOK_LLM_MODEL", "gpt-4o-mini"),
            "reason": llm_reason,
        }

    return resp



