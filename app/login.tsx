"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [school, setSchool] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ここで認証処理を実装（API連携など）
    // 仮で生徒/教師判定はせずstudentに遷移
    router.push("/student");
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, background: "#f5f5f5", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
      <h2 style={{ fontSize: 22, fontWeight: "bold", marginBottom: 24, textAlign: "center" }}>ログイン</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>学校名</label>
          <input value={school} onChange={e => setSchool(e.target.value)} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #bbb', fontSize: 16 }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>パスワード</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #bbb', fontSize: 16 }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '12px 0', fontSize: 18, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>ログイン</button>
      </form>
    </div>
  );
}
