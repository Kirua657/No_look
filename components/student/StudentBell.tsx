"use client";

import { BsBell } from "react-icons/bs";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  count?: number;
  color?: string;
};

export default function StudentBell({ count, color = "#222" }: Props) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    router.push("/student/bell");
  };

  return (
    <div 
      style={{ 
        position: "relative", 
        display: "inline-block",
        cursor: "pointer",
        transform: isHovered ? "scale(1.1)" : "scale(1)",
        transition: "transform 0.2s ease",
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title="通知・お知らせを見る"
    >
      <BsBell size={32} color={color} />
      {count && count > 0 && (
        <span
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            background: "#e53935",
            color: "#fff",
            borderRadius: "50%",
            padding: "2px 7px",
            fontSize: 12,
            fontWeight: "bold",
            minWidth: 20,
            textAlign: "center",
            lineHeight: 1.2,
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        >
          {count}
        </span>
      )}
    </div>
  );
}
