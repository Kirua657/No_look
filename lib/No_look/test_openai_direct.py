#!/usr/bin/env python3
import os
from dotenv import load_dotenv

# .envファイルを読み込み
load_dotenv()

# OpenAI APIのテスト
try:
    from openai import OpenAI
    
    # APIキーを取得
    api_key = os.getenv("OPENAI_API_KEY")
    print(f"API Key (first 20 chars): {api_key[:20] if api_key else 'None'}...")
    
    if not api_key:
        print("❌ OPENAI_API_KEY が設定されていません")
        exit(1)
    
    # クライアントを作成
    client = OpenAI(api_key=api_key)
    
    # モデル名を取得
    model_name = os.getenv("NOLOOK_LLM_MODEL", "gpt-4o-mini")
    print(f"Using model: {model_name}")
    
    # テスト用プロンプト
    user_text = "今日はとても楽しい気分です！"
    emotion = "楽しい"
    style = "buddy"
    followup = True
    
    style_guides = {
        "buddy": "フレンドリーで寄り添う口調。やさしく短く。絵文字は使わない。",
        "teacher": "落ち着いた丁寧語。学習支援の観点で簡潔に助言。一文は短く。",
    }
    
    tail = " よかったら、もう少し詳しく教えて？"
    
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
    
    print("=== OpenAI API呼び出し開始 ===")
    print(f"System: {sys}")
    print(f"User: {user}")
    
    # API呼び出し
    resp = client.chat.completions.create(
        model=model_name,
        messages=[
            {"role": "system", "content": sys}, 
            {"role": "user", "content": user}
        ],
        temperature=0.3,
        max_tokens=120,
    )
    
    output = (resp.choices[0].message.content or "").strip()
    print(f"\n✅ 成功！")
    print(f"AI応答: {output}")
    print(f"文字数: {len(output)}")
    
except Exception as e:
    print(f"❌ エラー: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()