"use client";

import { useState } from "react";
import "../../../styles/student-responsive.css";
import Link from "next/link";
import SmartphoneFrame from "../../../components/frame/SmartphoneFrame";
import SmartphoneHeader from "../../../components/frame/SmartphoneHeader";
import StudentBell from "../../../components/student/StudentBell";
import StudentFooter from "../../../components/student/StudentFooter";
import { useNews } from "../../../hooks/useNews";

export default function StudentHelpPage() {
  const { newNewsCount } = useNews();
  const [activeTab, setActiveTab] = useState("guide");
  
  const helpSections = [
    {
      id: 1,
      title: "ホーム画面の使い方",
      content: `ホーム画面では、今の気持ちや学校での出来事について話すことができます。

**チャット機能**
• 今日あったことや感じたことを入力してください
• AIが気持ちを理解して、一緒に考えてくれます
• カスタマイズされた背景色でトークを楽しめます
• メッセージ送信後、気持ちが自動分析されます

**背景カスタマイズ**
• 8種類の美しい背景色から選べます
• 自分の好きな画像をアップロードできます
• 選んだ設定は自動で保存されます`,
      image: ""
    },
    {
      id: 2,
      title: "お知らせ機能",
      content: `画面右上のベルマークから学校からのお知らせを見ることができます。

**お知らせ一覧**
• 大切なお知らせには赤い印がついています
• 種類によって色が違います（重要・お知らせ・メンテナンス・アップデート）
• 新しい情報には「New」が表示されます

**検索機能**
• タイトルや内容で探したいお知らせを検索できます
• 探している言葉が黄色でハイライトされます
• ×ボタンで検索を取り消せます

**詳細表示**
• お知らせをタップすると詳しい内容が表示されます
• 大きな画面で読みやすく表示されます`,
      image: ""
    },
    {
      id: 3,
      title: "ユーザーアイコン設定",
      content: `ヘッダーのユーザーアイコンを自分好みに変更できます。

**アイコン変更**
• ユーザーアイコンをタップ → 「アイコンを変更」ボタンを押す
• 11種類のかわいいアイコンから選べます
• 自分の写真を使うこともできます

**設定保存**
• 選んだアイコンは自動で保存されます
• 次に開いた時も同じアイコンが表示されます`,
      image: ""
    },
    {
      id: 4,
      title: "設定画面",
      content: `画面下の歯車マークから色々な設定ができます。

**アカウント情報**
• 登録情報を詳細に確認できます
• ニックネーム、学校名、学年、クラス、メールアドレスを表示
• トーク背景のカスタマイズができます

**その他の機能**
• このヘルプページを開く
• 困った時のお問い合わせ
• 最初の画面に戻る
• ログアウト

**ログアウトについて**
• 本当にログアウトするか確認画面が出ます
• ログイン情報は30日間保存されます
• ログアウトするとログイン画面に戻ります`,
      image: ""
    },
    {
      id: 5,
      title: "感情分析機能",
      content: `AIがあなたの気持ちを7つの種類に分けて理解してくれます。

**気持ちの種類**
• 喜（よろこび）- 嬉しい、楽しい時
• 哀（かなしみ）- 悲しい、寂しい時  
• 怒（いかり）- 怒っている、イライラしている時
• 憂（うれい）- 不安、心配な時
• 疲（つかれ）- 疲れている、だるい時
• 集（しゅう）- 集中している、やる気がある時
• 困（こまり）- 困っている、悩んでいる時

**分析結果の見方**
• チャットの横に気持ちのラベルが表示されます
• 色でどの気持ちかわかりやすくなっています
• 先生は全体の傾向を確認できます`,
      image: ""
    }
  ];

  const faqData = [
    {
      id: 1,
      question: "チャットで送ったメッセージは誰が見れますか？",
      answer: "あなたのメッセージの内容を先生が直接見ることはできません。ただし、どんな気持ちでいるかの傾向は先生に伝わります。プライバシーは守られているので安心してください。"
    },
    {
      id: 2,
      question: "トーク背景を変更したのに元に戻ってしまいます",
      answer: "ブラウザの一時ファイルが影響している可能性があります。設定画面から再度背景を選び直してみるか、ページを更新してみてください。"
    },
    {
      id: 3,
      question: "AIの感情分析は当たっていますか？",
      answer: "AIなので100%正確ではありませんが、だんだん良くなっています。参考程度に見てもらって、大事なことは自分で判断してくださいね。"
    },
    {
      id: 4,
      question: "チャットの履歴はいつまで残りますか？",
      answer: "メッセージはブラウザのローカルストレージに保存されます。ブラウザのデータを消去しない限り、長期間保存されます。"
    },
    {
      id: 5,
      question: "アプリが重くて動きが遅いです",
      answer: "以下を試してみてください：\n• ブラウザを一度閉じて開き直す\n• 他のタブやアプリを閉じる\n• 端末の容量を確保する\n• Wi-Fiの接続を確認する"
    },
    {
      id: 6,
      question: "パスワードを忘れてしまいました",
      answer: "担任の先生か学校の事務室に相談してください。安全のため、アプリの中ではパスワードを変更することができません。"
    },
    {
      id: 7,
      question: "カスタム背景画像はどんなファイルが使えますか？",
      answer: "JPG、PNG、GIFファイルが使用できます。ファイルサイズは5MBまでで、アップロード後自動でリサイズされます。"
    },
    {
      id: 8,
      question: "ログイン情報が保存されないのですが？",
      answer: "ログイン情報は30日間自動で保存されます。プライベートブラウジングやCookieが無効になっていると保存されません。"
    },
    {
      id: 9,
      question: "お知らせの通知を受け取りたいです",
      answer: "今はアプリの中のベルマークでお知らせを確認できます。プッシュ通知機能は今後追加される予定です。"
    },
    {
      id: 10,
      question: "個人情報は安全に守られていますか？",
      answer: "はい、安心してください。すべてのデータは暗号化されて、学校がしっかりと管理しています。外部に漏れることはありません。"
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center">
      <SmartphoneFrame>
        <SmartphoneHeader />
        <div style={{ position: 'absolute', top: '25mm', right: '3mm', zIndex: 50 }}>
          <StudentBell count={newNewsCount} />
        </div>

        {/* ヘルプタイトル */}
            <div style={{
              background: "#fff",
              padding: "16px 16px 8px 16px",
              paddingBottom: "2cm",
          marginTop: "calc(60px)",
          borderBottom: "1px solid #e5e7eb"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "8px"
          }}>
            <Link href="/student/setting">
              <button style={{
                background: "none",
                border: "none",
                fontSize: "18px",
                cursor: "pointer",
                color: "#6b7280"
              }}>
                ← 設定に戻る
              </button>
            </Link>
          </div>
          <h1 style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#1f2937",
            margin: "0",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}>
            No Look ヘルプ
          </h1>
          
          {/* タブナビゲーション */}
          <div style={{
            display: "flex",
            marginTop: "16px",
            borderRadius: "8px",
            overflow: "hidden",
            border: "1px solid #e5e7eb"
          }}>
            <button
              onClick={() => setActiveTab("guide")}
              style={{
                flex: 1,
                padding: "12px",
                background: activeTab === "guide" ? "#3182ce" : "#f9fafb",
                color: activeTab === "guide" ? "white" : "#6b7280",
                border: "none",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              使い方ガイド
            </button>
            <button
              onClick={() => setActiveTab("faq")}
              style={{
                flex: 1,
                padding: "12px",
                background: activeTab === "faq" ? "#3182ce" : "#f9fafb",
                color: activeTab === "faq" ? "white" : "#6b7280",
                border: "none",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              よくある質問
            </button>
          </div>
        </div>

        {/* メインコンテンツエリア */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "#f9fafb",
          overflowY: "auto",
          padding: "16px"
        }}>
          {activeTab === "guide" ? (
            /* 使い方ガイド */
            <>
              {helpSections.map((section) => (
                <div
                  key={section.id}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    padding: "20px",
                    marginBottom: "16px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    border: "1px solid #e5e7eb"
                  }}
                >
                  {/* セクションヘッダー */}
                  <div style={{
                    marginBottom: "16px",
                    paddingBottom: "12px",
                    borderBottom: "2px solid #3182ce"
                  }}>
                    <h2 style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: "#1f2937",
                      margin: "0",
                      padding: "8px 0"
                    }}>
                      {section.title}
                    </h2>
                  </div>

                  {/* コンテンツ */}
                  <div style={{
                    fontSize: "14px",
                    color: "#374151",
                    lineHeight: "1.6",
                    whiteSpace: "pre-wrap"
                  }}>
                    {section.content}
                  </div>
                </div>
              ))}
              
              {/* アプリ情報 */}
              <div style={{
                backgroundColor: "#3182ce",
                color: "white",
                borderRadius: "12px",
                padding: "20px",
                textAlign: "center",
                marginBottom: "16px"
              }}>
                <h3 style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  margin: "0 0 12px 0"
                }}>
                  No Look for School
                </h3>
                <p style={{
                  fontSize: "14px",
                  margin: "0",
                  opacity: "0.9",
                  lineHeight: "1.5"
                }}>
                  学生さんの気持ちをAIが理解して、学校生活をサポートするアプリです。<br />
                  トーク背景のカスタマイズ、持続的なログイン機能などで<br />
                  快適な体験を提供します。
                </p>
              </div>
            </>
          ) : (
            /* Q&A */
            <>
              <div style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                border: "1px solid #e5e7eb"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "16px"
                }}>
                  <span style={{ fontSize: "32px", marginRight: "12px" }}></span>
                  <h2 style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#1f2937",
                    margin: "0"
                  }}>
                    よくある質問
                  </h2>
                </div>
                <p style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  margin: "0"
                }}>
                  No Lookアプリを使っていてよく質問されることをまとめました。
                </p>
              </div>

              {faqData.map((faq) => (
                <div
                  key={faq.id}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    padding: "20px",
                    marginBottom: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    border: "1px solid #e5e7eb"
                  }}
                >
                  {/* 質問 */}
                  <div style={{
                    display: "flex",
                    alignItems: "flex-start",
                    marginBottom: "12px"
                  }}>
                    <span style={{
                      backgroundColor: "#3182ce",
                      color: "white",
                      borderRadius: "50%",
                      width: "20px",
                      height: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "bold",
                      marginRight: "12px",
                      flexShrink: 0,
                      marginTop: "2px"
                    }}>
                      Q
                    </span>
                    <h3 style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: "#1f2937",
                      margin: "0",
                      lineHeight: "1.4"
                    }}>
                      {faq.question}
                    </h3>
                  </div>
                  
                  {/* 回答 */}
                  <div style={{
                    display: "flex",
                    alignItems: "flex-start"
                  }}>
                    <span style={{
                      backgroundColor: "#10b981",
                      color: "white",
                      borderRadius: "50%",
                      width: "20px",
                      height: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "bold",
                      marginRight: "12px",
                      flexShrink: 0,
                      marginTop: "2px"
                    }}>
                      A
                    </span>
                    <div style={{
                      fontSize: "14px",
                      color: "#374151",
                      lineHeight: "1.6",
                      whiteSpace: "pre-wrap"
                    }}>
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* さらにサポートが必要な場合 */}
              <div style={{
                backgroundColor: "#3182ce",
                color: "white",
                borderRadius: "12px",
                padding: "20px",
                textAlign: "center",
                marginBottom: "16px"
              }}>
                <h3 style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  margin: "0 0 12px 0"
                }}>
                  さらにサポートが必要ですか？
                </h3>
                <p style={{
                  fontSize: "14px",
                  margin: "0 0 16px 0",
                  opacity: "0.9",
                  lineHeight: "1.5"
                }}>
                  ここで解決しない場合は、設定画面の「お問い合わせ」から<br />
                  お気軽に質問してください。
                </p>
                <Link href="/student/question">
                  <button style={{
                    backgroundColor: "white",
                    color: "#3182ce",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 20px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}>
                    お問い合わせする
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* 戻るボタン */}
        <div style={{
          padding: "16px",
          background: "#fff",
          borderTop: "1px solid #e5e7eb"
        }}>
          <Link href="/student/setting">
            <button style={{
              width: "100%",
              padding: "12px",
              background: "#3182ce",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "background 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#2563eb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#3182ce";
            }}
            >
              ← 設定に戻る
            </button>
          </Link>
        </div>

        <StudentFooter />
      </SmartphoneFrame>
    </div>
  );
}