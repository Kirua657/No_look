/**
 * 教師ダッシュボードAPI サービス
 */

import { apiClient, API_ENDPOINTS } from './client';

// 型定義
export interface StudentEmotionData {
  student_id: string;
  student_name?: string;
  recent_emotions: Array<{
    emotion: string;
    confidence: number;
    timestamp: string;
    text: string;
  }>;
  emotion_trends: {
    [emotion: string]: number;
  };
  risk_level: 'low' | 'medium' | 'high';
  last_activity: string;
}

export interface ClassOverview {
  class_id: string;
  class_name?: string;
  total_students: number;
  active_students: number;
  emotion_distribution: {
    [emotion: string]: number;
  };
  average_sentiment: number;
  alerts: Array<{
    student_id: string;
    alert_type: string;
    message: string;
    severity: 'info' | 'warning' | 'critical';
    timestamp: string;
  }>;
}

export interface TeacherDashboardData {
  overview: ClassOverview;
  students: StudentEmotionData[];
  timeRange: {
    start: string;
    end: string;
  };
}

export interface AlertSettings {
  emotion_threshold: number;
  risk_keywords: string[];
  notification_enabled: boolean;
  email_notifications: boolean;
}

// 教師ダッシュボードサービス
export const teacherService = {
  /**
   * ダッシュボードデータ取得
   */
  async getDashboardData(
    classId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<TeacherDashboardData> {
    const params = new URLSearchParams();
    if (classId) params.append('class_id', classId);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const endpoint = params.toString() 
      ? `${API_ENDPOINTS.TEACHER_DASHBOARD}?${params.toString()}`
      : API_ENDPOINTS.TEACHER_DASHBOARD;
    
    return apiClient.get<TeacherDashboardData>(endpoint);
  },

  /**
   * 特定の学生の詳細データ取得
   */
  async getStudentDetail(
    studentId: string,
    days: number = 30
  ): Promise<StudentEmotionData> {
    const params = new URLSearchParams();
    params.append('student_id', studentId);
    params.append('days', days.toString());
    
    const endpoint = `${API_ENDPOINTS.TEACHER_DASHBOARD}/student?${params.toString()}`;
    return apiClient.get<StudentEmotionData>(endpoint);
  },

  /**
   * アラート設定の取得
   */
  async getAlertSettings(): Promise<AlertSettings> {
    return apiClient.get<AlertSettings>(`${API_ENDPOINTS.TEACHER_DASHBOARD}/settings`);
  },

  /**
   * アラート設定の更新
   */
  async updateAlertSettings(settings: Partial<AlertSettings>): Promise<AlertSettings> {
    return apiClient.put<AlertSettings>(`${API_ENDPOINTS.TEACHER_DASHBOARD}/settings`, settings);
  },

  /**
   * 学生のリスクレベル更新（手動調整）
   */
  async updateStudentRiskLevel(
    studentId: string,
    riskLevel: 'low' | 'medium' | 'high',
    note?: string
  ): Promise<void> {
    await apiClient.post(`${API_ENDPOINTS.TEACHER_DASHBOARD}/risk-level`, {
      student_id: studentId,
      risk_level: riskLevel,
      note,
    });
  },

  /**
   * メトリクス取得（Prometheus形式）
   */
  async getMetrics(): Promise<string> {
    const client = {
      baseUrl: (typeof window !== 'undefined' 
        ? window.location.protocol + '//' + window.location.hostname + ':8000'
        : 'http://localhost:8000'),
    };
    
    const response = await fetch(`${client.baseUrl}${API_ENDPOINTS.METRICS}`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`Metrics Error: ${response.status} ${response.statusText}`);
    }
    
    return response.text();
  },
};