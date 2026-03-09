// 将来のFirebase統合用のファイル
// Firebase Firestoreからユーザー情報を取得するためのカスタムフック

import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  grade: string;
  class: string;
  email: string;
  remarks: string;
}

// TODO: Firebase設定後に実装
export const useFirebaseUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Firestore からデータを取得
    // const fetchUsers = async () => {
    //   try {
    //     const usersCollection = collection(db, 'users');
    //     const usersSnapshot = await getDocs(usersCollection);
    //     const usersList = usersSnapshot.docs.map(doc => ({
    //       id: doc.id,
    //       ...doc.data()
    //     })) as User[];
    //     setUsers(usersList);
    //   } catch (err) {
    //     setError('ユーザー情報の取得に失敗しました');
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchUsers();
  }, []);

  return { users, loading, error };
};

// TODO: ユーザー追加機能
export const addUserToFirebase = async (user: Omit<User, 'id'>) => {
  // Firebase Firestoreにユーザーを追加
  // const docRef = await addDoc(collection(db, 'users'), user);
  // return docRef.id;
};

// TODO: ユーザー更新機能
export const updateUserInFirebase = async (id: string, user: Partial<User>) => {
  // Firebase Firestoreのユーザー情報を更新
  // const userRef = doc(db, 'users', id);
  // await updateDoc(userRef, user);
};

// TODO: ユーザー削除機能
export const deleteUserFromFirebase = async (id: string) => {
  // Firebase Firestoreからユーザーを削除
  // await deleteDoc(doc(db, 'users', id));
};