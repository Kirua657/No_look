"use client";

import React, { useState, useEffect } from 'react';
import EducationBoardFrame from '../../../components/frame/EducationBoardFrame';

interface NotificationData {
  id: number
  schoolId: string
  target: string
  title: string
  content: string
  styling: {
    fontSize: number
    fontColor: string
    isBold: boolean
    isItalic: boolean
  }
  timestamp: string
  status: 'sent' | 'cancelled'
  sentTo?: string[]
}

interface School {
  id: string
  name: string
}

export default function NotificationHistoryPage() {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [selectedSchool, setSelectedSchool] = useState<string>('')
  const [selectedNotification, setSelectedNotification] = useState<NotificationData | null>(null)
  const [showNotificationDetail, setShowNotificationDetail] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'sent' | 'cancelled'>('all')

  const schools: School[] = [
    { id: '1', name: '第一小学校' },
    { id: '2', name: '中央中学校' },
    { id: '3', name: '県立高等学校' },
  ]

  useEffect(() => {
    loadNotifications()
    // テストデータを追加（初回のみ）
    addTestDataIfNeeded()
  }, [])

  const addTestDataIfNeeded = () => {
    const existingNotifications = JSON.parse(localStorage.getItem('sent_notifications') || '[]')
    
    // テストデータが存在しない場合のみ追加
    if (existingNotifications.length === 0) {
      const testNotification = {
        id: Date.now(),
        schoolId: '1',
        target: 'students',
        title: '重要なお知らせ：明日の授業について',
        content: '明日（11月19日）は天候不良のため、1時間目の体育の授業は体育館で実施いたします。\n\n体育館シューズを忘れずにお持ちください。\n\nまた、昼休みの外での活動は中止となりますので、教室でお過ごしください。\n\nご理解とご協力をよろしくお願いいたします。',
        styling: {
          fontSize: 16,
          fontColor: '#1f2937',
          isBold: false,
          isItalic: false
        },
        timestamp: new Date().toISOString(),
        status: 'sent' as const
      }
      
      localStorage.setItem('sent_notifications', JSON.stringify([testNotification]))
    }
  }

  const loadNotifications = () => {
    const allNotifications = JSON.parse(localStorage.getItem('sent_notifications') || '[]')
    setNotifications(allNotifications)
  }

  const getFilteredNotifications = () => {
    let filtered = notifications

    if (selectedSchool) {
      filtered = filtered.filter(n => n.schoolId === selectedSchool)
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(n => n.status === filterStatus)
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  const deleteNotification = (notificationId: number) => {
    if (!confirm('この通知を削除しますか？\n受信者には「送信取り消し」通知が送られます。')) {
      return
    }

    const allNotifications = JSON.parse(localStorage.getItem('sent_notifications') || '[]')
    const updatedNotifications = allNotifications.map((n: NotificationData) => {
      if (n.id === notificationId) {
        return { ...n, status: 'cancelled' }
      }
      return n
    })
    
    localStorage.setItem('sent_notifications', JSON.stringify(updatedNotifications))
    
    // 送信取り消し通知を作成
    const notification = allNotifications.find((n: NotificationData) => n.id === notificationId)
    if (notification) {
      const cancelNotification = {
        id: Date.now(),
        schoolId: notification.schoolId,
        target: 'all',
        title: '通知送信取り消し',
        content: `「${notification.title}」の通知は管理者により取り消されました。`,
        styling: {
          fontSize: 16,
          fontColor: '#ef4444',
          isBold: true,
          isItalic: false
        },
        timestamp: new Date().toISOString(),
        status: 'sent' as const
      }
      
      const cancelNotifications = JSON.parse(localStorage.getItem('cancel_notifications') || '[]')
      cancelNotifications.unshift(cancelNotification)
      localStorage.setItem('cancel_notifications', JSON.stringify(cancelNotifications.slice(0, 50)))
    }
    
    // データを再読み込み
    loadNotifications()
  }

  const getTargetLabel = (target: string) => {
    switch (target) {
      case 'students': return '生徒'
      case 'teachers': return '教師'
      case 'all': return '全員'
      default: return target
    }
  }

  const getSchoolName = (schoolId: string) => {
    const school = schools.find(s => s.id === schoolId)
    return school ? school.name : '不明な学校'
  }

  const filteredNotifications = getFilteredNotifications()

  const containerStyle = {
    padding: '20px',
    backgroundColor: '#f3f4f6',
    minHeight: '100%'
  }

  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '20px',
    padding: '20px'
  }

  const filterSectionStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '20px'
  }

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px'
  }

  const buttonStyle = (variant: 'primary' | 'danger' | 'secondary' = 'primary') => ({
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    backgroundColor: variant === 'primary' ? '#3b82f6' : variant === 'danger' ? '#ef4444' : '#6b7280',
    color: '#fff'
  })

  return (
    <EducationBoardFrame>
      <div style={containerStyle}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', color: '#1f2937' }}>
            通知履歴管理
          </h1>

          {/* フィルター */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
              フィルター
            </h3>
            <div style={filterSectionStyle}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  学校選択
                </label>
                <select
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">すべての学校</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  ステータス
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'sent' | 'cancelled')}
                  style={inputStyle}
                >
                  <option value="all">すべて</option>
                  <option value="sent">送信済み</option>
                  <option value="cancelled">送信取り消し済み</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'end' }}>
                <button
                  onClick={() => {
                    setSelectedSchool('')
                    setFilterStatus('all')
                  }}
                  style={buttonStyle('secondary')}
                >
                  フィルターをクリア
                </button>
              </div>
            </div>
          </div>

          {/* 統計情報 */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
              統計情報
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
              <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0369a1' }}>
                  {notifications.length}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>総通知数</div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
                  {notifications.filter(n => n.status === 'sent').length}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>送信済み</div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
                  {notifications.filter(n => n.status === 'cancelled').length}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>取り消し済み</div>
              </div>
            </div>
          </div>

          {/* 通知一覧 */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
              通知一覧 ({filteredNotifications.length}件)
            </h3>
            
            {filteredNotifications.length > 0 ? (
              <div style={{ display: 'grid', gap: '12px' }}>
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '16px',
                      backgroundColor: notification.status === 'cancelled' ? '#fef2f2' : '#fff',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <h4 style={{ 
                            margin: 0, 
                            fontSize: '16px', 
                            fontWeight: '600', 
                            color: notification.status === 'cancelled' ? '#dc2626' : '#1f2937' 
                          }}>
                            {notification.title}
                          </h4>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: notification.status === 'cancelled' ? '#fee2e2' : '#dcfce7',
                            color: notification.status === 'cancelled' ? '#dc2626' : '#059669'
                          }}>
                            {notification.status === 'cancelled' ? '送信取り消し済み' : '送信済み'}
                          </span>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px', marginBottom: '8px', fontSize: '14px' }}>
                          <div>
                            <span style={{ color: '#6b7280' }}>学校: </span>
                            <span style={{ color: '#374151', fontWeight: '500' }}>{getSchoolName(notification.schoolId)}</span>
                          </div>
                          <div>
                            <span style={{ color: '#6b7280' }}>対象: </span>
                            <span style={{ color: '#374151', fontWeight: '500' }}>{getTargetLabel(notification.target)}</span>
                          </div>
                          <div>
                            <span style={{ color: '#6b7280' }}>送信日時: </span>
                            <span style={{ color: '#374151', fontWeight: '500' }}>{new Date(notification.timestamp).toLocaleString('ja-JP')}</span>
                          </div>
                        </div>
                        
                        <p style={{
                          margin: 0,
                          fontSize: '14px',
                          color: '#6b7280',
                          lineHeight: '1.5',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {notification.content}
                        </p>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                        <button
                          onClick={() => {
                            setSelectedNotification(notification)
                            setShowNotificationDetail(true)
                          }}
                          style={buttonStyle('primary')}
                        >
                          詳細
                        </button>
                        {notification.status !== 'cancelled' && (
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            style={buttonStyle('danger')}
                          >
                            削除
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
                {selectedSchool || filterStatus !== 'all' 
                  ? 'フィルター条件に一致する通知が見つかりません' 
                  : 'まだ送信された通知はありません'
                }
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 通知詳細モーダル */}
      {showNotificationDetail && selectedNotification && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80%',
            overflow: 'auto',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>通知詳細</h3>
              <button
                onClick={() => setShowNotificationDetail(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{
                margin: '0 0 12px 0',
                fontSize: '18px',
                fontWeight: '600',
                color: selectedNotification.status === 'cancelled' ? '#dc2626' : '#1f2937'
              }}>
                {selectedNotification.title}
              </h4>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '12px', 
                marginBottom: '16px',
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <div>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>学校: </span>
                  <span style={{ color: '#1f2937', fontWeight: '600' }}>{getSchoolName(selectedNotification.schoolId)}</span>
                </div>
                <div>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>対象者: </span>
                  <span style={{ color: '#1f2937', fontWeight: '600' }}>{getTargetLabel(selectedNotification.target)}</span>
                </div>
                <div>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>送信日時: </span>
                  <span style={{ color: '#1f2937', fontWeight: '600' }}>{new Date(selectedNotification.timestamp).toLocaleString('ja-JP')}</span>
                </div>
                <div>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>ステータス: </span>
                  <span style={{ 
                    color: selectedNotification.status === 'cancelled' ? '#dc2626' : '#059669',
                    fontWeight: '600'
                  }}>
                    {selectedNotification.status === 'cancelled' ? '送信取り消し済み' : '送信済み'}
                  </span>
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <h5 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>内容:</h5>
              <div style={{
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: `${selectedNotification.styling.fontSize}px`,
                color: selectedNotification.styling.fontColor,
                fontWeight: selectedNotification.styling.isBold ? 'bold' : 'normal',
                fontStyle: selectedNotification.styling.isItalic ? 'italic' : 'normal',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                minHeight: '100px'
              }}>
                {selectedNotification.content}
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowNotificationDetail(false)}
                style={buttonStyle('secondary')}
              >
                閉じる
              </button>
              {selectedNotification.status !== 'cancelled' && (
                <button
                  onClick={() => {
                    deleteNotification(selectedNotification.id)
                    setShowNotificationDetail(false)
                  }}
                  style={buttonStyle('danger')}
                >
                  削除
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </EducationBoardFrame>
  )
}