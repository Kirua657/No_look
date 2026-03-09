"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import RegisterForm from "../components/frame/RegisterForm";
import SplashScreen from "../components/splash/SplashScreen";
import { isAuthenticated } from "../lib/firebase/auth";

export default function Home() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  // スプラッシュ完了後に認証チェック
  const handleSplashComplete = () => {
    // スプラッシュが完了してから認証チェックを開始
    console.log("認証状態チェック中...");
    
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUser = localStorage.getItem('currentUser');
    console.log("isLoggedIn:", isLoggedIn);
    console.log("currentUser:", currentUser);
    
    if (isAuthenticated()) {
      console.log("ユーザーは認証済み - 直接適切なページにリダイレクト");
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          const domain = user.email.split('@')[1];
          
          const teacherDomains = [
            'teacher.edu.jp',
            'school.ac.jp', 
            'admin.edu.jp',
            'maker.local'
          ];
          
          if (teacherDomains.includes(domain)) {
            console.log("先生ページにリダイレクト");
            router.push("/maker");
          } else {
            console.log("生徒ページにリダイレクト");
            router.push("/student/home");
          }
          return;
        } catch (error) {
          console.error("ユーザーデータの解析エラー:", error);
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('currentUser');
          localStorage.removeItem('loginTimestamp');
        }
      }
    }
    
    // 未ログインの場合のみ新規登録画面を表示
    setShowSplash(false);
    console.log("ユーザーは未認証 - 登録画面を表示");
  };

  // 常にスプラッシュから開始
  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      background: "#222a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "fixed",
      inset: 0,
      zIndex: 1000
    }}>
      <div style={{
        width: 390,
        height: 844,
        border: "16px solid #222",
        borderRadius: 40,
        boxShadow: "0 0 32px 8px #0008, 0 8px 32px #0006",
        position: "relative",
        background: "#fff",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start"
      }}>
        {/* Notch */}
        <div style={{
          width: 120,
          height: 30,
          background: "#222",
          borderRadius: "0 0 20px 20px",
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)"
        }} />
        
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
        <div style={{
          width: "100%",
          height: "100%",
          position: "relative",
          zIndex: 1200,
          paddingTop: 30,
          overflow: "hidden",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          flexDirection: "column"
        }}>
          {showSplash ? (
            <SplashScreen onComplete={handleSplashComplete} />
          ) : (
            <main className="flex flex-col items-center justify-center min-h-[80vh] w-full">
              <RegisterForm />
            </main>
          )}
        </div>
      </div>
    </div>
  );
}
