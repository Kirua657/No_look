

"use client";

import Image from "next/image";
import "../../styles/student-responsive.css";
import SmartphoneFrame from "../../components/frame/SmartphoneFrame";
import Link from "next/link";
import SmartphoneHeader from "../../components/frame/SmartphoneHeader";
import StudentBell from "../../components/student/StudentBell";
import StudentFooter from "../../components/student/StudentFooter";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SmartphoneFrame>
  <SmartphoneHeader />
  <div style={{ position: 'absolute', top: '25mm', right: '3mm', zIndex: 50 }}><StudentBell count={3} /></div>
  <div className="flex justify-end pr-4"><StudentBell count={3} /></div>
        <div style={{flex: 1, display: "flex", flexDirection: "column", height: "100%", position: "relative"}}>
          <main
            className="flex flex-col items-center gap-4"
            style={{
              padding: "56px 16px 2cm 16px", // ヘッダー56px, フッター2cm分
              boxSizing: "border-box",
              width: "100%",
              flex: 1,
              margin: 0
            }}
          >
            <h1>生徒用メイン画面</h1>
            <p>ここに先生向けの機能やUIを追加できます。</p>
            <Link href="/student/home">
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">ホーム</button>
            </Link>
            <Link href="/student/setting">
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">設定</button>
            </Link>
            <Link href="/student/time">
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">履歴</button>
            </Link>
            <Link href="/student/bell">
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">通知</button>
            </Link>
          </main>
          <StudentFooter />
        </div>
      </SmartphoneFrame>
    </div>
  );
}
