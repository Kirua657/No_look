"use client";

import DesktopFrame from "../../../components/frame/DesktopFrame";
import styles from "./contact.module.css";
import { useRouter } from "next/navigation";

export default function ContactPage() {
  const router = useRouter();

  const handleSubmit = () => {
    // 必要なら送信処理を書く
    router.push("/maker/setting"); // ← 遷移！
  };

  return (
    <DesktopFrame>
      <div className={styles.background}>
        <div className={styles.container}>

          {/* タイトルカード */}
          <div className={styles.cardTitle}>
            <h2 className={styles.title}>お問い合わせ</h2>
            <p className={styles.subtitle}>
              ご不明な点やサポートが必要な場合はご連絡ください。
            </p>
          </div>

          {/* 入力フォームカード */}
          <div className={styles.card}>

            {/* 名前 */}
            <label className={styles.label}>お名前</label>
            <input className={styles.input} type="text" placeholder="例: 山田太郎" />

            {/* メールアドレス */}
            <label className={styles.label}>メールアドレス</label>
            <input className={styles.input} type="email" placeholder="example@mail.com" />

            {/* 内容 */}
            <label className={styles.label}>お問い合わせ内容</label>
            <textarea
              className={styles.textarea}
              rows={5}
              placeholder="お問い合わせ内容をご記入ください"
            />

            {/* ボタン */}
            <button className={styles.button} onClick={handleSubmit}>
              送信する
            </button>
          </div>
        </div>
      </div>
    </DesktopFrame>
  );
}
