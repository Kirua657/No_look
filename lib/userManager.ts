// ユーザー管理用のユーティリティ関数

export interface User {
  id: string;
  email: string;
  name: string;
  school: string;
  grade?: string;
  className?: string;
  role: "student" | "teacher";
  password: string;
  createdAt: string;
}

export interface UsersData {
  users: User[];
}

// ユーザー登録
export const registerUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<boolean> => {
  try {
    // 既存のユーザーデータを取得
    let data: UsersData;
    
    // まずLocalStorageから確認
    const storedData = localStorage.getItem('usersData');
    if (storedData) {
      data = JSON.parse(storedData);
    } else {
      // LocalStorageにない場合はusers.jsonから読み込み
      try {
        const response = await fetch('/users.json');
        data = await response.json();
      } catch {
        // users.jsonがない場合は空のデータで開始
        data = { users: [] };
      }
    }
    
    // メールアドレスの重複チェック
    const existingUser = data.users.find(user => user.email === userData.email);
    if (existingUser) {
      throw new Error('このメールアドレスは既に登録されています');
    }
    
    // 新しいユーザーを作成
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    // ユーザーリストに追加
    data.users.push(newUser);
    
    // LocalStorageにユーザーデータを保存
    localStorage.setItem('usersData', JSON.stringify(data));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    return true;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// ユーザーログイン
export const loginUser = async (email: string, password: string): Promise<User | null> => {
  try {
    let data: UsersData;
    
    // LocalStorageからユーザーデータを取得
    const storedData = localStorage.getItem('usersData');
    if (storedData) {
      data = JSON.parse(storedData);
    } else {
      // LocalStorageにない場合はusers.jsonから読み込み
      try {
        const response = await fetch('/users.json');
        data = await response.json();
        // LocalStorageに保存
        localStorage.setItem('usersData', JSON.stringify(data));
      } catch {
        // users.jsonがない場合は空のデータ
        data = { users: [] };
      }
    }
    
    // メールアドレスとパスワードでユーザーを検索
    let user = data.users.find(u => u.email === email && u.password === password);
    
    // 見つからない場合は、既存のuserInfo.jsonも確認（後方互換性）
    if (!user) {
      try {
        const legacyResponse = await fetch('/userInfo.json');
        const legacyUser = await legacyResponse.json();
        
        if (legacyUser.email === email && legacyUser.password === password) {
          // 既存データを新しい形式に変換
          user = {
            id: legacyUser.userId || Date.now().toString(),
            email: legacyUser.email,
            name: legacyUser.name,
            school: legacyUser.school,
            role: 'student', // デフォルトで生徒とする
            password: legacyUser.password,
            createdAt: new Date().toISOString()
          };
        }
      } catch (error) {
        console.log('Legacy user file not found or invalid');
      }
    }
    
    if (user) {
      // ログイン成功時は現在のユーザー情報を保存
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    }
    
    return null;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};

// 現在のユーザー情報を取得
export const getCurrentUser = (): User | null => {
  try {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser) : null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

// ユーザー情報を更新
export const updateUserInfo = (updatedUser: User): boolean => {
  try {
    // 現在のユーザー情報を更新
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // ユーザーデータ全体も更新
    const storedData = localStorage.getItem('usersData');
    if (storedData) {
      const data: UsersData = JSON.parse(storedData);
      const userIndex = data.users.findIndex(u => u.id === updatedUser.id);
      if (userIndex !== -1) {
        data.users[userIndex] = updatedUser;
        localStorage.setItem('usersData', JSON.stringify(data));
      }
    }
    
    return true;
  } catch (error) {
    console.error('Update user error:', error);
    return false;
  }
};

// ログアウト
export const logoutUser = (): void => {
  localStorage.removeItem('currentUser');
};