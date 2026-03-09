"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginWithEmail, isAuthenticated } from "../../lib/firebase/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // 既にログイン済みの場合はリダイレクト
  useEffect(() => {
    if (isAuthenticated()) {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        const domain = userData.email.split('@')[1];
        
        const teacherDomains = [
          'teacher.edu.jp',
          'school.ac.jp',
          'admin.edu.jp', 
          'maker.local'
        ];
        
        if (teacherDomains.includes(domain)) {
          router.push("/maker");
        } else {
          router.push("/student/home");
        }
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const user = await loginWithEmail(email, password);
      
      if (user) {
        console.log('ログイン成功:', user);
        
        // メールアドレスのドメイン部分を取得
        const domain = email.split('@')[1];
        
        // 特定のドメインの場合はmaker側へリダイレクト
        const teacherDomains = [
          'teacher.edu.jp',      // 教師専用ドメイン例
          'school.ac.jp',        // 学校関係者ドメイン例
          'admin.edu.jp',        // 管理者ドメイン例
          'maker.local'          // 開発・テスト用
        ];
        
        if (teacherDomains.includes(domain)) {
          console.log('教師用ドメインを検出:', domain);
          router.push("/maker");
        } else {
          console.log('生徒用ドメイン:', domain);
          router.push("/student/home");
        }
      } else {
        setError("メールアドレスまたはパスワードが正しくありません");
      }
    } catch (err: any) {
      setError(err.message || "ログインに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

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
          <div style={{ maxWidth: 340, margin: "40px auto", padding: 24, background: "#f5f5f5", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: 22, fontWeight: "bold", marginBottom: 24, textAlign: "center" }}>ログイン</h2>
            
            {error && (
              <div style={{
                background: "#fee",
                color: "#c53030",
                padding: "12px",
                borderRadius: "6px",
                marginBottom: "16px",
                fontSize: "14px",
                textAlign: "center"
              }}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 6 }}>メールアドレス</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #bbb', fontSize: 16 }} 
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 6 }}>パスワード</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #bbb', fontSize: 16 }} 
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: 140,
                  padding: "8px 0",
                  fontSize: 16,
                  background: isLoading ? "#ccc" : "#e53935",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: "bold",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  margin: "0 auto",
                  display: "block"
                }}
              >
                {isLoading ? "ログイン中..." : "ログイン"}
              </button>
            </form>
            
            <button
              type="button"
              onClick={() => router.push("/")}
              style={{
                width: 140,
                padding: "8px 0",
                fontSize: 14,
                background: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: "bold",
                cursor: "pointer",
                margin: "24px auto 0 auto",
                display: "block"
              }}
            >
              新規登録画面へ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
