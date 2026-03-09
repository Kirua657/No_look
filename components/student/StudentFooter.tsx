
"use client";

import React, { useEffect, useState } from "react";
import styles from "../../styles/SmartpjoneHeader.module.css";
import { FaHome } from "react-icons/fa";
import { FaCalendarDays } from "react-icons/fa6";
import { IoMdSettings } from "react-icons/io";
import Link from "next/link";

const iconMap: Record<string, React.ComponentType<any>> = {
  FaHome,
  FaCalendarDays,
  IoMdSettings,
};

const StudentFooter: React.FC = () => {
  const [items, setItems] = useState<Array<{ icon: string; href: string }>>([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch("/icon.json");
        const data = await response.json();
        setItems(data); // data.itemsではなくdataに変更
      } catch (error) {
        console.error("Failed to fetch items:", error);
      }
    };

    fetchItems();
  }, []);

  return (
    <footer className={styles.studentFooter}>
      <div style={{ display: "flex", width: "100%", height: "100%", justifyContent: "space-between" }}>
        {items.map((item, index) => {
          const IconComponent = iconMap[item.icon];
          
          if (!IconComponent) {
            return null;
          }

          return (
            <div key={index} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <Link href={item.href} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "1.5cm", height: "1.5cm" }}>
                <IconComponent color="#fff" size={57} style={{ width: "1.5cm", height: "1.5cm" }} />
              </Link>
            </div>
          );
        })}
      </div>
    </footer>
  );
};

export default StudentFooter;
