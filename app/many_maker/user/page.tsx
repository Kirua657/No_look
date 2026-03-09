"use client";
import EducationBoardFrame from "../../../components/frame/EducationBoardFrame";
import { useState, useEffect } from "react";
import { getAllUsers } from "../../../lib/firebase/firestore";

interface User {
  id: number | string;
  name: string;
  position: string; // 役職（教頭、主任など）
  subject: string; // 担当科目
  school: string; // 所属学校
  email: string;
  phoneNumber: string; // 電話番号
  hireDate: string; // 入職日
  remarks: string;
}

interface SchoolData {
  id: string;
  name: string;
  district: string;
  status: string;
  students: number;
  teachers: number;
}

export default function MakerUser() {
  // Firestoreからユーザーデータを取得
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  // 学校データ管理
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>("");

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
          // 教員サンプルデータを設定
          setUsers([
            { id: 1, name: "田中 太郎", position: "教頭", subject: "数学", school: "都立桜台高等学校", email: "tanaka.taro@school.edu.jp", phoneNumber: "03-1234-5678", hireDate: "2018-04-01", remarks: "進学指導主任" },
            { id: 2, name: "佐藤 花子", position: "主任教諭", subject: "国語", school: "都立桜台高等学校", email: "sato.hanako@school.edu.jp", phoneNumber: "03-1234-5679", hireDate: "2015-04-01", remarks: "1年A組担任" },
            { id: 3, name: "鈴木 一郎", position: "教諭", subject: "英語", school: "都立新宿高等学校", email: "suzuki.ichiro@school.edu.jp", phoneNumber: "03-2345-6789", hireDate: "2020-04-01", remarks: "ESS部顧問" },
            { id: 4, name: "高橋 美咲", position: "教諭", subject: "理科", school: "都立渋谷高等学校", email: "takahashi.misaki@school.edu.jp", phoneNumber: "03-3456-7890", hireDate: "2019-04-01", remarks: "化学実験室管理" },
            { id: 5, name: "山田 健二", position: "講師", subject: "体育", school: "都立池袋中学校", email: "yamada.kenji@school.edu.jp", phoneNumber: "03-4567-8901", hireDate: "2023-04-01", remarks: "サッカー部顧問" }
          ]);
        } else {
          // Firestoreデータを教員形式に変換
          const convertedUsers = firebaseUsers.map(user => ({
            id: user.id || '',
            name: user.nickname || '',
            position: '教諭',
            subject: '未設定',
            school: '都立桜台高等学校',
            email: user.email || '',
            phoneNumber: '',
            hireDate: '2023-04-01',
            remarks: ''
          }));
          
          console.log('変換後のデータ:', convertedUsers);
          setUsers(convertedUsers);
        }
      } catch (error) {
        console.error('データ取得エラー:', error);
        // エラーの場合は教員サンプルデータを使用
        setUsers([
          { id: 1, name: "田中 太郎", position: "教頭", subject: "数学", school: "都立桜台高等学校", email: "tanaka.taro@school.edu.jp", phoneNumber: "03-1234-5678", hireDate: "2018-04-01", remarks: "進学指導主任" },
          { id: 2, name: "佐藤 花子", position: "主任教諭", subject: "国語", school: "都立桜台高等学校", email: "sato.hanako@school.edu.jp", phoneNumber: "03-1234-5679", hireDate: "2015-04-01", remarks: "1年A組担任" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    // 学校データを取得
    const fetchSchools = async () => {
      try {
        // 実際の実装では、APIからデータを取得
        const schoolsData: SchoolData[] = [
          { id: "1", name: "都立桜台高等学校", district: "練馬区", status: "active", students: 850, teachers: 45 },
          { id: "2", name: "都立新宿高等学校", district: "新宿区", status: "active", students: 720, teachers: 38 },
          { id: "3", name: "都立渋谷高等学校", district: "渋谷区", status: "active", students: 680, teachers: 42 },
          { id: "4", name: "都立池袋中学校", district: "豊島区", status: "active", students: 420, teachers: 28 },
          { id: "5", name: "都立上野中学校", district: "台東区", status: "active", students: 380, teachers: 25 }
        ];
        setSchools(schoolsData);
      } catch (error) {
        console.error("学校データの取得に失敗しました:", error);
      }
    };

    fetchUsers();
    fetchSchools();
  }, []);

  // 編集モーダル用のstate
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // フィルタリング用のstate
  const [selectedPosition, setSelectedPosition] = useState<string>("全て");
  const [selectedSubject, setSelectedSubject] = useState<string>("全て");

  // 役職と科目の一覧を取得
  const positions = ["全て", ...Array.from(new Set(users.map(user => user.position))).sort()];
  const subjects = ["全て", ...Array.from(new Set(users.map(user => user.subject))).sort()];

  // フィルタリングされた教員一覧
  const filteredUsers = users.filter(user => {
    const schoolMatch = selectedSchool === "" || selectedSchool === "all_schools" || user.school === selectedSchool;
    const positionMatch = selectedPosition === "全て" || user.position === selectedPosition;
    const subjectMatch = selectedSubject === "全て" || user.subject === selectedSubject;
    return schoolMatch && positionMatch && subjectMatch;
  });

  // 学校変更ハンドラー
  const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSchool(e.target.value);
  };

  // 教員情報を保存（DB連携）
  const saveTeacherToDB = async (teacher: User) => {
    try {
      // 実際の実装では、APIでDBに保存
      console.log('教員情報をDBに保存:', teacher);
      // await api.saveTeacher(teacher);
      return true;
    } catch (error) {
      console.error('教員情報の保存に失敗:', error);
      return false;
    }
  };

  // 教員の異動処理
  const transferTeacher = async (teacherId: string | number, newSchool: string) => {
    try {
      const teacher = users.find(u => u.id === teacherId);
      if (teacher) {
        const updatedTeacher = { ...teacher, school: newSchool };
        const success = await saveTeacherToDB(updatedTeacher);
        if (success) {
          setUsers(users.map(u => u.id === teacherId ? updatedTeacher : u));
          alert(`${teacher.name}の異動が完了しました（${newSchool}）`);
        }
      }
    } catch (error) {
      console.error('異動処理エラー:', error);
      alert('異動処理に失敗しました');
    }
  };

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

  // 編集内容を保存（DB連携対応）
  const handleSaveUser = async () => {
    if (editingUser) {
      try {
        const success = await saveTeacherToDB(editingUser);
        if (success) {
          setUsers(users.map(user => 
            user.id === editingUser.id ? editingUser : user
          ));
          setIsModalOpen(false);
          setSelectedUser(null);
          setEditingUser(null);
          setIsEditMode(false);
          alert('教員情報を保存しました');
        } else {
          alert('保存に失敗しました');
        }
      } catch (error) {
        console.error('保存エラー:', error);
        alert('保存処理でエラーが発生しました');
      }
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
    <EducationBoardFrame>
      <div style={{ padding: "20px", maxWidth: "100%", overflow: "auto" }}>
        <h1 style={{ 
          fontSize: "28px", 
          fontWeight: "bold", 
          marginBottom: "24px", 
          color: "#2d3748",
          borderBottom: "2px solid #3182ce",
          paddingBottom: "8px"
        }}>
          👥 教員管理システム
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
            alignItems: "center",
            flexWrap: "wrap"
          }}>
            <div>
              <label style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#4a5568"
              }}>
                🏫 学校選択
              </label>
              <select
                value={selectedSchool}
                onChange={handleSchoolChange}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  fontSize: "14px",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  minWidth: "180px"
                }}
              >
                <option value="">学校を選択</option>
                <option value="all_schools">🌟 管轄内全学校</option>
                {schools.map(school => (
                  <option key={school.id} value={school.name}>
                    {school.name} ({school.district})
                  </option>
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
                👔 役職
              </label>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  fontSize: "14px",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  minWidth: "120px"
                }}
              >
                {positions.map(position => (
                  <option key={position} value={position}>{position}</option>
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
                📚 担当科目
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  fontSize: "14px",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  minWidth: "120px"
                }}
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            <div style={{
              marginTop: "20px"
            }}>
              <button
                onClick={() => {
                  setSelectedSchool("");
                  setSelectedPosition("全て");
                  setSelectedSubject("全て");
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
                🔄 リセット
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
                  width: "120px"
                }}>
                  👤 氏名
                </th>
                <th style={{ 
                  padding: "16px 12px", 
                  textAlign: "center", 
                  fontWeight: "600",
                  fontSize: "15px",
                  width: "100px"
                }}>
                  👔 役職
                </th>
                <th style={{ 
                  padding: "16px 12px", 
                  textAlign: "center", 
                  fontWeight: "600",
                  fontSize: "15px",
                  width: "100px"
                }}>
                  📚 科目
                </th>
                <th style={{ 
                  padding: "16px 12px", 
                  textAlign: "left", 
                  fontWeight: "600",
                  fontSize: "15px",
                  width: "150px"
                }}>
                  🏫 所属校
                </th>
                <th style={{ 
                  padding: "16px 12px", 
                  textAlign: "left", 
                  fontWeight: "600",
                  fontSize: "15px",
                  width: "160px"
                }}>
                  📧 連絡先
                </th>
                <th style={{ 
                  padding: "16px 12px", 
                  textAlign: "center", 
                  fontWeight: "600",
                  fontSize: "15px",
                  width: "100px"
                }}>
                  🔧 操作
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
                      background: user.position === "教頭" ? "#fef3c7" : user.position === "主任教諭" ? "#dbeafe" : "#f0fdf4",
                      color: user.position === "教頭" ? "#92400e" : user.position === "主任教諭" ? "#1e40af" : "#166534",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "500"
                    }}>
                      {user.position}
                    </span>
                  </td>
                  <td style={{ 
                    padding: "14px 12px", 
                    textAlign: "center",
                    color: "#4a5568"
                  }}>
                    <span style={{
                      background: "#f3e8ff",
                      color: "#7c3aed",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "500"
                    }}>
                      {user.subject}
                    </span>
                  </td>
                  <td style={{ 
                    padding: "14px 12px",
                    color: "#4a5568",
                    fontSize: "13px",
                    fontWeight: "500"
                  }}>
                    <div style={{
                      background: "#f7fafc",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0"
                    }}>
                      {user.school}
                    </div>
                  </td>
                  <td style={{ 
                    padding: "14px 12px",
                    color: "#4a5568",
                    fontSize: "12px"
                  }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <a 
                        href={`mailto:${user.email}`}
                        style={{
                          color: "#3182ce",
                          textDecoration: "none",
                          background: "#f7fafc",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          border: "1px solid #e2e8f0",
                          display: "inline-block"
                        }}
                      >
                        📧 {user.email}
                      </a>
                      {user.phoneNumber && (
                        <div style={{
                          background: "#f0f9ff",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          border: "1px solid #bae6fd"
                        }}>
                          📞 {user.phoneNumber}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ 
                    padding: "14px 12px",
                    textAlign: "center"
                  }}>
                    <select
                      onChange={(e) => {
                        if (e.target.value && e.target.value !== user.school) {
                          if (confirm(`${user.name}を${e.target.value}に異動させますか？`)) {
                            transferTeacher(user.id, e.target.value);
                          }
                        }
                        e.target.value = user.school; // Reset selection
                      }}
                      style={{
                        padding: "4px 8px",
                        fontSize: "12px",
                        borderRadius: "4px",
                        border: "1px solid #d1d5db",
                        backgroundColor: "#fff",
                        cursor: "pointer"
                      }}
                      defaultValue={user.school}
                    >
                      <option value={user.school}>🔄 異動</option>
                      {schools
                        .filter(school => school.name !== user.school)
                        .map(school => (
                          <option key={school.id} value={school.name}>
                            → {school.name}
                          </option>
                        ))}
                    </select>
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
            📈 表示中: {filteredUsers.length} 名 / 全体: {users.length} 名の教員
          </div>
          {(selectedSchool || selectedPosition !== "全て" || selectedSubject !== "全て") && (
            <div style={{
              backgroundColor: "#dbeafe",
              color: "#1e40af",
              padding: "4px 12px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: "500"
            }}>
              {selectedSchool && selectedSchool !== "all_schools" && `🏫 ${selectedSchool} `}
              {selectedSchool === "all_schools" && `🌟 管轄内全学校 `}
              {selectedPosition !== "全て" && `👔 ${selectedPosition} `}
              {selectedSubject !== "全て" && `📚 ${selectedSubject} `}
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
              {isEditMode ? "📝 教員情報編集" : "📊 教員情報詳細"}
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
                  👔 役職
                </label>
                {isEditMode ? (
                  <select
                    value={editingUser.position}
                    onChange={(e) => setEditingUser({ ...editingUser, position: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      fontSize: "14px"
                    }}
                  >
                    <option value="教員">教員</option>
                    <option value="主任教諭">主任教諭</option>
                    <option value="教頭">教頭</option>
                    <option value="講師">講師</option>
                  </select>
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
                    {editingUser.position}
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#4a5568" }}>
                  📚 担当科目
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editingUser.subject}
                    onChange={(e) => setEditingUser({ ...editingUser, subject: e.target.value })}
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
                    {editingUser.subject}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#4a5568" }}>
                🏫 所属学校
              </label>
              {isEditMode ? (
                <select
                  value={editingUser.school}
                  onChange={(e) => setEditingUser({ ...editingUser, school: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "14px"
                  }}
                >
                  {schools.map(school => (
                    <option key={school.id} value={school.name}>
                      {school.name} ({school.district})
                    </option>
                  ))}
                </select>
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
                  {editingUser.school}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#4a5568" }}>
                  📧 メールアドレス
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
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#4a5568" }}>
                  📞 電話番号
                </label>
                {isEditMode ? (
                  <input
                    type="tel"
                    value={editingUser.phoneNumber}
                    onChange={(e) => setEditingUser({ ...editingUser, phoneNumber: e.target.value })}
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
                    {editingUser.phoneNumber}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#4a5568" }}>
                📅 入職日
              </label>
              {isEditMode ? (
                <input
                  type="date"
                  value={editingUser.hireDate}
                  onChange={(e) => setEditingUser({ ...editingUser, hireDate: e.target.value })}
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
                  {editingUser.hireDate}
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
    </EducationBoardFrame>
  );
}
