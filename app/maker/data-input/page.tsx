"use client";

import React, { useState, useEffect } from 'react';
import DesktopFrame from '../../../components/frame/DesktopFrame';
import {
  updateAttendanceRate,
  getSchoolData
} from '../../../lib/dataService';

export default function DataInput() {
  const [schoolId, setSchoolId] = useState('1');
  const [attendanceRate, setAttendanceRate] = useState('');
  const [message, setMessage] = useState('');
  const [currentData, setCurrentData] = useState(null);

  useEffect(() => {
    loadCurrentData();
  }, [schoolId]);

  const loadCurrentData = () => {
    const data = getSchoolData(schoolId);
    setCurrentData(data);
  };

  const showMessage = (msg, isError = false) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleAttendanceUpdate = () => {
    const rate = parseFloat(attendanceRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      showMessage('有効な出席率を入力してください（0-100）', true);
      return;
    }
    
    updateAttendanceRate(schoolId, rate);
    setAttendanceRate('');
    loadCurrentData();
    showMessage('出席率を更新しました');
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '8px'
  };

  const buttonStyle = {
    backgroundColor: '#3b82f6',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%'
  };

  const sectionStyle = {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  };

  return (
    <DesktopFrame>
      <div style={{ padding: '20px', backgroundColor: '#f3f4f6', minHeight: '100%' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#1f2937' }}>
            学校データ入力システム
          </h1>

          {message && (
            <div style={{
              padding: '12px',
              backgroundColor: message.includes('エラー') ? '#fef2f2' : '#f0f9ff',
              border: `1px solid ${message.includes('エラー') ? '#fecaca' : '#bae6fd'}`,
              borderRadius: '6px',
              color: message.includes('エラー') ? '#dc2626' : '#0369a1',
              marginBottom: '20px'
            }}>
              {message}
            </div>
          )}

          <div style={sectionStyle}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>学校選択</label>
            <select 
              value={schoolId} 
              onChange={(e) => setSchoolId(e.target.value)}
              style={{ ...inputStyle, marginBottom: '16px' }}
            >
              <option value="1">第一小学校</option>
              <option value="2">中央中学校</option>
              <option value="3">県立高等学校</option>
            </select>
          </div>

          <div style={sectionStyle}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
              出席率更新
            </h3>
            <div style={{ 
              backgroundColor: '#f0f9ff', 
              padding: '12px', 
              borderRadius: '6px', 
              border: '1px solid #bae6fd',
              marginBottom: '16px' 
            }}>
              <p style={{ fontSize: '14px', color: '#0369a1', margin: 0 }}>
                感情データと成績データは自動計算システムで処理されます
              </p>
            </div>
            <input
              type="number"
              placeholder="出席率 (%)"
              value={attendanceRate}
              onChange={(e) => setAttendanceRate(e.target.value)}
              min="0"
              max="100"
              step="0.1"
              style={inputStyle}
            />
            <button onClick={handleAttendanceUpdate} style={buttonStyle}>
              出席率を更新
            </button>
            {currentData?.attendanceRate && (
              <p style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                現在の出席率: {currentData.attendanceRate.toFixed(1)}%
              </p>
            )}
          </div>

          {/* 現在のデータ表示 */}
          {currentData && (
            <div style={{ ...sectionStyle, marginTop: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
                現在保存されているデータ
              </h3>
              <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '6px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>学校ID:</strong> {currentData.schoolId}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>出席率:</strong> {currentData.attendanceRate ? `${currentData.attendanceRate.toFixed(1)}%` : '未設定'}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>最終更新:</strong> {currentData.lastUpdated ? new Date(currentData.lastUpdated).toLocaleString('ja-JP') : '未更新'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DesktopFrame>
  );
}