// src/app/teacher/class/page.tsx
'use client'; // 状態管理のためクライアントコンポーネント化

import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { classData, StudentComment } from './data';

// --- スタイルの定義 (componentsを使用しないため、ここで全て定義) ---

const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' };
const thStyle: React.CSSProperties = { backgroundColor: '#f7f7f7', borderBottom: '2px solid #ccc', padding: '12px 10px', textAlign: 'left', fontWeight: 'bold' };
const tdStyle: React.CSSProperties = { borderBottom: '1px solid #eee', padding: '10px', verticalAlign: 'middle' };
const buttonContainerStyle: React.CSSProperties = { display: 'flex', gap: '8px', justifyContent: 'flex-end' };
const buttonBaseStyle: React.CSSProperties = { width: '35px', height: '25px', borderRadius: '5px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' };

const overlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalBaseStyle: React.CSSProperties = { background: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '600px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)', position: 'relative', border: '4px solid' };
const closeButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: '16px',
  right: '16px',
  background: '#EF4444',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 'bold',
  fontSize: '16px',
  padding: '6px 18px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  cursor: 'pointer',
  zIndex: 1001
};
const gridContainerStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' };
const gridItemStyle: React.CSSProperties = { background: '#f5f5f5', padding: '15px', borderRadius: '5px' };
const textareaStyle: React.CSSProperties = { width: '100%', height: '150px', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', resize: 'none' };

// --- コンポーネントの定義 (Pageファイル内に関数として定義) ---

const DetailModal: React.FC<{ isOpen: boolean, onClose: () => void, data: StudentComment }> = 
  ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;
  return (
    <div style={overlayStyle}>
      <div style={{ ...modalBaseStyle, borderColor: '#4CAF50' }}> {/* 緑枠 */}
        <button style={closeButtonStyle} onClick={onClose}><FiX size={20} />閉じる</button>
        <div style={{ paddingTop: '10px' }}>
          <h3>ID: {data.id}</h3>
          <h3>抽出単語: {data.word}</h3>
          <div style={{ ...gridItemStyle, marginTop: '15px' }}>
            <h4>詳細情報</h4>
            <textarea readOnly style={{ ...textareaStyle, height: '200px' }} value={data.detail} />
          </div>
        </div>
      </div>
    </div>
  );
};

const AiControlModal: React.FC<{ isOpen: boolean, onClose: () => void, data: StudentComment }> = 
  ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;
  const emotionStats = Object.entries(data.emotion)
    .sort(([, a], [, b]) => b - a)
    .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${Math.round(value * 100)}%`)
    .join('\n');

  return (
    <div style={overlayStyle}>
      <div style={{ ...modalBaseStyle, borderColor: '#FFC107' }}> {/* 黄色枠 */}
        <button style={closeButtonStyle} onClick={onClose}><FiX size={20} />閉じる</button>
        <div style={{ paddingTop: '10px' }}>
          <h3 style={{ borderBottom: '1px solid #ccc' }}>ID: {data.id}</h3>
          <div style={gridContainerStyle}>
            <div style={gridItemStyle}>
              <h4>AIに指示</h4>
              <textarea placeholder="AIへの指示を入力..." style={textareaStyle}></textarea>
              <button style={{ padding: '8px', marginTop: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>指示を送信</button>
            </div>
            <div style={gridItemStyle}>
              <h4>感情統計</h4>
              <textarea readOnly style={textareaStyle} value={emotionStats} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusButtons: React.FC<{ item: StudentComment; onGreenClick: (item: StudentComment) => void; onYellowClick: (item: StudentComment) => void; }> = 
  ({ item, onGreenClick, onYellowClick }) => (
  <div style={buttonContainerStyle}>
    <div 
      style={{ ...buttonBaseStyle, backgroundColor: '#4CAF50' }} // 緑
      onClick={() => onGreenClick(item)} 
    ></div>
    <div 
      style={{ ...buttonBaseStyle, backgroundColor: '#FFC107' }} // 黄色
      onClick={() => onYellowClick(item)}
    ></div>
  </div>
);

// --- メインの Page コンポーネント ---
export default function ClassPage() {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StudentComment | null>(null);

  const handleGreenClick = (item: StudentComment) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
    setIsAiOpen(false);
  };

  const handleYellowClick = (item: StudentComment) => {
    setSelectedItem(item);
    setIsAiOpen(true);
    setIsDetailOpen(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>クラスコメント管理</h1>
      
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: '100px' }}>ID</th>
            <th style={thStyle}>頻出単語</th>
            <th style={{ ...thStyle, width: '120px' }}></th> 
          </tr>
        </thead>
        <tbody>
          {classData.map((item, index) => (
            <tr key={index}>
              <td style={tdStyle}>{item.id}</td>
              <td style={tdStyle}>{item.word}</td>
              <td style={tdStyle}>
                <StatusButtons 
                  item={item} 
                  onGreenClick={handleGreenClick} 
                  onYellowClick={handleYellowClick} 
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* モーダルのレンダリング */}
      {selectedItem && (
        <>
          <DetailModal
            isOpen={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
            data={selectedItem}
          />
          <AiControlModal
            isOpen={isAiOpen}
            onClose={() => setIsAiOpen(false)}
            data={selectedItem}
          />
        </>
      )}
    </div>
  );
}