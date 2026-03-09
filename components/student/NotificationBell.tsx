"use client";

import { useState } from "react";
import { BsBell } from "react-icons/bs";

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  // 仮の通知データ
  const notifications = [
    { id: 1, text: "新しいお知らせがあります" },
    { id: 2, text: "明日の予定を確認してください" },
    { id: 3, text: "アンケートの回答をお願いします" },
  ];

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{ background: "none", border: "none", cursor: "pointer", position: "relative" }}
        aria-label="通知"
      >
        <BsBell size={32} color="#1976d2" />
        <span style={{
          position: "absolute",
          top: 0,
          right: 0,
          background: "#e53935",
          color: "#fff",
          borderRadius: "50%",
          width: 18,
          height: 18,
          fontSize: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>{notifications.length}</span>
      </button>
      {open && (
        <div style={{
          position: "absolute",
          top: 40,
          right: 0,
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          borderRadius: 8,
          minWidth: 220,
          zIndex: 100,
        }}>
          <ul style={{ margin: 0, padding: 12, listStyle: "none" }}>
            {notifications.map((n) => (
              <li key={n.id} style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}>{n.text}</li>
            ))}
            {notifications.length === 0 && <li style={{ padding: "8px 0" }}>通知はありません</li>}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
