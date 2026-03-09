// app/student/layout.tsx
"use client";

import React, { useEffect } from "react";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 画面全体をスマホ枠で覆う
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const backup = {
      htmlMargin: html.style.margin,
      htmlPadding: html.style.padding,
      htmlWidth: html.style.width,
      htmlHeight: html.style.height,
      htmlOverflow: html.style.overflow,
      bodyMargin: body.style.margin,
      bodyPadding: body.style.padding,
      bodyWidth: body.style.width,
      bodyHeight: body.style.height,
      bodyOverflow: body.style.overflow,
    };

    html.style.margin = "0";
    html.style.padding = "0";
    html.style.width = "100%";
    html.style.height = "100%";
    html.style.overflow = "hidden";

    body.style.margin = "0";
    body.style.padding = "0";
    body.style.width = "100%";
    body.style.height = "100%";
    body.style.overflow = "hidden";

    return () => {
      html.style.margin = backup.htmlMargin;
      html.style.padding = backup.htmlPadding;
      html.style.width = backup.htmlWidth;
      html.style.height = backup.htmlHeight;
      html.style.overflow = backup.htmlOverflow;

      body.style.margin = backup.bodyMargin;
      body.style.padding = backup.bodyPadding;
      body.style.width = backup.bodyWidth;
      body.style.height = backup.bodyHeight;
      body.style.overflow = backup.bodyOverflow;
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "#222a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: 390,
          height: 844,
          border: "16px solid #222",
          borderRadius: 40,
          boxShadow: "0 0 32px 8px #0008, 0 8px 32px #0006",
          position: "relative",
          background: "#001f3f",
          overflow: "hidden",
        }}
      >
        {/* ノッチ */}
        <div
          style={{
            width: 120,
            height: 30,
            background: "#222",
            borderRadius: "0 0 20px 20px",
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 20,
          }}
        />

        {/* 中身（/student 以下のページ） */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            paddingTop: 30, // ノッチぶん
            zIndex: 10,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
