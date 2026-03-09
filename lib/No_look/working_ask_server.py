#!/usr/bin/env python3
"""
Working Ask API Server
Replaces the complex ask.py with a simple, working implementation
"""
import os
import sys
import random
import json
from datetime import datetime
from pathlib import Path

sys.path.insert(0, os.path.abspath('.'))

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="No Look Ask API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AskRequest(BaseModel):
    prompt: str
    style: Optional[str] = "buddy"
    followup: bool = False
    class_id: Optional[str] = None
    selected_emotion: Optional[str] = None

# AI response templates for fallback
TEMPLATE_RESPONSES = {
    "楽しい": [
        "それは素晴らしいですね！その楽しい気持ちを大切にしてください。",
        "とても良い気分ですね！何がそんなに楽しかったのですか？",
        "楽しい時間を過ごせているようで良かったです！"
    ],
    "悲しい": [
        "辛い気持ちを話してくれてありがとう。一人じゃないよ。",
        "そういう日もありますね。ゆっくり休んでください。",
        "大変でしたね。無理しないでくださいね。"
    ],
    "怒り": [
        "その気持ち、よく分かります。怒るのは自然な反応です。",
        "イライラしますよね。深呼吸して落ち着きましょう。",
        "怒りを感じるのは当然です。どうしましたか？"
    ],
    "不安": [
        "不安な気持ち、分かります。一緒に考えましょう。",
        "心配事があるんですね。話せる範囲で教えてください。",
        "不安になるのは自然です。一歩ずつ進みましょう。"
    ],
    "しんどい": [
        "本当にお疲れ様です。無理しないでくださいね。",
        "大変な時期ですね。少し休憩しませんか？",
        "しんどい時は誰かに頼っても大丈夫ですよ。"
    ],
    "中立": [
        "お話しを聞かせてくれてありがとう。",
        "そうですね、よく分かります。",
        "なるほど、そういうことなんですね。"
    ]
}

def simple_emotion_analysis(text: str) -> str:
    """Simple emotion detection based on keywords"""
    text = text.lower()
    
    if any(word in text for word in ["楽しい", "嬉しい", "幸せ", "最高", "素晴らしい", "良い"]):
        return "楽しい"
    elif any(word in text for word in ["悲しい", "辛い", "寂しい", "落ち込む"]):
        return "悲しい"
    elif any(word in text for word in ["怒", "イライラ", "腹立つ", "ムカつく"]):
        return "怒り"
    elif any(word in text for word in ["不安", "心配", "怖い", "緊張"]):
        return "不安"
    elif any(word in text for word in ["疲れ", "しんどい", "大変", "きつい"]):
        return "しんどい"
    else:
        return "中立"

def get_llm_response(prompt: str, emotion: str) -> Optional[str]:
    """Get response from OpenAI LLM"""
    try:
        from openai import OpenAI
        
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            print("No OpenAI API key found")
            return None
            
        client = OpenAI(api_key=api_key)
        
        system_prompt = (
            "あなたは日本の学生をサポートする優しいアシスタントです。"
            "短く温かい返事をしてください。1-2文で、120文字以内でお願いします。"
            f"学生の感情は「{emotion}」です。その感情に寄り添った返事をしてください。"
        )
        
        response = client.chat.completions.create(
            model=os.getenv("NOLOOK_LLM_MODEL", "gpt-4o-mini"),
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=100,
        )
        
        result = response.choices[0].message.content.strip()
        print(f"✅ LLM Response: {result}")
        return result
        
    except Exception as e:
        print(f"❌ LLM Error: {e}")
        return None

def save_response_data(prompt: str, response: str, emotion: str, used_llm: bool):
    """Save response data to JSON file"""
    try:
        data_dir = Path("data/ai_responses")
        data_dir.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.now()
        filename = f"{timestamp.strftime('%Y-%m-%d')}_responses.json"
        filepath = data_dir / filename
        
        # Load existing data or create new
        if filepath.exists():
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
        else:
            data = {"responses": []}
        
        # Add new response
        data["responses"].append({
            "timestamp": timestamp.isoformat(),
            "user_input": prompt,
            "ai_response": response,
            "emotion": emotion,
            "used_llm": used_llm
        })
        
        # Save back to file
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        print(f"✅ Saved response to {filepath}")
        
    except Exception as e:
        print(f"❌ Save error: {e}")

@app.post("/ask")
def ask(request: AskRequest):
    """Main ask endpoint"""
    try:
        print(f"📝 Received request: {request.prompt}")
        
        # Emotion analysis
        emotion = simple_emotion_analysis(request.prompt)
        print(f"😊 Detected emotion: {emotion}")
        
        # Try LLM first
        llm_response = get_llm_response(request.prompt, emotion)
        
        if llm_response and len(llm_response.strip()) > 0:
            # LLM success
            response_text = llm_response
            used_llm = True
            llm_reason = None
            print("🤖 Using LLM response")
        else:
            # Fallback to template
            templates = TEMPLATE_RESPONSES.get(emotion, TEMPLATE_RESPONSES["中立"])
            response_text = random.choice(templates)
            used_llm = False
            llm_reason = "llm_failed_or_empty"
            print("📋 Using template response")
        
        # Add followup if requested
        if request.followup:
            response_text += " よかったら、もう少し詳しく教えて？"
        
        # Save data
        save_response_data(request.prompt, response_text, emotion, used_llm)
        
        # Create emotion labels (simple version)
        labels = {emotion_name: 1.0 if emotion_name == emotion else 0.0 
                 for emotion_name in ["楽しい", "悲しい", "怒り", "不安", "しんどい", "中立"]}
        
        result = {
            "reply": response_text,
            "emotion": emotion,
            "labels": labels,
            "used_llm": used_llm,
            "llm_reason": llm_reason,
            "style": request.style,
            "followup": request.followup
        }
        
        print(f"✅ Response: {result}")
        return result
        
    except Exception as e:
        print(f"❌ Ask endpoint error: {e}")
        import traceback
        traceback.print_exc()
        
        # Emergency fallback
        return {
            "reply": "すみません、エラーが発生しました。もう一度お試しください。",
            "emotion": "中立",
            "labels": {"楽しい": 0.0, "悲しい": 0.0, "怒り": 0.0, "不安": 0.0, "しんどい": 0.0, "中立": 1.0},
            "used_llm": False,
            "llm_reason": f"error: {str(e)}",
            "style": request.style or "buddy",
            "followup": request.followup
        }

@app.get("/")
def root():
    return {"message": "No Look Ask API is running", "status": "ok"}

@app.get("/health")
def health():
    """Health check endpoint"""
    return {"status": "healthy", "llm_available": bool(os.getenv("OPENAI_API_KEY"))}

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting No Look Ask API Server...")
    print(f"🔑 OpenAI API Key: {'Available' if os.getenv('OPENAI_API_KEY') else 'Missing'}")
    uvicorn.run(app, host="0.0.0.0", port=8000)