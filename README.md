# No Look API (dev)

生徒の入力から **やさしい一言返信** と **感情の数値化（統計）** を行う FastAPI バックエンド。  
本文は保存せず、**統計のみ** をDBに保存します。

---

## エンドポイント（要約）

- `POST /ask`  
  入力: `{ "prompt": "..." }`（任意で `selected_emotion` / `followup` など）  
  出力: `reply`（短い会話調）と感情分布 `labels`
- `POST /analyze`  
  入力: `{ "prompt": "..." }`（任意で `selected_emotion`）  
  出力: 感情分布 `labels` と補助指標 `signals`（本文や返信は返さない）
- `GET /summary?days=7&tz=Asia/Tokyo`  
  直近 n 日の感情件数（日別）
- `GET /weekly_report?days=7&tz=Asia/Tokyo`  
  週次レポート（合計/トレンド/サマリ/提案）

> 仕様メモ  
> - `selected_emotion` を渡すと **手動ラベルを最優先**（表記ゆれは内部で正規化）  
> - `NOLOOK_MANUAL_ONLY=1` のときは `selected_emotion` 必須（未指定は 400）

---

## クイックスタート

### 1) 取得 & ブランチ
```bash
git clone https://github.com/Kirua657/No_look.git
cd No_look
git checkout dev   # ← 全員このブランチで作業/共有します

##　2) 仮想環境 & 依存
Windows (PowerShell)
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env

macOS / Linux
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

3) .env を編集
.env の主な値（必要に応じて調整）
API_KEY=devkey-123
NOLOOK_RATE_LIMIT_PER_MIN=60
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
PORT=8000

# OpenAI を使わないなら 1 のままでOK（辞書ルールで動きます）
NOLOOK_DISABLE_OPENAI=1
NOLOOK_LLM_WEIGHT=0.7
OPENAI_API_KEY=

# DB (デフォルト: SQLite)開発用に使っている。あとから変える予定です。
DATABASE_URL=sqlite:///./nolook_dev.db

4) サーバ起動
uvicorn genai.main:app --reload --host 0.0.0.0 --port 8000
or
python .\genai\main.py
# Swagger: http://127.0.0.1:8000/docs

使い方サンプル
  -H Authorize"X-API-Key: こいつを入力してください⇒devkey-123" \
/ask
curl -s -X POST "http://127.0.0.1:8000/ask" \
  -H "Content-Type: application/json" \
  -d '{ "prompt": "テスト返却で自己ベスト！" }'
手動ラベル（表記ゆれOK）を渡す例:
-d '{ "prompt": "修学旅行たのしみ！", "selected_emotion": "嬉しい", "followup": true }'

/analyze
curl -s -X POST "http://127.0.0.1:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{ "prompt": "今日は眠くてだるかった" }'

/summary
Try it out押すだけ

/weekly_report
summary同様

開発ルール（超シンプル）
共有ブランチは dev 1本（push したら即共有。PR/マージ待ちは不要（わからん、必要かも））
作業前に 必ず pull → 作業 → push
git checkout dev
git pull origin dev
# 変更
git add .
git commit -m "変更内容を一言で"
git push origin dev
コンフリクトが出たら: git pull origin dev → 競合を直す → git add . → git commit → git push

よくあるハマり（超大事）
.env を push しない
.gitignore で除外済み。万一追跡されたら:
git rm --cached .env
git commit -m "remove real .env"
git push origin dev

動作確認（最小）
# Python 実行
uvicorn genai.main:app --reload

# Swaggerで /ask を1回叩く
# 例: prompt="今日は萎えたー", selected_emotion なし
# → 200 / reply が返る

# 手動モード確認（NOLOOK_MANUAL_ONLY=1）
# selected_emotion 未指定で /ask → 400 が返る

こんな感じでできるはずです。
