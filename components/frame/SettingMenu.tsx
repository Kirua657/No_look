"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaUser, FaHeart, FaStar, FaCoffee, FaCat, FaDog, FaGamepad, FaMusic, FaPalette } from "react-icons/fa";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdFace } from "react-icons/md";
import { logout } from "../../lib/firebase/auth";

const SettingMenu: React.FC = () => {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string>("default");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [userNickname, setUserNickname] = useState<string>("学生");
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [consecutiveDays, setConsecutiveDays] = useState<number>(0);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [selectedChatBackground, setSelectedChatBackground] = useState<string>("white");
  const [uploadedChatBgImage, setUploadedChatBgImage] = useState<string | null>(null);

  // AI会話の連続日数を計算する関数
  const calculateConsecutiveDays = () => {
    const aiConversationDates = JSON.parse(localStorage.getItem('aiConversationDates') || '{}');
    const keys = Object.keys(aiConversationDates);
    if (keys.length === 0) return 0;

    let consecutive = 0;
    const today = new Date();
    let currentDate = new Date(today);

    for (let i = 0; i < 365; i++) {
      const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
      if (aiConversationDates[dateKey]) {
        consecutive++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return consecutive;
  };

  useEffect(() => {
    // schoolInfo があれば読み込む（表示名などに使う）
    try {
      const schoolInfo = localStorage.getItem('schoolInfo');
      if (schoolInfo) {
        const parsedInfo = JSON.parse(schoolInfo);
        if (parsedInfo.nickname) {
          setUserNickname(parsedInfo.nickname);
        }
        setUserInfo(parsedInfo);
      }
    } catch (error) {
      console.error('Failed to parse school info:', error);
    }

    // AI会話の連続日数を計算してセット
    const days = calculateConsecutiveDays();
    setConsecutiveDays(days);
  }, [showAccountModal]); // モーダルが開かれるたびに再計算

  // SmartphoneHeaderと同じgetCurrentIcon関数
  const getCurrentIcon = (size: number = 60) => {
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
      default: <FaRegCircleUser size={size} color="white" />,
      user: <FaUser size={size} color="white" />,
      face: <MdFace size={size} color="white" />,
      heart: <FaHeart size={size} color="white" />,
      star: <FaStar size={size} color="white" />,
      coffee: <FaCoffee size={size} color="white" />,
      cat: <FaCat size={size} color="white" />,
      dog: <FaDog size={size} color="white" />,
      game: <FaGamepad size={size} color="white" />,
      music: <FaMusic size={size} color="white" />,
      palette: <FaPalette size={size} color="white" />,
    };

    return iconMap[selectedIcon] || iconMap.default;
  };

  // チャット背景変更処理
  const handleChatBackgroundChange = (backgroundType: string) => {
    setSelectedChatBackground(backgroundType);
    localStorage.setItem('chatAreaBackground', backgroundType);
    if (backgroundType !== 'custom') {
      setUploadedChatBgImage(null);
      localStorage.removeItem('chatBackgroundImage');
    }
  };

  // チャット背景画像アップロード処理
  const handleChatBgImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedChatBgImage(result);
        setSelectedChatBackground('custom');
        localStorage.setItem('chatBackgroundImage', result);
        localStorage.setItem('chatAreaBackground', 'custom');
      };
      reader.readAsDataURL(file);
    }
  };


  
  const menuSections = [
    {
      items: [
        { 
          label: "ヘルプ", 
          icon: "🤝",
          iconBg: "#007AFF",
          onClick: () => router.push("/student/help"),
          isLogout: false,
          subtitle: undefined
        }
      ]
    },
    {
      items: [
        {
          label: "お問い合わせ",
          icon: "💬",
          iconBg: "#34C759",
          onClick: () => router.push("/student/question"),
          isLogout: false,
          subtitle: undefined
        },
        {
          label: "利用規約",
          icon: "📝",
          iconBg: "#8E8E93",
          onClick: () => router.push("/student/terms"),
          isLogout: false,
          subtitle: undefined
        }
      ]
    },
    {
      items: [
        { 
          label: "タイトルへ戻る", 
          icon: "🏠",
          iconBg: "#FF9500",
          onClick: () => router.push("/"),
          isLogout: false,
          subtitle: undefined
        }
      ]
    },
    {
      items: [
        { 
          label: "ログアウト", 
          icon: "👋",
          iconBg: "#FF3B30",
          onClick: () => setShowConfirm(true),
          isLogout: true,
          subtitle: undefined
        }
      ]
    }
  ];

  return (
    <div style={{ 
      background: "#f2f2f7",
      minHeight: "100%",
      padding: "0",
      flex: 1,
      overflow: "auto",
      paddingTop: "15px",
      paddingBottom: "70px"
    }}>
      {/* ユーザープロフィールセクション */}
      <div style={{
        background: "white",
        borderRadius: "16px",
        margin: "12px",
        marginBottom: "12px",
        overflow: "hidden"
      }}>
        <button
          onClick={() => {
            console.log("プロフィールクリック", { userInfo });
            setShowUserInfoModal(true);
          }}
          style={{
            width: "100%",
            padding: "16px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            textAlign: "left"
          }}
        >
          {/* プロフィール画像 */}
          <div style={{
            width: "60px",
            height: "60px",
            borderRadius: "30px",
            background: selectedIcon === 'upload' && uploadedImage ? "transparent" : "#007AFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            overflow: "hidden"
          }}>
            {getCurrentIcon(60)}
          </div>
          
          {/* ユーザー情報 */}
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#000000",
              marginBottom: "2px"
            }}>
              {userNickname}
            </div>
            <div style={{
              fontSize: "15px",
              color: "#8e8e93"
            }}>
              No Look, アカウント設定、その他
            </div>
          </div>
          
          {/* 矢印 */}
          <div style={{
            fontSize: "16px",
            color: "#c7c7cc"
          }}>
            ❯
          </div>
        </button>
      </div>

      {/* AI会話連続記録セクション */}
      <div style={{
        background: "linear-gradient(135deg, #FF9500 0%, #FF7B00 100%)",
        borderRadius: "16px",
        margin: "12px",
        marginBottom: "12px",
        padding: "16px",
        color: "white",
        textAlign: "center"
      }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "8px"
          }}>
            <span style={{ fontSize: "16px", fontWeight: "600" }}>
              連続会話日数
            </span>
          </div>
        <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "4px" }}>
          {consecutiveDays}日
        </div>
        <div style={{ fontSize: "12px", opacity: 0.9 }}>
          {consecutiveDays === 0 
            ? "今日からAIと会話を始めよう！" 
            : consecutiveDays === 1
              ? "素晴らしいスタート！"
              : consecutiveDays < 7
                ? "いい調子です！継続しましょう"
                : consecutiveDays < 30
                  ? "素晴らしい継続力です！"
                  : "驚異的な継続力！本当に素晴らしいです！"
          }
        </div>
      </div>

      {menuSections.map((section, sectionIndex) => (
        <div key={sectionIndex} style={{ 
          marginBottom: sectionIndex < menuSections.length - 1 ? "12px" : "0",
          paddingLeft: "12px",
          paddingRight: "12px"
        }}>
          {/* ライトモード風のグループ化されたリスト */}
          <div style={{
            background: "white",
            borderRadius: "16px",
            overflow: "hidden"
          }}>
            {section.items.map((item, itemIndex) => (
              <button
                key={itemIndex}
                onClick={item.onClick}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  borderBottom: itemIndex < section.items.length - 1 ? "0.5px solid rgba(60, 60, 67, 0.18)" : "none",
                  transition: "background 0.15s ease",
                  textAlign: "left",
                  fontSize: "17px",
                  minHeight: "44px"
                }}
                onMouseDown={e => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
                }}
                onMouseUp={e => {
                  e.currentTarget.style.background = 'transparent';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {/* テキスト部分 */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: "17px",
                    color: item.isLogout ? "#FF3B30" : "#000000",
                    fontWeight: "400"
                  }}>
                    {item.label}
                  </div>
                  {item.subtitle && (
                    <div style={{
                      fontSize: "13px",
                      color: "#8e8e93",
                      marginTop: "1px"
                    }}>
                      {item.subtitle}
                    </div>
                  )}
                </div>
                
                {/* 矢印（ライトモード風） */}
                <div style={{
                  fontSize: "14px",
                  color: "#c7c7cc",
                  fontWeight: "600"
                }}>
                  ❯
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
      
      {showConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.4)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          {/* ライトモード風のアクションシート */}
          <div style={{
            width: "100%",
            maxWidth: "270px",
            margin: "0 10px"
          }}>
            {/* メインメッセージ */}
            <div style={{
              background: 'rgba(247, 247, 247, 0.9)',
              backdropFilter: 'blur(20px)',
              borderRadius: '14px',
              marginBottom: '8px',
              border: 'none'
            }}>
              <div style={{
                padding: '20px',
                textAlign: 'center',
                borderBottom: '0.5px solid rgba(60, 60, 67, 0.29)'
              }}>
                <div style={{
                  fontSize: '17px',
                  fontWeight: '600',
                  color: '#000000',
                  marginBottom: '2px'
                }}>
                  ログアウト
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#8e8e93'
                }}>
                  もう一度ログインするにはパスワードが必要です
                </div>
              </div>
              
              <button
                onClick={async () => {
                  try {
                    await logout(); // 新しいログアウト関数を使用
                    setShowConfirm(false);
                    // ページをリロードしてログイン画面にリダイレクト
                    window.location.href = "/login";
                  } catch (error) {
                    console.error("ログアウトエラー:", error);
                    // エラーが発生してもログアウト処理を続行
                    setShowConfirm(false);
                    window.location.href = "/login";
                  }
                }}
                style={{
                  width: '100%',
                  padding: '20px',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '17px',
                  color: '#FF3B30',
                  cursor: 'pointer',
                  fontWeight: '400'
                }}
              >
                ログアウト
              </button>
            </div>
            
            {/* キャンセルボタン */}
            <button
              onClick={() => setShowConfirm(false)}
              style={{
                width: '100%',
                padding: '20px',
                background: 'rgba(247, 247, 247, 0.9)',
                backdropFilter: 'blur(20px)',
                border: 'none',
                borderRadius: '14px',
                fontSize: '17px',
                color: '#007AFF',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
      
      {/* アカウント情報モーダル */}
      {showAccountModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.4)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '320px',
            width: '100%',
            maxHeight: '80%',
            overflowY: 'auto'
          }}>
            {/* モーダルヘッダー */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0'
              }}>
                アカウント情報
              </h2>
              <button
                onClick={() => setShowAccountModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  fontWeight: 'bold'
                }}
              >
                ×
              </button>
            </div>

            {/* ユーザー情報表示 */}
            {userInfo ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* プロフィール画像とニックネーム */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  background: '#f9fafb',
                  borderRadius: '12px'
                }}>
                  <div style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "25px",
                    background: selectedIcon === 'upload' && uploadedImage ? "transparent" : "#007AFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    overflow: "hidden"
                  }}>
                    {getCurrentIcon(50)}
                  </div>
                  <div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>
                      {userInfo.nickname || "未設定"}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#6b7280'
                    }}>
                      生徒
                    </div>
                  </div>
                </div>

                {/* 詳細情報 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                      学校名
                    </div>
                    <div style={{ fontSize: '16px', color: '#1f2937' }}>
                      {userInfo.schoolName || "未設定"}
                    </div>
                  </div>

                  <div style={{
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                      学年
                    </div>
                    <div style={{ fontSize: '16px', color: '#1f2937' }}>
                      {userInfo.years || "未設定"}
                    </div>
                  </div>

                  <div style={{
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                      クラス
                    </div>
                    <div style={{ fontSize: '16px', color: '#1f2937' }}>
                      {userInfo.class || "未設定"}
                    </div>
                  </div>

                  <div style={{
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                      メールアドレス
                    </div>
                    <div style={{ fontSize: '16px', color: '#1f2937' }}>
                      {userInfo.email || "未設定"}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                  ユーザー情報が見つかりません
                </div>
                <div style={{ fontSize: '14px' }}>
                  もう一度ログインしてください
                </div>
              </div>
            )}

            {/* 閉じるボタン */}
            <button
              onClick={() => setShowAccountModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#007AFF',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                marginTop: '20px'
              }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
      
      {/* ユーザー情報モーダル（スマホフレーム内完全対応） */}
      {showUserInfoModal && (
        <div style={{
          position: 'absolute',
          top: '86px', // ヘッダー分を除く
          left: '0',
          width: '100%',
          height: 'calc(100% - 86px - 60px)', // ヘッダーとフッター分を除く
          background: 'rgba(0,0,0,0.6)',
          zIndex: 1200,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '16px',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '16px',
            width: '100%',
            maxWidth: '100%',
            height: '100%',
            overflowY: 'auto',
            animation: 'fadeInScale 0.3s ease-out',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* ヘッダー */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '2px solid #f3f4f6',
              flexShrink: 0
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                登録情報
              </h2>
              <button
                onClick={() => setShowUserInfoModal(false)}
                style={{
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.background = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.background = '#f3f4f6';
                }}
              >
                ✕
              </button>
            </div>

            {/* コンテンツエリア */}
            <div style={{ flex: 1, overflow: 'auto', paddingRight: '4px' }}>
              {/* ユーザー情報カード */}
              {userInfo || userNickname ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* プロフィールサマリー */}
                  <div style={{
                    padding: '18px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '14px',
                    color: 'white',
                    textAlign: 'center',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)'
                  }}>
                    <div style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "25px",
                      background: "rgba(255,255,255,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px auto",
                      overflow: "hidden",
                      border: '2px solid rgba(255,255,255,0.3)'
                    }}>
                      {getCurrentIcon(36)}
                    </div>
                    <div style={{ fontSize: '17px', fontWeight: '700', marginBottom: '4px', letterSpacing: '0.3px' }}>
                      {userInfo?.nickname || userNickname || "未設定"}
                    </div>
                    <div style={{ fontSize: '13px', opacity: 0.9, fontWeight: '500' }}>
                      学生
                    </div>
                  </div>

                  {/* 詳細情報 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{
                      padding: '14px',
                      background: '#f9fafb',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px', fontWeight: '600' }}>
                        学校名
                      </div>
                      <div style={{ fontSize: '15px', color: '#1f2937', fontWeight: '600', lineHeight: '1.3' }}>
                        {userInfo?.schoolName || "未設定"}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div style={{
                        padding: '14px',
                        background: '#f9fafb',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px', fontWeight: '600' }}>
                          学年
                        </div>
                        <div style={{ fontSize: '15px', color: '#1f2937', fontWeight: '600' }}>
                          {userInfo?.years || "未設定"}
                        </div>
                      </div>

                      <div style={{
                        padding: '14px',
                        background: '#f9fafb',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px', fontWeight: '600' }}>
                          クラス
                        </div>
                        <div style={{ fontSize: '15px', color: '#1f2937', fontWeight: '600' }}>
                          {userInfo?.class || "未設定"}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      padding: '14px',
                      background: '#f9fafb',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px', fontWeight: '600' }}>
                        メールアドレス
                      </div>
                      <div style={{ fontSize: '14px', color: '#1f2937', fontWeight: '500', wordBreak: 'break-all', lineHeight: '1.4' }}>
                        {userInfo?.email || "未設定"}
                      </div>
                    </div>

                  {/* チャット背景変更欄 */}
                  <div style={{
                    padding: '16px',
                    background: '#f9fafb',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px', fontWeight: '600' }}>
                      トーク背景
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '8px',
                      marginBottom: '12px'
                    }}>
                      {[
                        { key: 'white', label: 'ホワイト', bg: '#f5f5f5', textColor: '#333333' },
                        { key: 'light_blue', label: 'ライトブルー', bg: '#e6f3ff', textColor: '#1e40af' },
                        { key: 'light_green', label: 'ライトグリーン', bg: '#e6ffe6', textColor: '#166534' },
                        { key: 'light_pink', label: 'ライトピンク', bg: '#ffe6f0', textColor: '#be185d' },
                        { key: 'light_purple', label: 'ライトパープル', bg: '#f0e6ff', textColor: '#7c3aed' },
                        { key: 'cream', label: 'クリーム', bg: '#fff5d6', textColor: '#d97706' },
                        { key: 'mint', label: 'ミント', bg: '#e6fff5', textColor: '#047857' },
                        { key: 'light_gray', label: 'ライトグレー', bg: '#f0f0f0', textColor: '#475569' }
                      ].map((theme) => (
                        <button
                          key={theme.key}
                          onClick={() => handleChatBackgroundChange(theme.key)}
                          style={{
                            padding: '16px 12px',
                            background: theme.bg,
                            border: selectedChatBackground === theme.key ? '3px solid #007AFF' : '2px solid #e5e7eb',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.2s ease',
                            position: 'relative',
                            boxShadow: selectedChatBackground === theme.key ? '0 4px 12px rgba(0, 122, 255, 0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
                            minHeight: '60px'
                          }}
                        >
                          <div style={{
                            fontSize: '13px',
                            color: theme.textColor,
                            fontWeight: '600',
                            textAlign: 'center'
                          }}>
                            {theme.label}
                          </div>
                          {selectedChatBackground === theme.key && (
                            <div style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              background: '#007AFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              color: 'white'
                            }}>
                              ✓
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* カスタム背景画像アップロード */}
                    <label style={{
                      display: 'block',
                      padding: '16px',
                      background: selectedChatBackground === 'custom' ? '#E3F2FD' : '#f8fafc',
                      border: selectedChatBackground === 'custom' ? '3px solid #007AFF' : '2px dashed #cbd5e1',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      backgroundImage: selectedChatBackground === 'custom' && uploadedChatBgImage 
                        ? `url(${uploadedChatBgImage})` 
                        : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}>
                      <div style={{
                        background: selectedChatBackground === 'custom' && uploadedChatBgImage 
                          ? 'rgba(255,255,255,0.9)' 
                          : 'transparent',
                        borderRadius: '8px',
                        padding: selectedChatBackground === 'custom' && uploadedChatBgImage ? '8px' : '0'
                      }}>
                        <div style={{
                          fontSize: '14px',
                          color: selectedChatBackground === 'custom' ? '#007AFF' : '#64748b',
                          fontWeight: '600',
                          marginBottom: '4px'
                        }}>
                          カスタム背景画像
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                          JPG, PNG, GIF (最大5MB)
                        </div>
                      </div>
                      {selectedChatBackground === 'custom' && (
                        <div style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: '#007AFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          color: 'white'
                        }}>
                          ✓
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleChatBgImageUpload}
                        style={{ display: 'none' }}
                      />
                    </label>

                    </div>

                    <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '6px', textAlign: 'center' }}>
                      AIトークエリアの背景色・画像を変更できます
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '30px 15px',
                  color: '#6b7280'
                }}>
                  <div style={{ fontSize: '36px', marginBottom: '12px' }}>😓</div>
                  <div style={{ fontSize: '16px', marginBottom: '6px', fontWeight: '600' }}>
                    登録情報が見つかりません
                  </div>
                  <div style={{ fontSize: '13px' }}>
                    もう一度ログインしてください
                  </div>
                </div>
              )}
            </div>

            {/* フッターボタンは閉じるボタンのみ（戻るボタンは削除） */}
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeInScale {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default SettingMenu;
