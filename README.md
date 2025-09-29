# No Look API (dev)

📊 **「No Look」** は生徒の入力テキストから  
- **やさしい一言返信（会話っぽい短文）**  
- **感情の数値化（統計のみ保存）**  

を行う FastAPI バックエンドです。本文そのものは保存せず、感情分布だけを DB に蓄積します。

---

## 🌐 エンドポイント概要

| Method | Path                | 説明 |
|--------|---------------------|------|
| POST   | `/ask`              | 短い返信と感情分布を返す |
| POST   | `/analyze`          | 感情分布＋補助指標（signals）、返信は返さない |
| GET    | `/summary`          | 日別件数サマリ |
| GET    | `/weekly_report`    | 週次レポート（合計・傾向・提案） |
| GET    | `/metrics`          | Prometheus メトリクス |
| GET    | `/`                 | ヘルスチェック |

👉 **Swagger**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🚀 Quick Start

### 1. Clone & Branch
```bash
git clone https://github.com/Kirua657/No_look.git
cd No_look
git checkout dev   # 全員このブランチで作業

2. Setup
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

3. Configure .env
| 変数                   | 説明                            | 例                           |
| -------------------- | ----------------------------- | --------------------------- |
| `OPENAI_API_KEY`     | OpenAI の API キー（未設定なら辞書ルールのみ） | `sk-xxxx`                   |
| `API_KEY`            | API 認証用キー                     | `devkey-123`                |
| `DATABASE_URL`       | DB 接続先                        | `sqlite:///./nolook_dev.db` |
| `ALLOWED_ORIGINS`    | CORS 許可                       | `http://localhost:3000`     |
| `NOLOOK_MANUAL_ONLY` | 1=完全手動 / 0=自動＋LLM             | `0`                         |
| `NOLOOK_LLM_MODEL`   | 利用するモデル                       | `gpt-4o-mini-2024-07-18`    |
| `NOLOOK_LLM_WEIGHT`  | ルール vs LLM の比率                | `0.7`                       |


4. Run
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000


📖 Usage Examples
/ask
curl -s -X POST "http://127.0.0.1:8000/ask" \
  -H "Content-Type: application/json" \
  -d '{ "prompt": "修学旅行たのしみ！", "selected_emotion": "楽しい", "followup": true }'

/analyze
curl -s -X POST "http://127.0.0.1:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{ "prompt": "今日は眠くてだるかった" }'

/summary
curl "http://127.0.0.1:8000/summary?days=7&tz=Asia/Tokyo"

Contributing

開発ブランチは dev 1本

作業フロー:

git checkout dev
git pull origin dev
# 変更
git add .
git commit -m "変更内容を一言で"
git push origin dev


.env は push しない（.env.example を利用）

改行コードは LF（.gitattributes で統一）

⚡ よくあるハマり

401 Unauthorized → .env の OPENAI_API_KEY が無効

文字化け → PowerShell で

chcp 65001 | Out-Null
$OutputEncoding = [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)



