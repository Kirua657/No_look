import DesktopFrame from "../../../components/frame/DesktopFrame";
import Link from "next/link";
import styles from "./settings.module.css";

export default function SettingsPage() {
  const menuItems = [
    { label: "お問い合わせ", icon: "📞", href: "/maker/contact" },
    { label: "アカウント管理", icon: "👤", href: "/maker/account" },
    { label: "利用規約", icon: "📋" },
    { label: "タイトルにもどる", icon: "🏠" },
    { label: "ログアウト", icon: "🚪" },
  ];

  return (
    <DesktopFrame>
      <div className={styles.background}>
        <div className={styles.container}>
          {menuItems.map((item, index) => {
            const cardContent = (
              <div className={styles.card}>
                <div className={styles.icon}>{item.icon}</div>
                <div className={styles.label}>{item.label}</div>
                <div className={styles.arrow}>›</div>
              </div>
            );

            // href があるものだけ Link 化する
            return item.href ? (
              <Link key={index} href={item.href} style={{ textDecoration: "none" }}>
                {cardContent}
              </Link>
            ) : (
              <div key={index}>{cardContent}</div>
            );
          })}
        </div>
      </div>
    </DesktopFrame>
  );
}
