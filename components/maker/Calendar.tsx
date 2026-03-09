"use client";
import React from "react";

const Calendar: React.FC = () => {
  return (
    <div style={{
      maxWidth: 320,
      margin: "0 auto",
      fontFamily: "sans-serif",
      padding: 20,
      backgroundColor: "#f0f0f0",
      borderRadius: 8,
      textAlign: "center"
    }}>
      <h3 style={{ margin: 0, color: "#333" }}>カレンダー</h3>
      <p style={{ color: "#666", marginTop: 10 }}>
        カレンダー機能は現在メンテナンス中です
      </p>
    </div>
  );
};

export default Calendar;
