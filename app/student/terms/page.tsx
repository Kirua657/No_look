"use client";

import SmartphoneFrame from "../../../components/frame/SmartphoneFrame";
import SmartphoneHeader from "../../../components/frame/SmartphoneHeader";
import StudentBell from "../../../components/student/StudentBell";
import StudentFooter from "../../../components/student/StudentFooter";
import Link from "next/link";
import { useNews } from "../../../hooks/useNews";
import "../../../styles/student-responsive.css";

export default function TermsPage() {
  const { newNewsCount } = useNews();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <SmartphoneFrame>
        <SmartphoneHeader />
        <div style={{ position: 'absolute', top: '25mm', right: '3mm', zIndex: 50 }}>
          <StudentBell count={newNewsCount} color="#fff" />
        </div>

        <div style={{
          background: '#fff',
          padding: '16px',
          paddingBottom: '2cm',
          marginTop: 'calc(60px)',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Link href="/student/setting">
              <button style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#6b7280' }}>← 設定に戻る</button>
            </Link>
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: '700', textAlign: 'center', margin: 0 }}>利用規約</h1>
          <div style={{ marginTop: '12px' }}>
            <section style={{ marginBottom: '12px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600' }}>1. はじめに</h2>
              <p style={{ fontSize: '14px', color: '#374151' }}>
                本アプリ（「No Look」）を利用する前に、この利用規約（以下「本規約」）をよくお読みください。アプリを利用することで、本規約に同意したものとみなされます。
              </p>
            </section>

            <section style={{ marginBottom: '12px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600' }}>2. 利用対象</h2>
              <p style={{ fontSize: '14px', color: '#374151' }}>
                本アプリは学校の指導のもとで利用されることを想定しています。保護者や学校の方針に従ってください。
              </p>
            </section>

            <section style={{ marginBottom: '12px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600' }}>3. プライバシーとデータ</h2>
              <p style={{ fontSize: '14px', color: '#374151' }}>
                ユーザーが送信したメッセージは、AIによる分析のために一時的にサーバーに送信される場合があります。ただし、個人を特定する情報は可能な限り保護され、学校側が個別のメッセージを閲覧することは原則としてありません。詳細は学校のプライバシーポリシーに従ってください。
              </p>
            </section>

            <section style={{ marginBottom: '12px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600' }}>4. 禁止事項</h2>
              <ul style={{ fontSize: '14px', color: '#374151', paddingLeft: '18px' }}>
                <li>他者を誹謗中傷する内容の投稿</li>
                <li>個人情報（住所・ID・パスワード等）の公開</li>
                <li>不正利用や第三者アカウントの使用</li>
              </ul>
            </section>

            <section style={{ marginBottom: '12px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600' }}>5. 免責事項</h2>
              <p style={{ fontSize: '14px', color: '#374151' }}>
                本アプリおよびAIが提供する情報は参考目的です。診断や専門的な助言が必要な場合は、必ず担当教員や保護者、専門家に相談してください。
              </p>
            </section>

            <section style={{ marginBottom: '12px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600' }}>6. 規約の変更</h2>
              <p style={{ fontSize: '14px', color: '#374151' }}>
                運営は必要に応じて本規約を変更することがあります。重要な変更はアプリ内で通知します。
              </p>
            </section>

            <section style={{ marginBottom: '12px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600' }}>7. お問い合わせ</h2>
              <p style={{ fontSize: '14px', color: '#374151' }}>
                本規約やアプリに関するお問い合わせは、設定画面の「お問い合わせ」からご連絡ください。
              </p>
            </section>

            {/* Footer button removed; top '設定に戻る' link remains */}
          </div>
        </div>

        <StudentFooter />
      </SmartphoneFrame>
    </div>
  )
}
