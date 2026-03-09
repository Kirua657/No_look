import React from "react";

/**
 * 実寸大スマホフレーム（iPhone 12/13/14/15 Pro基準: 390x844px）
 */
const SmartphoneFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  // This component should size itself to its parent (StudentLayout) instead of
  // using viewport units so it composes correctly when wrapped by a layout.
  <div style={{
    width: "100%",
    height: "100%",
    background: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden"
  }}>
    <div style={{
      width: "100%",
      maxWidth: "390px",
      height: "100%",
      maxHeight: "844px",
      border: "none",
      borderRadius: "24px",
      boxShadow: "0 0 32px 8px #0008, 0 8px 32px #0006",
      position: "relative",
      background: "#fff",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      boxSizing: "border-box"
    }}>
      {/* ヘッダー上部エリア（ノッチ下からヘッダーまで） */}
      <div style={{
        width: "100%",
        height: "86px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 1100
      }} />
      {/* 画面エリア */}
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          zIndex: 1200,
          paddingTop: 30,
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          overflow: "auto"
        }}
      >
        {children}
      </div>
    </div>
  </div>
);

export default SmartphoneFrame;
