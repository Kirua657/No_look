"use client";

import React, { useEffect, useState } from "react";
import styles from "../styles/SmartpjoneHeader.module.css";
import { FaHome } from "react-icons/fa";
import { FaCalendarDays } from "react-icons/fa6";
import { IoMdSettings } from "react-icons/io";
import { RiPrinterLine } from "react-icons/ri";
import { BsBell } from "react-icons/bs";
import Link from "next/link";

const iconMap: Record<string, React.ComponentType<any>> = {
  FaHome,
  FaCalendarDays,
  IoMdSettings,
  RiPrinterLine,
  BsBell,
};

const CommonFooter: React.FC = () => {
  const [items, setItems] = useState<Array<{ icon: string; href: string }>>([]);

  useEffect(() => {
    // teacher用のicon設定を読み込む
    fetch("/icon_teacher.json")
      .then((res) => res.json())
      .then((data) => setItems(data));
  }, []);

  return (
    <footer className={styles.studentFooter}>
      <div style={{ display: "flex", width: "100%", height: "100%", justifyContent: "space-between" }}>
        {items.map((item) => {
          const Icon = iconMap[item.icon];
          return (
            <div key={item.icon} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <Link href={item.href} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "1.5cm", height: "1.5cm" }}>
                {Icon && <Icon color="#fff" size={57} style={{ width: "1.5cm", height: "1.5cm" }} />}
              </Link>
            </div>
          );
        })}
      </div>
    </footer>
  );
};

export default CommonFooter;
