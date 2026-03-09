"use client";
import { FiX } from 'react-icons/fi';
import React, { useState, useEffect } from "react";
import { FaRegCircleUser, FaUser, FaUserGraduate, FaUserTie, FaUserNinja, FaUserAstronaut, FaUserSecret, FaGears, FaHeart, FaStar } from "react-icons/fa6";
import { FaUserMd } from "react-icons/fa";
import { useRouter } from "next/navigation";
import styles from "../../styles/DesktopFrame.module.css";
import stylesBtn from "../../styles/button.module.css";

const DesktopFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState("FaRegCircleUser");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; school: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/userInfo.json")
      .then((res) => res.json())
      .then((data) => setUserInfo(data));
    
    // 保存されたアイコンを読み込み
    const savedIcon = localStorage.getItem("userIcon");
    const savedImage = localStorage.getItem("userImage");
    if (savedIcon) {
      setSelectedIcon(savedIcon);
    }
    if (savedImage) {
      setUploadedImage(savedImage);
    }
  }, []);

  // アイコンオプション
  const iconOptions = {
    FaRegCircleUser: { component: FaRegCircleUser, label: "デフォルト" },
    FaUser: { component: FaUser, label: "基本ユーザー" },
    FaUserGraduate: { component: FaUserGraduate, label: "先生" },
    FaUserTie: { component: FaUserTie, label: "ビジネス" },
    FaUserNinja: { component: FaUserNinja, label: "忍者" },
    FaUserAstronaut: { component: FaUserAstronaut, label: "宇宙飛行士" },
    FaUserSecret: { component: FaUserSecret, label: "エージェント" },
    FaUserMd: { component: FaUserMd, label: "医師" },
    FaGears: { component: FaGears, label: "エンジニア" },
    FaHeart: { component: FaHeart, label: "ハート" },
    FaStar: { component: FaStar, label: "スター" }
  };

  // アイコン変更
  const handleIconChange = (iconKey: string) => {
    setSelectedIcon(iconKey);
    localStorage.setItem("userIcon", iconKey);
    // アイコンを変更する場合はアップロードされた画像をクリア
    if (iconKey !== "customImage") {
      setUploadedImage(null);
      localStorage.removeItem("userImage");
    }
  };

  // 写真アップロード処理
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // ファイルサイズチェック (5MB以下)
      if (file.size > 5 * 1024 * 1024) {
        alert("ファイルサイズが大きすぎます。5MB以下の画像を選択してください。");
        return;
      }
      
      // ファイルタイプチェック
      if (!file.type.startsWith('image/')) {
        alert("画像ファイルを選択してください。");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setUploadedImage(imageData);
        setSelectedIcon("customImage");
        localStorage.setItem("userImage", imageData);
        localStorage.setItem("userIcon", "customImage");
      };
      reader.readAsDataURL(file);
    }
  };

  // アップロードされた画像を削除
  const handleImageDelete = () => {
    setUploadedImage(null);
    setSelectedIcon("FaRegCircleUser");
    localStorage.removeItem("userImage");
    localStorage.setItem("userIcon", "FaRegCircleUser");
  };

  // 現在選択されているアイコンコンポーネントを取得
  const getCurrentIcon = () => {
    if (selectedIcon === "customImage" && uploadedImage) {
      return () => (
        <img 
          src={uploadedImage} 
          alt="カスタムアイコン" 
          style={{ 
            width: "56px", 
            height: "56px", 
            borderRadius: "50%", 
            objectFit: "cover",
            border: "2px solid #e5e7eb"
          }} 
        />
      );
    }
    const IconComponent = iconOptions[selectedIcon as keyof typeof iconOptions]?.component || FaRegCircleUser;
    return IconComponent;
  };

  return (
    <div className={styles.desktopBg}>
      <div className={styles.desktopFrame}>
        {/* ヘッダー */}
        <div className={styles.header} style={{ display: "flex", alignItems: "center", position: "relative" }}>
          <button
            className={styles.hamburger}
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="メニュー"
          >
            <span className={sidebarOpen ? `${styles.hamburgerBar} ${styles.hamburgerBarOpen1}` : styles.hamburgerBar}></span>
            <span className={sidebarOpen ? `${styles.hamburgerBar} ${styles.hamburgerBarOpen2}` : styles.hamburgerBar}></span>
            <span className={sidebarOpen ? `${styles.hamburgerBar} ${styles.hamburgerBarOpen3}` : styles.hamburgerBar}></span>
          </button>
          <span style={{ margin: "0 auto" }}>No Look for School</span>
          <button
            style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            aria-label="ユーザー情報"
            onClick={() => setUserModalOpen(true)}
          >
            {selectedIcon === "customImage" && uploadedImage ? (
              <img 
                src={uploadedImage} 
                alt="カスタムアイコン" 
                style={{ 
                  width: "56px", 
                  height: "56px", 
                  borderRadius: "50%", 
                  objectFit: "cover",
                  border: "2px solid #e5e7eb"
                }} 
              />
            ) : (
              React.createElement(getCurrentIcon(), { size: 56 })
            )}
          </button>
        </div>
        {/* ユーザー情報モーダル */}
        {userModalOpen && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }} onClick={() => setUserModalOpen(false)}>
            <div style={{
              background: "#e9ecef",
              borderRadius: 12,
              padding: "32px 40px",
              minWidth: 400,
              maxWidth: 500,
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
              position: "relative",
              border: "1px solid #ced4da"
            }} onClick={e => e.stopPropagation()}>
              <h2 style={{marginBottom: 24, fontSize: 20, textAlign: "center"}}>ユーザー情報</h2>
              
              {/* 現在のアイコン表示 */}
              <div style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 20
              }}>
                {selectedIcon === "customImage" && uploadedImage ? (
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
                  React.createElement(getCurrentIcon(), { 
                    size: 80,
                    style: { color: "#3182ce" }
                  })
                )}
              </div>
              
              {/* アイコン選択セクション */}
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "8px",
                  maxHeight: "180px",
                  overflow: "auto",
                  padding: "8px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  background: "#f8fafc"
                }}>
                  {/* 写真アップロードオプション */}
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "8px",
                    border: selectedIcon === "customImage" ? "2px solid #3182ce" : "1px solid #d1d5db",
                    borderRadius: "8px",
                    background: selectedIcon === "customImage" ? "#eff6ff" : "#fff",
                    position: "relative",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
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
                    {uploadedImage ? (
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
                          color: selectedIcon === "customImage" ? "#1e40af" : "#6b7280"
                        }}>
                          カスタム
                        </span>
                        {selectedIcon === "customImage" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageDelete();
                            }}
                            style={{
                              position: "absolute",
                              top: "-5px",
                              right: "-5px",
                              width: "16px",
                              height: "16px",
                              borderRadius: "50%",
                              background: "#ef4444",
                              color: "white",
                              border: "none",
                              fontSize: "10px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                            title="画像を削除"
                          >
                            ×
                          </button>
                        )}
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
                  {Object.entries(iconOptions).map(([key, { component: IconComponent, label }]) => (
                    <button
                      key={key}
                      onClick={() => handleIconChange(key)}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: "8px",
                        border: selectedIcon === key ? "2px solid #3182ce" : "1px solid #d1d5db",
                        borderRadius: "8px",
                        background: selectedIcon === key ? "#eff6ff" : "#fff",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        fontSize: "10px",
                        color: selectedIcon === key ? "#1e40af" : "#6b7280"
                      }}
                      onMouseEnter={(e) => {
                        if (selectedIcon !== key) {
                          e.currentTarget.style.background = "#f1f5f9";
                          e.currentTarget.style.borderColor = "#9ca3af";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedIcon !== key) {
                          e.currentTarget.style.background = "#fff";
                          e.currentTarget.style.borderColor = "#d1d5db";
                        }
                      }}
                    >
                      <IconComponent size={24} style={{ marginBottom: "4px" }} />
                      <span style={{ textAlign: "center", lineHeight: "1.2" }}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {userInfo ? (
                <>
                  <div style={{marginBottom: 12}}>メールアドレス：{userInfo.email}</div>
                  <div style={{marginBottom: 12}}>ユーザー名：{userInfo.name}</div>
                  <div style={{marginBottom: 12}}>学校,所属名：{userInfo.school}</div>
                </>
              ) : (
                <div>読み込み中...</div>
              )}
              <button
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: '#EF4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  padding: '6px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  zIndex: 1001
                }}
                onClick={() => setUserModalOpen(false)}
              >
                <FiX size={20} />閉じる
              </button>
            </div>
          </div>
        )}
        {/* サイドバー＋メインを横並びに */}
        <div className={styles.frameContent}>
          {sidebarOpen && (
            <div className={styles.sidebarLeft}>
              <div className={styles.sidebarContent}>
                {/* サイドバー：ホームボタン */}
                <button
                  className={stylesBtn.sidebarBtn}
                  onClick={() => {
                    router.push("/maker");
                    setSidebarOpen(false);
                  }}
                >
                  ホーム
                </button>
                  {/* サイドバー：〇年〇組ボタン */}
                  <button
                    className={stylesBtn.sidebarBtn}
                    onClick={() => {
                      router.push("/maker/class");
                      setSidebarOpen(false);
                    }}
                  >
                    〇年〇組
                  </button>
                {/* サイドバー：統計ボタン */}
                <button
                  className={stylesBtn.sidebarBtn}
                  onClick={() => {
                    router.push("/maker/date");
                    setSidebarOpen(false);
                  }}
                >
                  統計
                </button>
                {/* サイドバー：カレンダーボタン */}
                <button
                  className={stylesBtn.sidebarBtn}
                  onClick={() => {
                    router.push("/maker/calendar");
                    setSidebarOpen(false);
                  }}
                >
                  カレンダー
                </button>
                {/* サイドバー：データ入力ボタン */}
                <button
                  className={stylesBtn.sidebarBtn}
                  onClick={() => {
                    router.push("/maker/data-input");
                    setSidebarOpen(false);
                  }}
                >
                  データ入力
                </button>
                {/* サイドバー：ユーザー情報ボタン */}
                <button
                  className={stylesBtn.sidebarBtn}
                  onClick={() => {
                    router.push("/maker/user");
                    setSidebarOpen(false);
                  }}
                >
                  ユーザー情報
                </button>
                {/* サイドバー：設定ボタン */}
                <button
                  className={stylesBtn.sidebarBtn}
                  onClick={() => {
                    router.push("/maker/setting");
                    setSidebarOpen(false);
                  }}
                >
                  設定
                </button>
                {/* サイドバー：ログアウトボタン */}
                <button
                  className={stylesBtn.sidebarBtn}
                  onClick={() => {
                    router.push("/");
                    setSidebarOpen(false);
                  }}
                >
                  ログアウト
                </button>
              </div>
            </div>
          )}
          <div className={styles.main}>
            {children}
          </div>
        </div>
        {/* フッター */}
        <div className={styles.footer}>© 2025 管理者アプリ</div>
      </div>
    </div>
  );
};

export default DesktopFrame;
