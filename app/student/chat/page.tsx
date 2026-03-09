// app/student/chat/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import "../../../styles/student-responsive.css";
import SmartphoneHeader from "../../../components/frame/SmartphoneHeader";
import StudentBell from "../../../components/student/StudentBell";
import StudentFooter from "../../../components/student/StudentFooter";
import Scene from "../../../components/3D/Scene";
import { useNews } from "../../../hooks/useNews";
import { emotionService, type ChatMessage as EmotionChatMessage } from "../../../lib/api/emotionService";

// チャットメッセージ型
interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

const MAX_CHAT_HISTORY = 50;

export default function ChatPage() {
  // Service Worker登録＆通知許可
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then(() => {
        console.log("Service Worker registered");
      });
    }
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { newNewsCount } = useNews();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 自動スクロール
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatHistory, isLoading]);

  // チャット送信処理
  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: message.trim(),
      timestamp: new Date(),
    };

    setChatHistory((prev) => {
      const newHistory = [...prev, userMessage];
      return newHistory.length > MAX_CHAT_HISTORY
        ? newHistory.slice(-MAX_CHAT_HISTORY)
        : newHistory;
    });

    const currentMessage = message;
    setMessage("");

    try {
      // ✅ 履歴対応版：ChatMessage[]を emotionService に送る
      // chatHistory の形式を emotionService の形式に変換
      const messagesToSend: EmotionChatMessage[] = [
        ...chatHistory.map((msg) => ({
          role: msg.type === "user" ? ("user" as const) : ("assistant" as const),
          content: msg.content,
        })),
        {
          role: "user" as const,
          content: currentMessage,
        },
      ];

      const needsFollowup =
        currentMessage.toLowerCase().includes("不安") ||
        currentMessage.toLowerCase().includes("しんどい") ||
        currentMessage.toLowerCase().includes("辛い") ||
        currentMessage.toLowerCase().includes("心配");

      const response = await emotionService.ask({
        messages: messagesToSend,
        style: "buddy",
        followup: false,  // ✅ 改善③：followup を一旦 false 固定。質問は LLM 任せ
      });

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: response.reply,
        timestamp: new Date(),
      };

      setChatHistory((prev) => {
        const newHistory = [...prev, aiMessage];
        return newHistory.length > MAX_CHAT_HISTORY
          ? newHistory.slice(-MAX_CHAT_HISTORY)
          : newHistory;
      });
    } catch (err) {
      console.error("🚨 Message send error:", err);
      setError("エラーが発生しました。時間をおいて再度お試しください。");

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content:
          "すみません、現在返信できません。しばらく経ってから再度お試しください。",
        timestamp: new Date(),
      };
      setChatHistory((prev) => {
        const newHistory = [...prev, errorMessage];
        return newHistory.length > MAX_CHAT_HISTORY
          ? newHistory.slice(-MAX_CHAT_HISTORY)
          : newHistory;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        :global(.custom-scrollbar) {
          scrollbar-width: thin;
          scrollbar-color: #ccc #f1f1f1;
        }

        :global(.custom-scrollbar::-webkit-scrollbar) {
          width: 6px;
        }

        :global(.custom-scrollbar::-webkit-scrollbar-track) {
          background: #f1f1f1;
          border-radius: 3px;
        }

        :global(.custom-scrollbar::-webkit-scrollbar-thumb) {
          background: #ccc;
          border-radius: 3px;
        }

        :global(.custom-scrollbar::-webkit-scrollbar-thumb:hover) {
          background: #999;
        }

        .student-chat-root {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
          background: #001f3f;
        }

        .chat-main {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 8px 10px 76px;
          box-sizing: border-box;
        }
      `}</style>

      <div className="student-chat-root">
        <SmartphoneHeader />

        {/* ベル */}
        <div
          style={{ position: "absolute", top: "25mm", right: "3mm", zIndex: 50 }}
        >
          <StudentBell count={newNewsCount} color="#fff" />
        </div>

        <main className="chat-main">
          {/* クリオネエリア（260px に拡大） */}
          <div
            style={{
              height: 260,
              flexShrink: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 200,
                height: 200,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Scene />
            </div>
          </div>

          {/* チャットエリア（330pxに拡大） */}
          <div
            style={{
              height: 330,
              flexShrink: 0,
              marginBottom: 8,
            }}
          >
            {/* エラー表示 */}
            {error && (
              <div
                style={{
                  background: "#fee",
                  border: "1px solid #fcc",
                  borderRadius: "4px",
                  padding: "6px",
                  marginBottom: "6px",
                  fontSize: "12px",
                  color: "#c33",
                }}
              >
                {error}
              </div>
            )}

            <div
              ref={chatContainerRef}
              className="custom-scrollbar"
              style={{
                height: "100%", // 260px いっぱい
                background: "#f5f5f5",
                borderRadius: "8px",
                border: "1px solid #ccc",
                padding: "8px",
                overflowY: "auto",
                fontSize: "14px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {chatHistory.length === 0 ? null : (
                <>
                  {chatHistory.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        marginBottom: "8px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems:
                          msg.type === "user" ? "flex-end" : "flex-start",
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "75%",
                          padding: "8px 12px",
                          borderRadius: "12px",
                          wordWrap: "break-word",
                          whiteSpace: "pre-wrap",
                          background:
                            msg.type === "user" ? "#007bff" : "#e8f4f8",
                          color: msg.type === "user" ? "#fff" : "#333",
                        }}
                      >
                        {msg.content}
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#888",
                          marginTop: 2,
                        }}
                      >
                        {msg.timestamp.toLocaleTimeString("ja-JP", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#666",
                        fontSize: "12px",
                        marginTop: "auto",
                      }}
                    >
                      <div style={{ display: "flex", gap: "2px" }}>
                        <div
                          style={{
                            width: "4px",
                            height: "4px",
                            background: "#007bff",
                            borderRadius: "50%",
                            animation: "bounce 1.4s infinite",
                          }}
                        ></div>
                        <div
                          style={{
                            width: "4px",
                            height: "4px",
                            background: "#007bff",
                            borderRadius: "50%",
                            animation: "bounce 1.4s infinite 0.2s",
                          }}
                        ></div>
                        <div
                          style={{
                            width: "4px",
                            height: "4px",
                            background: "#007bff",
                            borderRadius: "50%",
                            animation: "bounce 1.4s infinite 0.4s",
                          }}
                        ></div>
                      </div>
                      AIが考えています...
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* 入力エリア */}
          <div
            style={{
              flexShrink: 0,
              minHeight: 95,
              display: "flex",
              alignItems: "flex-start",
              paddingTop: 4,
              paddingBottom: 4,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 8,
                width: "100%",
                flexDirection: "column",
              }}
            >
              <div
                style={{ display: "flex", gap: 8, alignItems: "center" }}
              >
                <input
                  type="text"
                  placeholder="今の気持ちや出来事を教えてください..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !isLoading && handleSend()
                  }
                  disabled={isLoading}
                  maxLength={500}
                  style={{
                    flex: 1,
                    height: 40,
                    padding: "0 12px",
                    border: "1px solid #ccc",
                    borderRadius: 6,
                    background: isLoading ? "#f5f5f5" : "#fff",
                    fontSize: 14,
                    color: isLoading ? "#999" : "#333",
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !message.trim()}
                  style={{
                    width: 60,
                    height: 40,
                    background:
                      isLoading || !message.trim() ? "#ccc" : "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 14,
                    cursor:
                      isLoading || !message.trim()
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {isLoading ? "..." : "送信"}
                </button>
              </div>

              <div
                style={{
                  textAlign: "right",
                  fontSize: 10,
                  color: message.length > 450 ? "#c33" : "#999",
                }}
              >
                {message.length}/500
              </div>
            </div>
          </div>
        </main>

        <StudentFooter />
      </div>
    </>
  );
}
