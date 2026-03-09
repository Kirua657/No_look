'use client';

import React, { useState } from 'react';
import { studentChatService, type StudentChatResponse } from '../lib/api';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  emotion?: string;
  timestamp: Date;
}

export default function StudentChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // メッセージ検証
    const validation = studentChatService.validateMessage(inputMessage);
    if (!validation.isValid) {
      setError(validation.error || 'メッセージが無効です');
      return;
    }

    setError(null);
    setIsLoading(true);

    // ユーザーメッセージを追加
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');

    try {
      // AIに送信
      const response: StudentChatResponse = await studentChatService.sendMessage(currentMessage);
      
      // AI返信を追加
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.reply,
        emotion: response.emotion,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      
      // エラー時のフォールバック応答
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'すみません、現在返信できません。しばらく経ってから再度お試しください。',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          💬 今日の気持ちを聞かせてください
        </h2>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100"
          >
            クリア
          </button>
        )}
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* チャット履歴 */}
      <div className="mb-4 max-h-96 overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>何でもお話しください。</p>
            <p className="text-sm mt-1">今日の出来事、気持ち、困ったことなど...</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                {message.emotion && (
                  <div className="mt-1">
                    <span
                      className="inline-block px-2 py-1 rounded-full text-xs"
                      style={{
                        backgroundColor: studentChatService.getEmotionColor(message.emotion) + '20',
                        color: studentChatService.getEmotionColor(message.emotion),
                      }}
                    >
                      {studentChatService.translateEmotion(message.emotion)}
                    </span>
                  </div>
                )}
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString('ja-JP', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        
        {/* ローディング表示 */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-xs">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 入力フォーム */}
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="今の気持ちや今日の出来事を教えてください..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
          maxLength={500}
        />
        <button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '送信中...' : '送信'}
        </button>
      </form>

      {/* 文字数カウンター */}
      <div className="mt-2 text-right">
        <span className={`text-xs ${inputMessage.length > 450 ? 'text-red-500' : 'text-gray-400'}`}>
          {inputMessage.length}/500
        </span>
      </div>
    </div>
  );
}