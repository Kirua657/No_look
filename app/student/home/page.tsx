"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import RegisterForm from "../../../components/frame/RegisterForm";
import SplashScreen from "../../../components/splash/SplashScreen";
import { isAuthenticated } from "../../../lib/firebase/auth";
import { analyzeText } from "../../../lib/nolookApi";

export default function StudentHome() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  // ★ 感情解析テスト用
  const handleTestAnalyze = async () => {
    try {
      const res = await analyzeText({
        text: "今日は学校がすごく楽しかった！",
        user_id: "test_student_001",
      });
      console.log("解析結果:", res);
      alert(`感情: ${res.data.emotion} / 信頼度: ${res.data.confidence}`);
    } catch (e: any) {
      console.error(e);
      alert("APIエラー: " + e.message);
    }
  };

  const handleSplashComplete = () => {
    console.log("認証状態チェック中...");

    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const currentUser = localStorage.getItem("currentUser");
    console.log("isLoggedIn:", isLoggedIn);
    console.log("currentUser:", currentUser);

    if (isAuthenticated()) {
      console.log("ユーザーは認証済み - 直接適切なページにリダイレクト");
      const userData = localStorage.getItem("currentUser");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          const domain = (user.email || "").split("@")[1];

          const teacherDomains = [
            "teacher.edu.jp",
            "school.ac.jp",
            "admin.edu.jp",
            "maker.local",
          ];

          if (teacherDomains.includes(domain)) {
            console.log("先生ページにリダイレクト");
            router.push("/maker");
          } else {
            console.log("生徒ページ（チャット）にリダイレクト");
            router.push("/student/chat");
          }
          return;
        } catch (error) {
          console.error("ユーザーデータの解析エラー:", error);
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("currentUser");
          localStorage.removeItem("loginTimestamp");
        }
      }
    }

    // 未ログインなら登録画面へ
    setShowSplash(false);
    console.log("ユーザーは未認証 - 登録画面を表示");
  };

  // ★ ここからは「スマホの中」の画面だけ
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {showSplash ? (
        <SplashScreen onComplete={handleSplashComplete} />
      ) : (
        <main className="flex flex-col items-center justify-center min-h-[80vh] w-full gap-4">
          <RegisterForm />

          {/* ★ テストボタン（あとで削除OK） */}
          <button
            onClick={handleTestAnalyze}
            className="mt-4 px-4 py-2 rounded bg-blue-500 text-white text-sm"
          >
            感情解析APIテスト（暫定）
          </button>
        </main>
      )}
    </div>
  );
}
