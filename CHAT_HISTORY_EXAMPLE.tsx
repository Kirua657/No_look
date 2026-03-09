/**
 * チャット履歴対応の実装例
 * 
 * この例を参考に、既存のチャットコンポーネントを修正してください。
 */

import { useState } from "react";
import { emotionService, AskResponse } from "./lib/api/emotionService";
import type { ChatMessage } from "./lib/api/emotionService";

export default function ChatHistoryExample() {
  // ✅ 履歴をステートで管理
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // メッセージ送信ハンドラ
  async function handleSend(userText: string) {
    if (!userText.trim()) return;

    // 1️⃣ ユーザーメッセージを履歴に追加
    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: userText },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // 2️⃣ 履歴ごとバックエンドに送信
      const res: AskResponse = await emotionService.ask({
        messages: newMessages,
        student_id: "demo-student", // TODO: 実際のIDに置き換え
        class_id: "demo-class",
        style: "buddy",
        followup: false,
      });

      // 3️⃣ AI返信を履歴に追加
      setMessages([
        ...newMessages,
        { role: "assistant", content: res.reply },
      ]);

      console.log("✅ AI感情:", res.emotion, "| LLM使用:", res.used_llm);
    } catch (error) {
      console.error("❌ Chat error:", error);
      // エラー時はエラーメッセージを表示
      setMessages([
        ...newMessages,
        { role: "assistant", content: "ごめん、うまく返事ができなかった..." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="chat-container">
      {/* メッセージ履歴表示 */}
      <div className="messages">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.role === "user" ? "user-msg" : "ai-msg"}`}
          >
            {msg.content}
          </div>
        ))}
        {isLoading && <div className="loading">AI が考え中...</div>}
      </div>

      {/* 入力フォーム */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const input = e.currentTarget.elements.namedItem("message") as HTMLInputElement;
          handleSend(input.value);
          input.value = "";
        }}
      >
        <input
          type="text"
          name="message"
          placeholder="メッセージを入力..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          送信
        </button>
      </form>
    </div>
  );
}

/**
 * 既存のチャットコンポーネント修正ポイント:
 * 
 * 1. ✅ ChatMessage[] をステートで持つ
 *    const [messages, setMessages] = useState<ChatMessage[]>([]);
 * 
 * 2. ✅ 送信時に履歴全体を送る
 *    const newMessages = [...messages, { role: "user", content: text }];
 *    emotionService.ask({ messages: newMessages });
 * 
 * 3. ✅ 返信を履歴に追加
 *    setMessages([...newMessages, { role: "assistant", content: res.reply }]);
 * 
 * 4. ✅ 型の変更
 *    emotionService.ask({
 *      messages: ChatMessage[],  // ← これ
 *      prompt: string,            // ← これは使わない（後方互換用）
 *    })
 */
