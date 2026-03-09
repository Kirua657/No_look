/**
 * 学生チャット機能API サービス
 * student/homeのテキストボックス用
 */

import { apiClient, API_ENDPOINTS } from './client';

// 型定義
export interface StudentChatRequest {
  message: string;
  class_id?: string;
}

export interface StudentChatResponse {
  reply: string;
  emotion: string;
  emotion_labels: Record<string, number>;
  ai_used: boolean;
  timestamp: string;
}

export interface ChatStatus {
  ai_available: boolean;
  model: string | null;
  status: 'ready' | 'fallback_mode';
}

// 学生チャットサービス
export const studentChatService = {
  /**
   * メッセージを送信してAIからの返信を取得
   */
  async sendMessage(message: string, classId?: string): Promise<StudentChatResponse> {
    const request: StudentChatRequest = {
      message: message.trim(),
      class_id: classId,
    };

    if (!request.message) {
      throw new Error('メッセージが空です');
    }

    return apiClient.post<StudentChatResponse>(API_ENDPOINTS.STUDENT_CHAT, request);
  },

  /**
   * チャット機能の状態を確認
   */
  async getStatus(): Promise<ChatStatus> {
    return apiClient.get<ChatStatus>(API_ENDPOINTS.STUDENT_CHAT_STATUS);
  },

  /**
   * メッセージの形式チェック
   */
  validateMessage(message: string): { isValid: boolean; error?: string } {
    if (!message || message.trim().length === 0) {
      return { isValid: false, error: 'メッセージを入力してください' };
    }

    if (message.trim().length > 500) {
      return { isValid: false, error: 'メッセージは500文字以内で入力してください' };
    }

    return { isValid: true };
  },

  /**
   * 感情ラベルを日本語に変換
   */
  translateEmotion(emotion: string): string {
    const emotionMap: Record<string, string> = {
      '楽しい': '😊 楽しい',
      '悲しい': '😢 悲しい', 
      '怒り': '😠 怒り',
      '不安': '😰 不安',
      'しんどい': '😵 しんどい',
      '中立': '😐 普通',
    };

    return emotionMap[emotion] || emotion;
  },

  /**
   * 感情スコアに基づいて色を取得
   */
  getEmotionColor(emotion: string): string {
    const colorMap: Record<string, string> = {
      '楽しい': '#10B981', // green
      '悲しい': '#3B82F6', // blue
      '怒り': '#EF4444', // red
      '不安': '#F59E0B', // orange
      'しんどい': '#8B5CF6', // purple
      '中立': '#6B7280', // gray
    };

    return colorMap[emotion] || '#6B7280';
  },
};