"use client";

import React, { useState, useEffect } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationPhase(1), 400);
    const timer2 = setTimeout(() => setAnimationPhase(2), 900);
    const timer3 = setTimeout(() => setAnimationPhase(3), 1600);
    const timer4 = setTimeout(() => onComplete(), 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "inherit",
      overflow: "hidden",
      zIndex: 1300,
      transition: "opacity 0.3s ease-out",
      opacity: animationPhase === 3 ? 0 : 1,
      pointerEvents: animationPhase === 3 ? "none" : "auto"
    }}>
      {/* ロゴエリア */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        zIndex: 1310
      }}>
        {/* NO LOOK ロゴ */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          {/* NO */}
          <div style={{
            fontSize: "36px",
            fontWeight: "800",
            color: "white",
            letterSpacing: "1.5px",
            opacity: animationPhase >= 1 ? 1 : 0,
            transition: "opacity 0.5s ease-out"
          }}>
            NO
          </div>
          
          {/* LOOK */}
          <div style={{
            fontSize: "36px",
            fontWeight: "800",
            color: "white",
            letterSpacing: "1.5px",
            opacity: animationPhase >= 1 ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.2s"
          }}>
            LOOK
          </div>
        </div>

        {/* サブタイトル */}
        <div style={{
          fontSize: "14px",
          color: "white",
          opacity: animationPhase >= 2 ? 0.9 : 0,
          transition: "opacity 0.4s ease-out 0.3s",
          textAlign: "center",
          letterSpacing: "0.5px"
        }}>
          for School
        </div>

        {/* アニメーションアイコン */}
  {/* アニメーション用アイコン領域を削除（目の絵文字と白い丸を取り除く） */}
      </div>

      {/* ローディングドット */}
      <div style={{
        position: "absolute",
        bottom: "60px",
        display: "flex",
        gap: "6px",
        opacity: animationPhase >= 2 ? 1 : 0,
        transition: "opacity 0.3s ease-out 1s"
      }}>
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.6)",
              animation: "none"
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;