"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaUser, FaHeart, FaStar, FaCoffee, FaCat, FaDog, FaGamepad, FaMusic, FaPalette, FaCamera } from "react-icons/fa";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdFace } from "react-icons/md";
import styles from "../../styles/SmartpjoneHeader.module.css";
import { getCurrentUser, User } from "../../lib/userManager";

const SmartphoneHeader: React.FC = () => {
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [iconModalOpen, setIconModalOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string>("default");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // アイコン設定を読み込み
    const savedIcon = localStorage.getItem('userIcon');
    const savedImage = localStorage.getItem('userUploadedImage');
    if (savedIcon) setSelectedIcon(savedIcon);
    if (savedImage) setUploadedImage(savedImage);

    // 新しいユーザー管理システムから現在のユーザー情報を取得
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUserInfo(currentUser);
      return;
    }
    
    // フォールバック1: 従来のlocalStorageから読み込み
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        // 既存データを新しい形式に変換
        const convertedUser: User = {
          id: parsedUserInfo.userId || Date.now().toString(),
          email: parsedUserInfo.email,
          name: parsedUserInfo.name,
          school: parsedUserInfo.school,
          role: parsedUserInfo.role || 'student',
          password: '', // パスワードは表示しない
          createdAt: new Date().toISOString()
        };
        setUserInfo(convertedUser);
        return;
      } catch (error) {
        console.error('Failed to parse stored user info:', error);
      }
    }
    
    // フォールバック2: userInfo.jsonから読み込み
    fetch("/userInfo.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => {
        // 既存データを新しい形式に変換
        const convertedUser: User = {
          id: data.userId || Date.now().toString(),
          email: data.email,
          name: data.name,
          school: data.school,
          role: 'student', // デフォルト
          password: '', // パスワードは表示しない
          createdAt: new Date().toISOString()
        };
        setUserInfo(convertedUser);
      })
      .catch(() => setUserInfo(null));
  }, []);

  // アイコン選択ハンドラー
  const handleIconSelect = (iconKey: string) => {
    setSelectedIcon(iconKey);
    localStorage.setItem('userIcon', iconKey);
    if (iconKey !== 'upload') {
      setUploadedImage(null);
      localStorage.removeItem('userUploadedImage');
    }
    setIconModalOpen(false);
  };

  // ファイルアップロードハンドラー
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
        setSelectedIcon('upload');
        localStorage.setItem('userUploadedImage', result);
        localStorage.setItem('userIcon', 'upload');
        setIconModalOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // 現在のアイコンを取得
  const getCurrentIcon = (size: number = 32, color: string = "#fff") => {
    if (selectedIcon === 'upload' && uploadedImage) {
      return (
        <img 
          src={uploadedImage} 
          alt="ユーザーアイコン" 
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
      );
    }

    const iconMap: Record<string, React.ReactElement> = {
      default: <FaRegCircleUser size={size} color={color} />,
      user: <FaUser size={size} color={color} />,
      face: <MdFace size={size} color={color} />,
      heart: <FaHeart size={size} color={color} />,
      star: <FaStar size={size} color={color} />,
      coffee: <FaCoffee size={size} color={color} />,
      cat: <FaCat size={size} color={color} />,
      dog: <FaDog size={size} color={color} />,
      game: <FaGamepad size={size} color={color} />,
      music: <FaMusic size={size} color={color} />,
      palette: <FaPalette size={size} color={color} />,
    };

    return iconMap[selectedIcon] || iconMap.default;
  };

  return (
    <div className={styles.container} style={{width: "100%", margin: 0, padding: 0}}>
      <header className={styles.header} style={{background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"}}>
        <span className={styles.title}>No Look </span>
        <button
          className={styles.userButton}
          aria-label="ユーザー情報"
          onClick={() => setUserModalOpen(true)}
        >
          {getCurrentIcon()}
        </button>
      </header>
      {userModalOpen && (
        <div style={{
          position: "absolute",
          top: -40,
          left: 0,
          width: "100%",
          height: "calc(100vh - 70px)",
          background: "rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }} onClick={() => setUserModalOpen(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-modal-title"
            style={{
              background: "#e9ecef",
              borderRadius: 12,
              padding: "32px 40px",
              minWidth: 320,
              maxWidth: 400,
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
              position: "relative",
              border: "1px solid #ced4da"
            }}
          >
            <h2 id="user-modal-title" style={{marginBottom: 24, fontSize: 20, textAlign: "center"}}>
              ユーザー情報
            </h2>
            {/* 右上の × ボタン */}
            <button
              aria-label="閉じる"
              onClick={() => setUserModalOpen(false)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'none',
                border: 'none',
                fontSize: 20,
                cursor: 'pointer',
                color: '#6b7280',
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
            
            {/* 現在のアイコン表示 */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 20
            }}>
              {selectedIcon === "upload" && uploadedImage ? (
                <img 
                  src={uploadedImage} 
                  alt="カスタムアイコン" 
                  style={{ 
                    width: "80px", 
                    height: "80px", 
                    borderRadius: "50%", 
                    objectFit: "cover",
                    border: "3px solid #3182ce"
                  }} 
                />
              ) : (
                <div style={{ color: "#3182ce" }}>
                  {getCurrentIcon(80, "#3182ce")}
                </div>
              )}
            </div>
            
            {/* アイコン選択セクション */}
            <div style={{ marginBottom: 20 }}>
              <button
                onClick={() => setIconModalOpen(true)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  cursor: "pointer",
                  marginBottom: "16px"
                }}
              >
                アイコンを変更
              </button>
            </div>
            
            {userInfo ? (
              <>
                <div style={{marginBottom: 12}}>ユーザー名：{userInfo.name}</div>
                {userInfo.role && <div style={{marginBottom: 12}}>ロール：{userInfo.role === 'student' ? '生徒' : '教師'}</div>}
              </>
            ) : (
              <div>読み込み中...</div>
            )}
            
            {/* フッターボタンは削除（右上の × を使用） */}
          </div>
        </div>
      )}
      
      {/* アイコン選択モーダル */}
      {iconModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 2000
        }} onClick={() => setIconModalOpen(false)}>
          <div style={{
            backgroundColor: "#e9ecef",
            borderRadius: "12px",
            padding: "24px",
            maxWidth: "90%",
            width: "320px",
            maxHeight: "80%",
            overflowY: "auto",
            border: "1px solid #ced4da"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "8px",
              maxHeight: "180px",
              overflow: "auto",
              padding: "8px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              background: "#f8fafc",
              marginBottom: "16px"
            }}>
              {/* 写真アップロードオプション */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "8px",
                border: selectedIcon === "upload" ? "2px solid #3182ce" : "1px solid #d1d5db",
                borderRadius: "8px",
                background: selectedIcon === "upload" ? "#eff6ff" : "#fff",
                position: "relative",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    cursor: "pointer"
                  }}
                />
                {uploadedImage && selectedIcon === "upload" ? (
                  <>
                    <img 
                      src={uploadedImage} 
                      alt="カスタム" 
                      style={{ 
                        width: "24px", 
                        height: "24px", 
                        borderRadius: "50%", 
                        objectFit: "cover",
                        marginBottom: "4px"
                      }} 
                    />
                    <span style={{ 
                      fontSize: "10px", 
                      textAlign: "center", 
                      lineHeight: "1.2",
                      color: selectedIcon === "upload" ? "#1e40af" : "#6b7280"
                    }}>
                      カスタム
                    </span>
                  </>
                ) : (
                  <>
                    <div style={{ 
                      width: "24px", 
                      height: "24px", 
                      border: "2px dashed #9ca3af", 
                      borderRadius: "4px", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      marginBottom: "4px",
                      fontSize: "12px",
                      color: "#6b7280"
                    }}>
                      +
                    </div>
                    <span style={{ 
                      fontSize: "10px", 
                      textAlign: "center", 
                      lineHeight: "1.2",
                      color: "#6b7280"
                    }}>
                      写真追加
                    </span>
                  </>
                )}
              </div>
              
              {/* 既存のアイコンオプション */}
              {[
                { key: 'default', icon: <FaRegCircleUser size={24} />, label: 'デフォルト' },
                { key: 'user', icon: <FaUser size={24} />, label: '基本ユーザー' },
                { key: 'face', icon: <MdFace size={24} />, label: '顔' },
                { key: 'heart', icon: <FaHeart size={24} />, label: 'ハート' },
                { key: 'star', icon: <FaStar size={24} />, label: 'スター' },
                { key: 'coffee', icon: <FaCoffee size={24} />, label: 'コーヒー' },
                { key: 'cat', icon: <FaCat size={24} />, label: '猫' },
                { key: 'dog', icon: <FaDog size={24} />, label: '犬' },
                { key: 'game', icon: <FaGamepad size={24} />, label: 'ゲーム' },
                { key: 'music', icon: <FaMusic size={24} />, label: '音楽' },
                { key: 'palette', icon: <FaPalette size={24} />, label: 'アート' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleIconSelect(item.key)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "8px",
                    border: selectedIcon === item.key ? "2px solid #3182ce" : "1px solid #d1d5db",
                    borderRadius: "8px",
                    background: selectedIcon === item.key ? "#eff6ff" : "#fff",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontSize: "10px",
                    color: selectedIcon === item.key ? "#1e40af" : "#6b7280"
                  }}
                  onMouseEnter={(e) => {
                    if (selectedIcon !== item.key) {
                      e.currentTarget.style.background = "#f1f5f9";
                      e.currentTarget.style.borderColor = "#9ca3af";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedIcon !== item.key) {
                      e.currentTarget.style.background = "#fff";
                      e.currentTarget.style.borderColor = "#d1d5db";
                    }
                  }}
                >
                  <div style={{ marginBottom: "4px", color: "inherit" }}>
                    {item.icon}
                  </div>
                  <span style={{ textAlign: "center", lineHeight: "1.2" }}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setIconModalOpen(false)}
              style={{
                width: "100%",
                padding: "8px 24px",
                background: "#3182ce",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartphoneHeader;
