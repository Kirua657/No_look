"use client";

import DesktopFrame from "../../../components/frame/DesktopFrame";
import styles from "./account.module.css";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const router = useRouter();

  const handleSave = () => {
    // 必要ならサーバー更新処理を書く
    router.push("/maker/setting"); // ← これで遷移！
  };

  return (
    <DesktopFrame>
      <div className={styles.background}>
        <div className={styles.container}>

          {/* タイトルカード */}
          <div className={styles.cardTitle}>
            <h2 className={styles.title}>アカウント管理</h2>
            <p className={styles.subtitle}>
              お客様のアカウント情報を管理できます。
            </p>
          </div>

          {/* 入力フォームカード */}
          <div className={styles.card}>

            <label className={styles.label}>お名前</label>
            <input className={styles.input} type="text" placeholder="山田太郎" />

            <label className={styles.label}>メールアドレス</label>
            <input className={styles.input} type="email" placeholder="example@mail.com" />

            <label className={styles.label}>パスワード</label>
            <input className={styles.input} type="password" placeholder="●●●●●●●●" />

            <button className={styles.button} onClick={handleSave}>
              保存する
            </button>
          </div>

        </div>
      </div>
    </DesktopFrame>
  );
}

