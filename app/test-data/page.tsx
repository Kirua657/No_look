'use client';

import { useState } from 'react';
import { addUser, getAllUsers, deleteUser, User } from '../../lib/firebase/firestore';

const TestDataPage = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState('');

  // サンプルテストデータ
  const sampleUsers = [
    {
      nickname: '田中太郎',
      email: 'tanaka@example.com',
      password: 'password123',
      years: '2024',
      class: 'A組',
      created_at: new Date()
    },
    {
      nickname: '鈴木花子',
      email: 'suzuki@example.com',
      password: 'password456',
      years: '2024',
      class: 'B組',
      created_at: new Date()
    },
    {
      nickname: '佐藤次郎',
      email: 'sato@example.com',
      password: 'password789',
      years: '2023',
      class: 'A組',
      created_at: new Date()
    },
    {
      nickname: '高橋美咲',
      email: 'takahashi@example.com',
      password: 'password101',
      years: '2023',
      class: 'C組',
      created_at: new Date()
    },
    {
      nickname: '山田健太',
      email: 'yamada@example.com',
      password: 'password102',
      years: '2024',
      class: 'B組',
      created_at: new Date()
    }
  ];

  // 全データ挿入
  const insertAllSampleData = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      let successCount = 0;
      for (const userData of sampleUsers) {
        await addUser(userData);
        successCount++;
      }
      setMessage(`${successCount}件のテストデータを挿入しました`);
      await loadUsers();
    } catch (error) {
      console.error('データ挿入エラー:', error);
      setMessage('データ挿入中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // ランダムデータ生成
  const generateRandomUser = () => {
    const firstNames = ['太郎', '花子', '次郎', '美咲', '健太', '愛子', '翔太', '由美', '大輔', '真理'];
    const lastNames = ['田中', '鈴木', '佐藤', '高橋', '山田', '渡辺', '伊藤', '中村', '小林', '加藤'];
    const years = ['2021', '2022', '2023', '2024'];
    const classes = ['A組', 'B組', 'C組', 'D組'];
    
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const nickname = lastName + firstName;
    
    return {
      nickname,
      email: `${nickname.toLowerCase()}@example.com`,
      password: `password${Math.floor(Math.random() * 1000)}`,
      years: years[Math.floor(Math.random() * years.length)],
      class: classes[Math.floor(Math.random() * classes.length)],
      created_at: new Date()
    };
  };

  // ランダムデータ挿入
  const insertRandomData = async (count: number) => {
    setLoading(true);
    setMessage('');
    
    try {
      let successCount = 0;
      for (let i = 0; i < count; i++) {
        const randomUser = generateRandomUser();
        await addUser(randomUser);
        successCount++;
      }
      setMessage(`${successCount}件のランダムデータを挿入しました`);
      await loadUsers();
    } catch (error) {
      console.error('ランダムデータ挿入エラー:', error);
      setMessage('ランダムデータ挿入中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // ユーザー一覧取得
  const loadUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
      setMessage(`${allUsers.length}件のユーザーデータを取得しました`);
    } catch (error) {
      console.error('ユーザー取得エラー:', error);
      setMessage('ユーザーデータ取得中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // 全データ削除
  const deleteAllUsers = async () => {
    if (!confirm('本当に全てのユーザーデータを削除しますか？')) {
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    try {
      let deleteCount = 0;
      for (const user of users) {
        if (user.id) {
          await deleteUser(user.id);
          deleteCount++;
        }
      }
      setMessage(`${deleteCount}件のユーザーデータを削除しました`);
      setUsers([]);
    } catch (error) {
      console.error('データ削除エラー:', error);
      setMessage('データ削除中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">テストデータ管理</h1>
        
        {/* 操作ボタン */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">データ操作</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={insertAllSampleData}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
            >
              サンプルデータ挿入
            </button>
            
            <button
              onClick={() => insertRandomData(5)}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded disabled:opacity-50"
            >
              ランダム5件挿入
            </button>
            
            <button
              onClick={loadUsers}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded disabled:opacity-50"
            >
              データ取得
            </button>
            
            <button
              onClick={deleteAllUsers}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded disabled:opacity-50"
            >
              全データ削除
            </button>
          </div>
          
          <div className="mt-4">
            <button
              onClick={() => insertRandomData(10)}
              disabled={loading}
              className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded disabled:opacity-50 mr-2"
            >
              ランダム10件挿入
            </button>
            
            <button
              onClick={() => insertRandomData(20)}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded disabled:opacity-50"
            >
              ランダム20件挿入
            </button>
          </div>
        </div>

        {/* メッセージ表示 */}
        {message && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <p className={`text-center ${message.includes('エラー') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          </div>
        )}

        {/* ローディング表示 */}
        {loading && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <p className="text-center text-blue-600">処理中...</p>
          </div>
        )}

        {/* ユーザー一覧 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            ユーザー一覧 ({users.length}件)
          </h2>
          
          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">ID</th>
                    <th className="border p-2 text-left">ニックネーム</th>
                    <th className="border p-2 text-left">メール</th>
                    <th className="border p-2 text-left">学年</th>
                    <th className="border p-2 text-left">クラス</th>
                    <th className="border p-2 text-left">作成日時</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="border p-2 text-xs">{user.id}</td>
                      <td className="border p-2">{user.nickname}</td>
                      <td className="border p-2">{user.email}</td>
                      <td className="border p-2">{user.years}</td>
                      <td className="border p-2">{user.class}</td>
                      <td className="border p-2 text-sm">
                        {user.created_at?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              ユーザーデータがありません。「データ取得」ボタンを押してデータを読み込むか、テストデータを挿入してください。
            </p>
          )}
        </div>

        {/* サンプルデータ一覧 */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-xl font-semibold mb-4">サンプルデータ一覧</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleUsers.map((user, index) => (
              <div key={index} className="border p-4 rounded-lg bg-gray-50">
                <p><strong>ニックネーム:</strong> {user.nickname}</p>
                <p><strong>メール:</strong> {user.email}</p>
                <p><strong>学年:</strong> {user.years}</p>
                <p><strong>クラス:</strong> {user.class}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDataPage;