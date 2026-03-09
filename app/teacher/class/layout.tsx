// src/app/teacher/layout.tsx
import React from 'react';

// スタイルはインラインで定義し、ファイルを削減します
const layoutStyle: React.CSSProperties = { display: 'flex', minHeight: '100vh' };
const sidebarStyle: React.CSSProperties = { 
  width: '200px', 
  backgroundColor: '#e6e6e6', 
  borderRight: '1px solid #ccc',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexShrink: 0,
};
const buttonStyle: React.CSSProperties = {
  padding: '10px 15px', 
  backgroundColor: '#007bff', 
  color: 'white', 
  borderRadius: '5px',
  fontWeight: 'bold',
  textAlign: 'center',
  cursor: 'pointer',
};

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={layoutStyle}>
      {/* 🍎 左側のサイドバー (〇年〇組) */}
      <aside style={sidebarStyle}>
        <div style={buttonStyle}>〇年〇組</div>
      </aside>

      {/* 🖥️ 右側のメインコンテンツ領域 */}
      <main style={{ flexGrow: 1 }}>
        {children} {/* ← /teacher/class/page.tsx の内容がここに入る */}
      </main>
    </div>
  );
}