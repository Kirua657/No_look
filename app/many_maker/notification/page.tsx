"use client";

import React, { useState } from 'react';
import NotificationWeeklyStatsModal from './NotificationWeeklyStatsModal';
import type { WeeklyStatsData } from '../../../types/toukei';
import EducationBoardFrame from '../../../components/frame/EducationBoardFrame';

export default function NotificationSender() {
  // 週間統計データ生成（maker/dateと同じロジック）
  const [showWeeklyStats, setShowWeeklyStats] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [weeklyStatsData, setWeeklyStatsData] = useState<WeeklyStatsData | null>(null);

  const generateWeeklyData = (emotion: string): WeeklyStatsData => {
    const weekDays = ["月曜", "火曜", "水曜", "木曜", "金曜", "土曜", "日曜"];
    const baseValues: { [key: string]: number[] } = {
      "楽しい": [12, 15, 18, 22, 28, 25, 20],
      "悲しい": [8, 6, 5, 4, 3, 7, 9],
      "怒り": [3, 2, 4, 6, 8, 5, 2],
      "不安": [10, 8, 12, 15, 18, 14, 8],
      "しんどい": [15, 18, 22, 25, 30, 20, 15],
      "中立": [20, 25, 28, 30, 32, 28, 22]
    };
    const values = baseValues[emotion] || [10, 12, 8, 15, 18, 14, 11];
    const totalCount = values.reduce((sum, val) => sum + val, 0);
    const average = totalCount / values.length;
    const firstHalf = values.slice(0, 3).reduce((sum, val) => sum + val, 0) / 3;
    const secondHalf = values.slice(-3).reduce((sum, val) => sum + val, 0) / 3;
    const trendValue = secondHalf - firstHalf;
    let trend: "上昇" | "下降" | "安定";
    if (trendValue > 2) trend = "上昇";
    else if (trendValue < -2) trend = "下降";
    else trend = "安定";
    return { weekDays, values, totalCount, average, trend };
  };

  const handlePieSegmentClick = (label: string) => {
    const weeklyData = generateWeeklyData(label);
    setSelectedEmotion(label);
    setWeeklyStatsData(weeklyData);
    setShowWeeklyStats(true);
  };

  const closeWeeklyStats = () => {
    setShowWeeklyStats(false);
    setSelectedEmotion("");
    setWeeklyStatsData(null);
  };
  const [selectedSchool, setSelectedSchool] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationContent, setNotificationContent] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [fontColor, setFontColor] = useState('#000000');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [message, setMessage] = useState('');

  const schools = [
    { id: '1', name: '第一小学校' },
    { id: '2', name: '第二小学校' },
    { id: '3', name: '第三小学校' },
  ];

  const audiences = [
    { value: 'students', label: '生徒' },
    { value: 'teachers', label: '教師' },
    { value: 'all', label: '全員' },
  ];

  const showMessage = (msg, isError = false) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSend = () => {
    if (!selectedSchool || !targetAudience || !notificationTitle.trim() || !notificationContent.trim()) {
      showMessage('すべての項目を入力してください', true);
      return;
    }
    // 新仕様ラベルで判定
    const emotionLabels = ["楽しい", "悲しい", "怒り", "不安", "しんどい", "中立"];
    const emotion = emotionLabels.find(e => notificationTitle.includes(e));

    // 通知送信処理（実際の実装では API を呼び出す）
    const notification = {
      id: Date.now(),
      schoolId: selectedSchool,
      target: targetAudience,
      title: notificationTitle,
      content: notificationContent,
      styling: {
        fontSize,
        fontColor,
        isBold,
        isItalic,
      },
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    // ローカルストレージに保存（実際の実装では API に送信）
    const existingNotifications = JSON.parse(localStorage.getItem('sent_notifications') || '[]');
    existingNotifications.unshift(notification);
    localStorage.setItem('sent_notifications', JSON.stringify(existingNotifications.slice(0, 50)));

    showMessage('通知を送信しました');
    
    // フォームをリセット
    setSelectedSchool('');
    setTargetAudience('');
    setNotificationTitle('');
    setNotificationContent('');
    setFontSize(16);
    setFontColor('#000000');
    setIsBold(false);
    setIsItalic(false);
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '16px'
  };

  const buttonStyle = {
    backgroundColor: '#3b82f6',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%'
  };

  const sectionStyle = {
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '24px'
  };

  const toolbarButtonStyle = (isActive = false) => ({
    padding: '8px 12px',
    margin: '0 4px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    backgroundColor: isActive ? '#3b82f6' : '#fff',
    color: isActive ? '#fff' : '#374151',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  });

  return (
    <EducationBoardFrame>
      <div style={{ padding: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', color: '#2563eb' }}>
          通知送信システム
        </h1>
        {message && (
          <div style={{
            padding: '12px',
            backgroundColor: message.includes('エラー') ? '#fef2f2' : '#f0f9ff',
            border: `1px solid ${message.includes('エラー') ? '#fecaca' : '#bae6fd'}`,
            borderRadius: '6px',
            color: message.includes('エラー') ? '#dc2626' : '#0369a1',
            marginBottom: '24px'
          }}>
            {message}
          </div>
        )}
        {/* 送信設定 */}
        <div style={sectionStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                送信先学校
              </label>
              <select 
                value={selectedSchool} 
                onChange={(e) => setSelectedSchool(e.target.value)}
                style={inputStyle}
              >
                <option value="">学校を選択してください</option>
                {schools.map(school => (
                  <option key={school.id} value={school.id}>{school.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                対象者
              </label>
              <select 
                value={targetAudience} 
                onChange={(e) => setTargetAudience(e.target.value)}
                style={inputStyle}
              >
                <option value="">対象者を選択してください</option>
                {audiences.map(audience => (
                  <option key={audience.value} value={audience.value}>{audience.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              通知タイトル
            </label>
            <input
              type="text"
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
              placeholder="通知のタイトルを入力してください"
              style={inputStyle}
            />
          </div>
          {/* テキストエディター */}
          <div style={sectionStyle}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
              通知内容
            </h3>
            {/* ツールバー */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '12px', 
              backgroundColor: '#f9fafb', 
              borderRadius: '6px 6px 0 0',
              border: '1px solid #d1d5db',
              borderBottom: 'none'
            }}>
              <button
                onClick={() => setIsBold(!isBold)}
                style={toolbarButtonStyle(isBold)}
              >
                <strong>B</strong>
              </button>
              <button
                onClick={() => setIsItalic(!isItalic)}
                style={toolbarButtonStyle(isItalic)}
              >
                <em>I</em>
              </button>
              <div style={{ marginLeft: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500' }}>文字サイズ:</label>
                <select 
                  value={fontSize} 
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  style={{ padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                >
                  <option value={12}>12px</option>
                  <option value={14}>14px</option>
                  <option value={16}>16px</option>
                  <option value={18}>18px</option>
                  <option value={20}>20px</option>
                  <option value={24}>24px</option>
                  <option value={28}>28px</option>
                  <option value={32}>32px</option>
                </select>
              </div>
              <div style={{ marginLeft: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500' }}>文字色:</label>
                {/* プリセットカラーボタン */}
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[
                    '#000000', // 黒
                    '#FF0000', // 赤
                    '#1976D2', // 青
                    '#388E3C', // 緑
                    '#FBC02D', // 黄
                    '#FF9800', // オレンジ
                    '#9C27B0', // 紫
                    '#E91E63', // ピンク
                    '#795548'  // 茶
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFontColor(color)}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        border: fontColor === color ? '2px solid #3b82f6' : '1px solid #d1d5db',
                        backgroundColor: color,
                        margin: 0,
                        cursor: 'pointer',
                        outline: 'none',
                        boxShadow: fontColor === color ? '0 0 0 2px #bae6fd' : 'none',
                      }}
                      aria-label={`色 ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            {/* テキストエリア */}
            <textarea
              value={notificationContent}
              onChange={(e) => setNotificationContent(e.target.value)}
              placeholder="通知の内容を入力してください..."
              style={{
                width: '100%',
                height: '200px',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '0 0 6px 6px',
                borderTop: 'none',
                fontSize: `${fontSize}px`,
                color: fontColor,
                fontWeight: isBold ? 'bold' : 'normal',
                fontStyle: isItalic ? 'italic' : 'normal',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>
          {/* プレビュー + 円グラフクリックで週間統計 */}
          <div style={sectionStyle}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
              プレビュー
            </h3>
            <div style={{ 
              backgroundColor: '#f9fafb', 
              padding: '16px', 
              borderRadius: '6px', 
              border: '1px solid #e5e7eb',
              minHeight: '100px'
            }}>
              {notificationTitle && (
                <h4 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: '#1f2937' 
                }}>
                  {notificationTitle}
                </h4>
              )}
              <div style={{
                fontSize: `${fontSize}px`,
                color: fontColor,
                fontWeight: isBold ? 'bold' : 'normal',
                fontStyle: isItalic ? 'italic' : 'normal',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                cursor: 'pointer',
              }}
                onClick={() => {
                  // 新仕様ラベルで判定
                  const emotionLabels = ["楽しい","悲しい","怒り","不安","しんどい","中立"];
                  const emotion = emotionLabels.find(e => notificationTitle.includes(e));
                  if (emotion) handlePieSegmentClick(emotion);
                }}
                title="クリックで週間統計を表示"
              >
                {notificationContent || 'ここにプレビューが表示されます...'}
              </div>
            </div>
          </div>
          {/* 週間統計モーダル */}
          <NotificationWeeklyStatsModal 
            show={showWeeklyStats && !!weeklyStatsData}
            emotionLabel={selectedEmotion}
            data={weeklyStatsData as WeeklyStatsData}
            onClose={closeWeeklyStats}
          />
          {/* 送信ボタン */}
          <div style={{ textAlign: 'center' }}>
            <button onClick={handleSend} style={buttonStyle}>
              通知を送信
            </button>
          </div>
        </div>
      </div>
    </EducationBoardFrame>
  );
}
              
