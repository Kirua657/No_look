/**
 * バックエンドAPI（No_look）との連携クライアント
 * APIキーや設定は環境変数から取得
 */

// 環境変数の型定義
interface ApiConfig {
  baseUrl: string;
  apiKey?: string;
}

// APIクライアント設定
const getApiConfig = (): ApiConfig => {
  return {
    baseUrl: (typeof window !== 'undefined' 
      ? window.location.protocol + '//' + window.location.hostname + ':8000'
      : 'http://localhost:8000'),
    apiKey: undefined, // APIキーは後から環境変数で設定予定
  };
};

// 共通のHTTPクライアント
const createApiClient = () => {
  const config = getApiConfig();
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // APIキーがある場合は認証ヘッダーを追加
  if (config.apiKey) {
    defaultHeaders['Authorization'] = `Bearer ${config.apiKey}`;
  }
  
  return {
    baseUrl: config.baseUrl,
    headers: defaultHeaders,
  };
};

// APIエンドポイント定義
export const API_ENDPOINTS = {
  // 感情ログ関連
  ASK: '/ask',
  ASK_RESPONSES: '/ask/responses',
  ANALYZE: '/analyze',
  
  // サマリー関連
  SUMMARY: '/summary',
  SUMMARY_VIEW: '/summary/view',
  
  // 週報関連
  WEEKLY_REPORT: '/weekly-report',
  WEEKLY_VIEW: '/weekly/view',
  WEEKLY_ASCII: '/weekly/ascii',
  
  // エクスポート関連
  EXPORT: '/export',
  
  // 教師ダッシュボード関連
  TEACHER_DASHBOARD: '/teacher-dashboard',
  
  // メトリクス関連
  METRICS: '/metrics',
  
  // 学生チャット関連（新規追加）
  STUDENT_CHAT: '/student/chat',
  STUDENT_CHAT_STATUS: '/student/chat/status',
} as const;

// 基本的なHTTPクライアント関数
export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const client = createApiClient();
    const response = await fetch(`${client.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: client.headers,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  },
  
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const client = createApiClient();
    const response = await fetch(`${client.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: client.headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  },
  
  async put<T>(endpoint: string, data?: any): Promise<T> {
    const client = createApiClient();
    const response = await fetch(`${client.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: client.headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  },
  
  async delete<T>(endpoint: string): Promise<T> {
    const client = createApiClient();
    const response = await fetch(`${client.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: client.headers,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  },
};