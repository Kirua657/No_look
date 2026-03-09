# 🧠 No Look API (dev)

> **感情を「見える化」する教育支援バックエンド**  
> 生徒の短い文章から感情を自動解析し、共感的な返信を返す FastAPI アプリです。  
> 本文は保存せず、感情分布のみを統計データとして DB に蓄積します。

---

## 🌐 エンドポイント一覧

| Method | Path | 説明 |
|--------|------|------|
| `POST` | `/ask` | 文章を受け取り、短い返信と感情スコアを返す |
| `POST` | `/analyze` | 感情分布＋補助指標（signals）を返す（返信なし） |
| `GET`  | `/summary` | 日別件数サマリを返す |
| `GET`  | `/weekly_report` | 週次レポート（傾向・提案含む）を返す |
| `GET`  | `/metrics` | Prometheus 形式のメトリクス出力 |
| `GET`  | `/` | ヘルスチェック・バージョン情報 |

🧭 Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🚀 Quick Start

### 1️⃣ Clone & Branch
```bash
git clone https://github.com/Kirua657/No_look.git
cd No_look
git checkout dev   # ← 全員このブランチで開発


2️⃣ Setup
▶ Windows（PowerShell）
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env

▶ macOS / Linux
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

⚙️ .env 設定
| 変数名                  | 説明                           | 例                           |
| -------------------- | ---------------------------- | --------------------------- |
| `OPENAI_API_KEY`     | OpenAIのAPIキー（未設定なら辞書ルールのみ動作） | `sk-xxxx`                   |
| `API_KEY`            | API認証キー                      | `devkey-123`                |
| `DATABASE_URL`       | DB接続先                        | `sqlite:///./nolook_dev.db` |
| `ALLOWED_ORIGINS`    | CORS許可ドメイン                   | `http://localhost:3000`     |
| `NOLOOK_MANUAL_ONLY` | 1=完全手動モード / 0=自動＋LLM         | `0`                         |
| `NOLOOK_LLM_MODEL`   | 使用モデル                        | `gpt-4o-mini-2024-07-18`    |
| `NOLOOK_LLM_WEIGHT`  | ルール返信とLLM返信の比率 (0.0〜1.0)     | `0.7`                       |

▶️ 起動方法
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
ブラウザで http://127.0.0.1:8000/docsにアクセス。

💬 使用例
/ask
curl -s -X POST "http://127.0.0.1:8000/ask" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: devkey-123" \
  -d '{ "prompt": "修学旅行たのしみ！", "selected_emotion": "楽しい", "followup": true }'

✅ レスポンス例
{
  "reply": "それ最高じゃん！その勢い、次もいけそう。",
  "emotion": "楽しい",
  "labels": {
    "楽しい": 0.95, "悲しい": 0.0, "怒り": 0.0,
    "不安": 0.0, "しんどい": 0.0, "中立": 0.05
  },
  "used_llm": true,
  "style": "buddy",
  "followup": true
}

/analyze
curl -s -X POST "http://127.0.0.1:8000/analyze" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: devkey-123" \
  -d '{ "prompt": "今日は眠くてだるかった" }'

/summary
curl "http://127.0.0.1:8000/summary?days=7&tz=Asia/Tokyo" -H "X-API-Key: devkey-123"

🧩 実装構成
app/
 ├─ main.py                # FastAPIエントリポイント
 ├─ routes/
 │   ├─ ask.py             # 共感返信API（LLM＋ルール）
 │   ├─ analyze.py         # 感情解析API
 │   ├─ weekly_report.py   # 週次レポートAPI
 │   ├─ export.py          # CSV/JSON/XLSX出力
 │   └─ metrics.py         # Prometheusメトリクス
 ├─ services/
 │   ├─ analyze_service.py # 解析ロジック・辞書ルール
 │   ├─ normalizer.py      # 感情ラベル正規化
 │   └─ ...
 └─ models/
     └─ orm.py             # EmotionLog ORM定義

🧠 テスト
pytest -q

🧑‍💻 開発ルール

開発ブランチは dev のみ

commit メッセージは日本語で簡潔に（例: DB更新と集計修正）

.env は push せず、.env.example を利用

改行コードは LF（.gitattributes で統一）

コミット手順：

git add .
git commit -m "変更内容"
git push origin dev

⚡ トラブルシューティング
症状	対応策
❌ 401 Unauthorized	.env の API_KEY / OPENAI_API_KEY を確認
❌ 文字化け	PowerShell:
`chcp 65001
❌ ModuleNotFoundError: No module named 'app'	ルートで set PYTHONPATH=. または $env:PYTHONPATH = "$PWD;$PWD\No_look"
❌ DB未作成	sqlite3 nolook_dev.db を作成 or .env の DATABASE_URL 確認

