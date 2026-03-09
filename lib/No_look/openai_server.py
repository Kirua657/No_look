#!/usr/bin/env python3
import os
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict

# .env読み込み
load_dotenv()

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3007", "http://127.0.0.1:3007", "*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# OpenAI
try:
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    print(f"✅ OpenAI client initialized with key: {os.getenv('OPENAI_API_KEY', '')[:20]}...")
except Exception as e:
    client = None
    print(f"❌ OpenAI client failed: {e}")

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
def root():
    return {"message": "OpenAI API Server", "status": "ok"}

@app.post("/ask")
def ask(req: AskRequest):
    print(f"📝 Received: {req.prompt}")
    print(f"📋 Request details: style={req.style}, followup={req.followup}")
    
    # 簡単な感情分析
    text = req.prompt.lower()
    if "テスト" in text or "試験" in text:
        emotion = "不安"
    elif "楽しい" in text:
        emotion = "楽しい"
    elif "しんどい" in text or "きつい" in text:
        emotion = "しんどい"
    else:
        emotion = "中立"
    
    print(f"🎭 Detected emotion: {emotion}")
    
    labels = {e: 1.0 if e == emotion else 0.0 for e in ["楽しい", "悲しい", "怒り", "不安", "しんどい", "中立"]}
    
    # OpenAI API呼び出し
    if client:
        try:
            print("🤖 Calling OpenAI API...")
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "あなたは共感的で親しみやすいアシスタントです。1-2文で短く返答してください。"},
                    {"role": "user", "content": f"ユーザーが「{req.prompt}」と言いました。感情は「{emotion}」です。適切に返答してください。"}
                ],
                max_tokens=100,
                temperature=0.7
            )
            
            reply = response.choices[0].message.content.strip()
            
            # フォローアップメッセージの追加条件を制御
            if req.followup and emotion in ["不安", "しんどい"]:
                reply += " よかったら、もう少し詳しく教えて？"
            
            print(f"✅ OpenAI response: {reply}")
            
            return AskResponse(
                reply=reply,
                emotion=emotion,
                labels=labels,
                used_llm=True,
                style=req.style,
                followup=req.followup
            )
        except Exception as e:
            print(f"❌ OpenAI error: {e}")
            # フォールバック
            fallback_replies = {
                "楽しい": "それは素晴らしいことですね！",
                "不安": "テストお疲れ様です。緊張するのは自然なことですよ。",
                "しんどい": "お疲れ様です。無理をしないでくださいね。",
                "中立": "そうですね。お話しを聞かせてくれてありがとう。"
            }
            reply = fallback_replies.get(emotion, "お話しを聞かせてくれてありがとう。")
            
            # フォールバックでもフォローアップ条件を制御
            if req.followup and emotion in ["不安", "しんどい"]:
                reply += " よかったら、もう少し詳しく教えて？"
            
            return AskResponse(
                reply=reply,
                emotion=emotion,
                labels=labels,
                used_llm=False,
                llm_reason=f"OpenAI_ERROR: {str(e)}",
                style=req.style,
                followup=req.followup
            )
    else:
        return {"error": "OpenAI client not available"}

if __name__ == "__main__":
    print("🚀 Starting OpenAI API server on http://127.0.0.1:8001")
    uvicorn.run(app, host="127.0.0.1", port=8001)