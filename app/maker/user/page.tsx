"use client";
import DesktopFrame from "../../../components/frame/DesktopFrame";
import { useState, useEffect } from "react";
import { getAllUsers } from "../../../lib/firebase/firestore";

interface User {
  id: number | string;
  name: string;
  grade: string;
  class: string;
  email: string;
  remarks: string;
}

export default function MakerUser() {
  // Firestoreからユーザーデータを取得
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Firestoreからデータを取得
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('Firestoreからデータを取得中...');
        setLoading(true);
        
        const firebaseUsers = await getAllUsers();
        console.log('取得したFirebaseデータ:', firebaseUsers);
        console.log('データ件数:', firebaseUsers.length);
        
        if (firebaseUsers.length === 0) {
          console.log('Firestoreにデータが存在しません。サンプルデータを使用します。');
          // サンプルデータを設定
          setUsers([
            { id: 1, name: "田中 太郎", grade: "1年", class: "A組", email: "tanaka.taro@school.edu.jp", remarks: "学級委員" },
            { id: 2, name: "佐藤 花子", grade: "1年", class: "A組", email: "sato.hanako@school.edu.jp", remarks: "図書委員" },
          ]);
        } else {
          // Firestoreデータを既存の形式に変換
          const convertedUsers = firebaseUsers.map(user => ({
            id: user.id || '',
            name: user.nickname || '',
            grade: user.years || '',
            class: user.class || '',
            email: user.email || '',
            remarks: ''
          }));
          
          console.log('変換後のデータ:', convertedUsers);
          setUsers(convertedUsers);
        }
      } catch (error) {
        console.error('データ取得エラー:', error);
        // エラーの場合はサンプルデータを使用
        setUsers([
          { id: 1, name: "田中 太郎", grade: "1年", class: "A組", email: "tanaka.taro@school.edu.jp", remarks: "学級委員" },
          { id: 2, name: "佐藤 花子", grade: "1年", class: "A組", email: "sato.hanako@school.edu.jp", remarks: "図書委員" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // 編集モーダル用のstate
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // フィルタリング用のstate
  const [selectedGrade, setSelectedGrade] = useState<string>("全て");
  const [selectedClass, setSelectedClass] = useState<string>("全て");

  // 学年とクラスの一覧を取得
  const grades = ["全て", ...Array.from(new Set(users.map(user => user.grade))).sort()];
  const classes = ["全て", ...Array.from(new Set(users.map(user => user.class))).sort()];

  // フィルタリングされたユーザー一覧
  const filteredUsers = users.filter(user => {
    const gradeMatch = selectedGrade === "全て" || user.grade === selectedGrade;
    const classMatch = selectedClass === "全て" || user.class === selectedClass;
    return gradeMatch && classMatch;
  });

  // 生徒をクリックした時の処理（閲覧モード）
  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setEditingUser({ ...user });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  // 編集モードに切り替え
  const handleEditMode = () => {
    setIsEditMode(true);
  };

  // 編集内容を保存
  const handleSaveUser = () => {
    if (editingUser) {
      setUsers(users.map(user => 
        user.id === editingUser.id ? editingUser : user
      ));
      setIsModalOpen(false);
      setSelectedUser(null);
      setEditingUser(null);
      setIsEditMode(false);
    }
  };

  // モーダルを閉じる
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setEditingUser(null);
    setIsEditMode(false);
  };

  return (
    <DesktopFrame>
      <div style={{ padding: "20px", maxWidth: "100%", overflow: "auto" }}>
        <h1 style={{ 
          fontSize: "28px", 
          fontWeight: "bold", 
          marginBottom: "24px", 
          color: "#2d3748",
          borderBottom: "2px solid #3182ce",
          paddingBottom: "8px"
        }}>
          グループユーザー情報
        </h1>

        {/* フィルタリングセクション */}
        <div style={{
          background: "#f8fafc",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "24px",
          border: "1px solid #e2e8f0"
        }}>
          <div style={{
            display: "flex",
            gap: "20px",
            alignItems: "center"
          }}>
            <div>
              <label style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#4a5568"
              }}>
                学年
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  fontSize: "14px",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  minWidth: "100px"
                }}
              >
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#4a5568"
              }}>
                クラス
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  fontSize: "14px",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  minWidth: "100px"
                }}
              >
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
            <div style={{
              marginTop: "20px"
            }}>
              <button
                onClick={() => {
                  setSelectedGrade("全て");
                  setSelectedClass("全て");
                }}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#6b7280",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontWeight: "500"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#4b5563";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#6b7280";
                }}
              >
                リセット
              </button>
            </div>
          </div>
        </div>
        
        <div style={{ 
          background: "#fff", 
          borderRadius: "12px", 
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          border: "1px solid #e2e8f0"
        }}>
          <table style={{ 
            width: "100%", 
            borderCollapse: "collapse",
            fontSize: "14px"
          }}>
            <thead>
              <tr style={{ 
                background: "linear-gradient(135deg, #3182ce 0%, #2563eb 100%)",
                color: "#fff"
              }}>
                <th style={{ 
                  padding: "16px 12px", 
                  textAlign: "center", 
                  fontWeight: "600",
                  fontSize: "15px",
                  width: "60px"
                }}>
                  No
                </th>
                <th style={{ 
                  padding: "16px 12px", 
                  textAlign: "left", 
                  fontWeight: "600",
                  fontSize: "15px",
                  width: "140px"
                }}>
                  名前
                </th>
                <th style={{ 
                  padding: "16px 12px", 
                  textAlign: "center", 
                  fontWeight: "600",
                  fontSize: "15px",
                  width: "80px"
                }}>
                  学年
                </th>
                <th style={{ 
                  padding: "16px 12px", 
                  textAlign: "center", 
                  fontWeight: "600",
                  fontSize: "15px",
                  width: "80px"
                }}>
                  クラス
                </th>
                <th style={{ 
                  padding: "16px 12px", 
                  textAlign: "left", 
                  fontWeight: "600",
                  fontSize: "15px",
                  width: "200px"
                }}>
                  メールアドレス
                </th>
                <th style={{ 
                  padding: "16px 12px", 
                  textAlign: "left", 
                  fontWeight: "600",
                  fontSize: "15px"
                }}>
                  備考
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr 
                  key={user.id} 
                  style={{ 
                    background: index % 2 === 0 ? "#f8fafc" : "#fff",
                    borderBottom: "1px solid #e2e8f0",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#e6f3ff";
                    e.currentTarget.style.transform = "scale(1.001)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = index % 2 === 0 ? "#f8fafc" : "#fff";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <td style={{ 
                    padding: "14px 12px", 
                    textAlign: "center", 
                    fontWeight: "500",
                    color: "#4a5568"
                  }}>
                    {user.id}
                  </td>
                  <td style={{ 
                    padding: "14px 12px", 
                    fontWeight: "500",
                    color: "#2d3748"
                  }}>
                    <button
                      onClick={() => handleUserClick(user)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#3182ce",
                        cursor: "pointer",
                        textDecoration: "underline",
                        fontSize: "inherit",
                        fontWeight: "inherit",
                        padding: "0"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#2563eb";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "#3182ce";
                      }}
                    >
                      {user.name}
                    </button>
                  </td>
                  <td style={{ 
                    padding: "14px 12px", 
                    textAlign: "center",
                    color: "#4a5568"
                  }}>
                    <span style={{
                      background: "#e6f3ff",
                      color: "#1e40af",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "500"
                    }}>
                      {user.grade}
                    </span>
                  </td>
                  <td style={{ 
                    padding: "14px 12px", 
                    textAlign: "center",
                    color: "#4a5568"
                  }}>
                    <span style={{
                      background: "#f0fdf4",
                      color: "#166534",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "500"
                    }}>
                      {user.class}
                    </span>
                  </td>
                  <td style={{ 
                    padding: "14px 12px",
                    color: "#4a5568",
                    fontSize: "13px"
                  }}>
                    <a 
                      href={`mailto:${user.email}`}
                      style={{
                        color: "#3182ce",
                        textDecoration: "none",
                        background: "#f7fafc",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0",
                        display: "inline-block",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#e6f3ff";
                        e.currentTarget.style.borderColor = "#3182ce";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#f7fafc";
                        e.currentTarget.style.borderColor = "#e2e8f0";
                      }}
                    >
                      {user.email}
                    </a>
                  </td>
                  <td style={{ 
                    padding: "14px 12px",
                    color: "#4a5568"
                  }}>
                    <span style={{
                      background: "#fef3c7",
                      color: "#92400e",
                      padding: "3px 8px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "400"
                    }}>
                      {user.remarks}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div style={{ 
          marginTop: "24px", 
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#6b7280",
          fontSize: "14px"
        }}>
          <div>
            表示中: {filteredUsers.length} 名 / 全体: {users.length} 名のユーザー
          </div>
          {(selectedGrade !== "全て" || selectedClass !== "全て") && (
            <div style={{
              backgroundColor: "#dbeafe",
              color: "#1e40af",
              padding: "4px 12px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: "500"
            }}>
              {selectedGrade !== "全て" && `${selectedGrade} `}
              {selectedClass !== "全て" && `${selectedClass} `}
              でフィルタ中
            </div>
          )}
        </div>
      </div>

      {/* 編集モーダル */}
      {isModalOpen && editingUser && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "24px",
            width: "500px",
            maxWidth: "90vw",
            maxHeight: "80vh",
            overflow: "auto",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}>
            <h2 style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "20px",
              color: "#2d3748",
              borderBottom: "2px solid #3182ce",
              paddingBottom: "8px"
            }}>
              {isEditMode ? "生徒情報編集" : "生徒情報詳細"}
            </h2>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#4a5568" }}>
                名前
              </label>
              {isEditMode ? (
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "14px"
                  }}
                />
              ) : (
                <div style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  fontSize: "14px",
                  backgroundColor: "#f7fafc",
                  color: "#2d3748"
                }}>
                  {editingUser.name}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#4a5568" }}>
                  学年
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editingUser.grade}
                    onChange={(e) => setEditingUser({ ...editingUser, grade: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      fontSize: "14px"
                    }}
                  />
                ) : (
                  <div style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "#f7fafc",
                    color: "#2d3748"
                  }}>
                    {editingUser.grade}
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#4a5568" }}>
                  クラス
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editingUser.class}
                    onChange={(e) => setEditingUser({ ...editingUser, class: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      fontSize: "14px"
                    }}
                  />
                ) : (
                  <div style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "#f7fafc",
                    color: "#2d3748"
                  }}>
                    {editingUser.class}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#4a5568" }}>
                メールアドレス
              </label>
              {isEditMode ? (
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "14px"
                  }}
                />
              ) : (
                <div style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  fontSize: "14px",
                  backgroundColor: "#f7fafc",
                  color: "#2d3748"
                }}>
                  {editingUser.email}
                </div>
              )}
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#4a5568" }}>
                備考
              </label>
              {isEditMode ? (
                <textarea
                  value={editingUser.remarks}
                  onChange={(e) => setEditingUser({ ...editingUser, remarks: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "14px",
                    minHeight: "80px",
                    resize: "vertical"
                  }}
                />
              ) : (
                <div style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  fontSize: "14px",
                  backgroundColor: "#f7fafc",
                  color: "#2d3748",
                  minHeight: "80px"
                }}>
                  {editingUser.remarks}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                onClick={handleCloseModal}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#f7fafc",
                  color: "#4a5568",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#edf2f7";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f7fafc";
                }}
              >
                {isEditMode ? "キャンセル" : "閉じる"}
              </button>
              {isEditMode ? (
                <button
                  onClick={handleSaveUser}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#3182ce",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#2563eb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#3182ce";
                  }}
                >
                  保存
                </button>
              ) : (
                <button
                  onClick={handleEditMode}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#10b981",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#059669";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#10b981";
                  }}
                >
                  編集
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </DesktopFrame>
  );
}
