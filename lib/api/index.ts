/**
 * API サービスのエントリーポイント
 * バックエンド（No_look）との連携を統合
 */

// APIクライアント
export { apiClient, API_ENDPOINTS } from './client';

// 感情ログ解析サービス
export { 
  emotionService,
  type EmotionLogRequest,
  type EmotionAnalysisResult,
  type AskRequest,
  type AskResponse,
  type SummaryRequest,
  type SummaryResponse,
  type WeeklyReportResponse,
  type AiResponseData,
  type AiResponsesData,
} from './emotionService';

// 教師ダッシュボードサービス
export {
  teacherService,
  type StudentEmotionData,
  type ClassOverview,
  type TeacherDashboardData,
  type AlertSettings,
} from './teacherService';

// 学生チャットサービス
export {
  studentChatService,
  type StudentChatRequest,
  type StudentChatResponse,
  type ChatStatus,
} from './studentChatService';

// APIクライアント設定情報
export const API_CONFIG = {
  // デフォルトのバックエンドURL
  DEFAULT_BASE_URL: 'http://localhost:8000',
  
  // APIエンドポイントの説明
  ENDPOINTS_INFO: {
    '/ask': '質問応答システム - LLMによる感情解析関連の質問回答',
    '/analyze': '感情解析 - テキストから感情を分類・分析',
    '/summary': 'サマリー - 期間指定での感情ログ集計',
    '/summary/view': 'サマリービュー - UI向けのサマリー表示データ',
    '/weekly-report': '週報 - 週次の感情レポート生成',
    '/weekly/view': '週報ビュー - UI向けの週報表示データ',
    '/weekly/ascii': '週報ASCII - ASCII形式の週報データ',
    '/export': 'エクスポート - データの一括出力',
    '/teacher-dashboard': '教師ダッシュボード - 教師向けの学生状況監視',
    '/metrics': 'メトリクス - Prometheus形式のシステム監視データ',
    '/student/chat': '学生チャット - 学生ホーム画面でのAIチャット機能',
    '/student/chat/status': 'チャット状態 - AI機能の利用可能性確認',
  },
  
  // 環境変数の説明（後から設定する箇所）
  ENV_VARS_INFO: {
    'NEXT_PUBLIC_API_BASE_URL': 'バックエンドAPIのベースURL（省略時: http://localhost:8000）',
    'NEXT_PUBLIC_API_KEY': 'API認証キー（バックエンド側でAPI_KEYが設定されている場合）',
    'OPENAI_API_KEY': 'OpenAI APIキー（バックエンド側の.envで設定）',
    'DATABASE_URL': 'データベース接続URL（バックエンド側の.envで設定）',
  },
} as const;