# Next.js + No_look 統合プロジェクト

このプロジェクトは、Next.js フロントエンドと No_look バックエンド（FastAPI）を統合した感情ログ解析システムです。

## 🚀 クイックスタート

### 1. 依存関係のインストール

```bash
# フロントエンド依存関係
npm install

# バックエンド依存関係（Pythonが必要）
cd lib/No_look
pip install -r requirements.txt
cd ../..
```

### 2. 環境設定

#### フロントエンド設定
```bash
# フロントエンド環境変数をコピー
copy .env.example .env.local
```

#### バックエンド設定
```bash
# バックエンド環境変数を設定
npm run setup:backend
```

**重要: APIキーの設定**
`lib/No_look/.env` を編集して以下を設定してください：

```bash
# OpenAI APIキー（必須）
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# データベースURL（任意、デフォルトはSQLite）
DATABASE_URL=sqlite:///C:/Users/YOUR_USERNAME/Documents/NoLook/nolook_dev.db

# その他の設定は基本的にデフォルトでOK
```

### 3. 開発サーバーの起動

#### 個別起動
```bash
# バックエンドのみ起動
npm run backend

# フロントエンドのみ起動
npm run dev
```

#### 同時起動（推奨）
```bash
# フロントエンドとバックエンドを同時起動
npm run dev:full
```

## 📁 プロジェクト構造

```
next_go_front/
├── app/                      # Next.js App Router
├── components/               # Reactコンポーネント
├── hooks/                    # カスタムフック
├── lib/
│   ├── api/                  # バックエンドAPI連携
│   │   ├── client.ts         # APIクライアント
│   │   ├── emotionService.ts # 感情解析API
│   │   ├── teacherService.ts # 教師ダッシュボードAPI
│   │   └── index.ts          # APIサービス統合
│   ├── firebase/             # Firebase設定
│   ├── No_look/              # バックエンド（クローン済み）
│   └── start_backend.py      # バックエンド起動スクリプト
├── public/                   # 静的ファイル
├── styles/                   # スタイル
└── types/                    # TypeScript型定義
```

## 🔌 API連携

### 感情解析API

```typescript
import { emotionService } from '@/lib/api';

// テキストの感情解析
const result = await emotionService.analyze({
  text: "今日はとても楽しかった！",
  user_id: "user123"
});

// 質問応答
const answer = await emotionService.ask({
  question: "最近の感情の傾向を教えて",
  context: "過去1週間のデータ"
});

// サマリー取得
const summary = await emotionService.getSummary({
  start_date: "2024-01-01",
  end_date: "2024-01-07"
});
```

### 教師ダッシュボードAPI

```typescript
import { teacherService } from '@/lib/api';

// ダッシュボードデータ取得
const dashboard = await teacherService.getDashboardData("class1");

// 学生詳細データ取得
const student = await teacherService.getStudentDetail("student123");

// アラート設定
const settings = await teacherService.updateAlertSettings({
  emotion_threshold: 0.8,
  notification_enabled: true
});
```

## 🔧 設定項目

### フロントエンド環境変数（.env.local）

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | バックエンドAPIのURL | `http://localhost:8000` |
| `NEXT_PUBLIC_API_KEY` | API認証キー | 未設定 |

### バックエンド環境変数（lib/No_look/.env）

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `OPENAI_API_KEY` | OpenAI APIキー | ✅ |
| `DATABASE_URL` | データベース接続URL | ❌ |
| `API_KEY` | FastAPI認証キー | ❌ |
| `ALLOWED_ORIGINS` | CORS許可オリジン | ❌ |

## 🌐 アクセスURL

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8000
- **API文書**: http://localhost:8000/docs
- **API ReDoc**: http://localhost:8000/redoc

## 🛠️ 開発用コマンド

```bash
# 依存関係インストール
npm install

# フロントエンド開発サーバー
npm run dev

# バックエンドサーバー
npm run backend

# 同時起動
npm run dev:full

# ビルド
npm run build

# プロダクション起動
npm run start

# リンター
npm run lint

# バックエンド環境設定
npm run setup:backend
```

## 📝 使用技術

### フロントエンド
- **Next.js 15** - Reactフレームワーク
- **TypeScript** - 型安全な開発
- **Tailwind CSS** - ユーティリティファーストCSS
- **Three.js / React Three Fiber** - 3D描画
- **Framer Motion** - アニメーション
- **Firebase** - 認証・データベース

### バックエンド
- **FastAPI** - PythonのWebフレームワーク
- **LangChain** - LLM統合
- **OpenAI API** - GPT活用
- **SQLAlchemy** - ORM
- **Uvicorn** - ASGIサーバー

## 🚨 トラブルシューティング

### バックエンドが起動しない場合

1. Pythonがインストールされているか確認
2. `lib/No_look/.env` でAPIキーが設定されているか確認
3. `requirements.txt` の依存関係がインストールされているか確認

### フロントエンドからAPIに接続できない場合

1. バックエンドが http://localhost:8000 で起動しているか確認
2. CORS設定が正しいか確認
3. `.env.local` の設定を確認

### データベース関連のエラー

1. DATABASE_URL の設定を確認
2. データベースファイルの権限を確認
3. SQLiteの場合、ディレクトリが存在するか確認

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。