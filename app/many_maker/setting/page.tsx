import EducationBoardFrame from "../../../components/frame/EducationBoardFrame";
import styles from "./settings.module.css";

export default function SettingsPage() {
  const menuItems = [
    { label: "カスタマーサポート", icon: "📞" },
    { label: "アカウント管理", icon: "👤" },
    { label: "ヘルプ", icon: "❓" },
    { label: "タイトルにもどる", icon: "🏠" },
    { label: "ログアウト", icon: "🚪" },
  ];

  return (
    <EducationBoardFrame>
      <div className={styles.background}>
        <div className={styles.container}>
          {menuItems.map((item, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.icon}>{item.icon}</div>

              <div className={styles.label}>{item.label}</div>

              <div className={styles.arrow}>›</div>
            </div>
          ))}
        </div>
      </div>
    </EducationBoardFrame>
  );
}
