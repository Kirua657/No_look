#!/usr/bin/env python3
import os
import json
import random
import logging
from typing import Optional, Dict, Tuple
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# .envファイルを読み込み
load_dotenv()

# ログ設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="No_look API Server", version="1.0.0")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI設定
try:
    from openai import OpenAI
    openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", ""))
except Exception as e:
    openai_client = None
    logger.warning(f"OpenAI client failed to initialize: {e}")

def get_model_name() -> str:
    name = (os.getenv("NOLOOK_LLM_MODEL") or "").strip()
    return name if name and not name.endswith("-") else "gpt-4o-mini"

def llm_reply(user_text: str, emotion: str, style: str, followup: bool) -> Tuple[Optional[str], Optional[str]]:
    if not openai_client:
        return None, "no_client"

    style_guides = {
        "buddy": "フレンドリーで寄り添う口調。やさしく短く。絵文字は使わない。",
        "teacher": "落ち着いた丁寧語。学習支援の観点で簡潔に助言。一文は短く。",
    }
    
    followup_tail = {
        "buddy": " よかったら、もう少し詳しく教えて？",
        "teacher": " 次回は具体例を1つ添えてみましょう。",
    }
    
    tail = followup_tail.get(style if style in style_guides else "buddy", "")
    
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
        resp = openai_client.chat.completions.create(
            model=get_model_name(),
            messages=[{"role": "system", "content": sys}, {"role": "user", "content": user}],
            temperature=0.3,
            max_tokens=120,
        )
        
        output = (resp.choices[0].message.content or "").strip()
        if not output:
            return None, "empty_output"
        
        max_chars = int(os.getenv("NOLOOK_REPLY_MAX_CHARS", "160"))
        return output[:max_chars], None
        
    except Exception as e:
        logger.error(f"OpenAI API error: {e}")
        return None, f"{type(e).__name__}: {e}"

def analyze_emotion(text: str) -> str:
    """簡単な感情分析"""
    text = text.lower()
    
    if any(word in text for word in ["楽しい", "嬉しい", "幸せ", "最高", "良い", "素晴らしい", "やった", "成功", "できた"]):
        return "楽しい"
    elif any(word in text for word in ["悲しい", "辛い", "寂しい", "落ち込", "泣", "悲", "つらい", "ひどい"]):
        return "悲しい"
    elif any(word in text for word in ["怒", "ムカつく", "腹立つ", "イライラ", "うざい", "許せない", "頭にくる"]):
        return "怒り"
    elif any(word in text for word in ["不安", "心配", "怖い", "緊張", "ドキドキ", "やばい", "どうしよう"]):
        return "不安"
    elif any(word in text for word in ["疲れ", "しんどい", "大変", "きつい", "だるい", "眠い", "つかれ", "きつかった", "分からん", "わからん", "難しい", "困った", "めんどくさい"]):
        return "しんどい"
    else:
        return "中立"

def get_fallback_reply(emotion: str, style: str, followup: bool) -> str:
    """フォールバック用のルールベース返信"""
    replies = {
        "buddy": {
            "楽しい": ["それ最高じゃん！その勢い、次もいけそう。", "自己ベストおめでとう！次は何に挑戦する？"],
            "悲しい": ["それはつらかったね…。ここで吐き出せたのえらいよ。", "話してくれてありがとう。今日は少し休もう。"],
            "怒り": ["ムカつくよね。その感覚は正しいし、無理に抑えなくていい。", "わかる。そのとき一番嫌だった点はどこ？"],
            "不安": ["不安になるよね。いま「ひとつだけ」できることは？", "心配だね。期限と優先度を一緒に整理しよ。"],
            "しんどい": ["おつかれさま。まずは深呼吸を3回。一歩ずつでOK。", "無理しないで。助けが要るときは合図してね。"],
            "中立": ["OK、受け取ったよ。次の一歩を一緒に決めよ。", "今日の小さなハイライトを1つ教えて！"],
        },
        "teacher": {
            "楽しい": ["前向きで素晴らしい。記録に残して次の目標に繋げよう。"],
            "悲しい": ["気持ちの整理が先です。要因を一言メモにして共有しよう。"],
            "怒り": ["事実ベースで振り返り、改善案を1点に絞って書こう。"],
            "不安": ["不明点を「質問」に変えてみよう。答えやすくなるよ。"],
            "しんどい": ["回復→軽負荷→通常の順で戻そう。今日は小さな達成でOK。"],
            "中立": ["記録ありがとう。次回の目標を1行で追記しよう。"],
        }
    }
    
    followup_tail = {
        "buddy": " よかったら、もう少し詳しく教えて？",
        "teacher": " 次回は具体例を1つ添えてみましょう。",
    }
    
    s = style if style in replies else "buddy"
    arr = replies[s].get(emotion, replies[s]["中立"])
    base = random.choice(arr) if arr else replies["buddy"]["中立"][0]
    
    if followup:
        base += followup_tail.get(s, followup_tail["buddy"])
    
    return base

# リクエスト/レスポンスモデル
class AskRequest(BaseModel):
    prompt: str
    style: Optional[str] = "buddy"
    followup: bool = False

class AskResponse(BaseModel):
    reply: str
    emotion: str
    labels: Dict[str, float]
    used_llm: bool = False
    llm_reason: Optional[str] = None
    style: str = "buddy"
    followup: bool = False

@app.get("/")
def read_root():
    return {"message": "No_look API Server is running!", "status": "ok"}

@app.post("/ask", response_model=AskResponse)
def ask_endpoint(request: AskRequest):
    if not request.prompt or not request.prompt.strip():
        raise HTTPException(status_code=400, detail="'prompt' is required.")
    
    # 感情分析
    emotion = analyze_emotion(request.prompt.strip())
    
    # ラベル作成
    labels = {
        "楽しい": 1.0 if emotion == "楽しい" else 0.0,
        "悲しい": 1.0 if emotion == "悲しい" else 0.0,
        "怒り": 1.0 if emotion == "怒り" else 0.0,
        "不安": 1.0 if emotion == "不安" else 0.0,
        "しんどい": 1.0 if emotion == "しんどい" else 0.0,
        "中立": 1.0 if emotion == "中立" else 0.0
    }
    
    # まずはルール返信を準備
    fallback_reply = get_fallback_reply(emotion, request.style or "buddy", request.followup)
    
    # LLM を試行
    llm_text, reason = llm_reply(request.prompt.strip(), emotion, request.style or "buddy", request.followup)
    
    # LLM重み設定
    try:
        w = float(os.getenv("NOLOOK_LLM_WEIGHT", "1.0"))
        w = max(0.0, min(1.0, w))  # 0-1にクランプ
    except Exception:
        w = 1.0
    
    used_llm = False
    reply_text = fallback_reply
    
    if llm_text:
        if w == 1.0 or (w > 0 and random.random() < w):
            reply_text = llm_text
            used_llm = True
        else:
            reason = (reason or "") + "|weighted_out"
    
    # デバッグログ
    if os.getenv("DEBUG_LLM") == "1":
        logger.info(
            f"ASK DEBUG | used_llm={used_llm} reason={reason} w={w:.2f} emotion={emotion} style={request.style} followup={request.followup}"
        )
        logger.info(f"Prompt: {request.prompt}")
        logger.info(f"Reply: {reply_text}")
    
    return AskResponse(
        reply=reply_text,
        emotion=emotion,
        labels=labels,
        used_llm=used_llm,
        llm_reason=reason,
        style=request.style or "buddy",
        followup=request.followup,
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)