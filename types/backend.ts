/**
 * No_look バックエンドとの連携用型定義
 */

// ベース型定義
export interface BaseResponse {
  status: 'success' | 'error';
  message?: string;
  timestamp: string;
}

// 感情解析関連
export interface EmotionData {
  emotion: string;
  confidence: number;
  manual_override?: boolean;
  llm_result?: {
    emotion: string;
    confidence: number;
    reasoning?: string;
  };
}

export interface EmotionLogEntry {
  id: string;
  user_id: string;
  text: string;
  emotion_data: EmotionData;
  timestamp: string;
  created_at: string;
  updated_at?: string;
}

// 統計・サマリー関連
export interface EmotionStats {
  emotion_counts: Record<string, number>;
  total_entries: number;
  period: {
    start: string;
    end: string;
  };
  sentiment_score: number;
  trend_analysis?: {
    direction: 'positive' | 'negative' | 'stable';
    strength: number;
  };
}

// 週報データ
export interface WeeklyReportData {
  week_number: number;
  year: number;
  week_start: string;
  week_end: string;
  emotion_summary: Record<string, number>;
  daily_breakdown: Array<{
    date: string;
    emotions: Record<string, number>;
    total_entries: number;
  }>;
  insights: string[];
  recommendations: string[];
  overall_sentiment: number;
}

// 教師ダッシュボード関連
export interface StudentProfile {
  student_id: string;
  student_name?: string;
  class_id?: string;
  enrollment_date?: string;
  last_activity: string;
  total_entries: number;
}

export interface StudentEmotionSummary extends StudentProfile {
  recent_emotions: EmotionLogEntry[];
  emotion_trends: Record<string, number>;
  risk_indicators: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    last_assessment: string;
  };
  weekly_activity: Array<{
    week: string;
    entry_count: number;
    dominant_emotion: string;
  }>;
}

export interface ClassMetrics {
  class_id: string;
  class_name?: string;
  student_count: number;
  active_students: number;
  total_entries: number;
  period_start: string;
  period_end: string;
  emotion_distribution: Record<string, number>;
  average_sentiment: number;
  engagement_score: number;
}

export interface AlertRule {
  id: string;
  type: 'emotion_threshold' | 'keyword_match' | 'inactivity' | 'custom';
  condition: {
    emotion?: string;
    threshold?: number;
    keywords?: string[];
    days_inactive?: number;
    custom_logic?: string;
  };
  severity: 'info' | 'warning' | 'critical';
  enabled: boolean;
  created_at: string;
}

export interface Alert {
  id: string;
  alert_rule_id: string;
  student_id: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  status: 'active' | 'resolved' | 'dismissed';
  triggered_at: string;
  resolved_at?: string;
  metadata?: Record<string, any>;
}

// API リクエスト/レスポンス型
export interface AnalyzeTextRequest {
  text: string;
  user_id?: string;
  timestamp?: string;
  context?: string;
}

export interface AnalyzeTextResponse extends BaseResponse {
  data: EmotionData;
  entry_id: string;
}

export interface AskQuestionRequest {
  question: string;
  context?: string;
  user_id?: string;
  max_tokens?: number;
}

export interface AskQuestionResponse extends BaseResponse {
  answer: string;
  confidence: number;
  sources?: string[];
  tokens_used?: number;
}

export interface GetSummaryRequest {
  user_id?: string;
  start_date?: string;
  end_date?: string;
  emotion_filter?: string[];
  include_trends?: boolean;
}

export interface GetSummaryResponse extends BaseResponse {
  data: {
    stats: EmotionStats;
    entries: EmotionLogEntry[];
    insights?: string[];
  };
}

export interface GetWeeklyReportRequest {
  week_offset?: number;
  user_id?: string;
  include_analysis?: boolean;
}

export interface GetWeeklyReportResponse extends BaseResponse {
  data: WeeklyReportData;
}

export interface TeacherDashboardRequest {
  class_id?: string;
  start_date?: string;
  end_date?: string;
  include_alerts?: boolean;
}

export interface TeacherDashboardResponse extends BaseResponse {
  data: {
    class_metrics: ClassMetrics;
    students: StudentEmotionSummary[];
    alerts: Alert[];
    summary_insights: string[];
  };
}

// エラー型
export interface ApiError {
  status: 'error';
  error_code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

// 設定関連
export interface BackendConfig {
  llm_model: string;
  manual_only: boolean;
  llm_weight: number;
  rate_limit_per_min: number;
  debug_mode: boolean;
  api_key_required: boolean;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  components: {
    database: 'up' | 'down';
    llm_service: 'up' | 'down';
    cache: 'up' | 'down';
  };
  response_time_ms: number;
  uptime_seconds: number;
  version: string;
}