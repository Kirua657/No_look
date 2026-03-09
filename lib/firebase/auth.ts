// Firebase認証関連の型定義
export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
}

// 認証処理

// ユーザー登録
export const registerWithEmail = async (
  email: string, 
  password: string, 
  userData: {
    nickname: string;
    schoolName: string;
    years: string;
    class: string;
  }
): Promise<AuthUser | null> => {
  // 開発用：認証処理をスキップ
  console.log("登録処理:", { email, userData });
  return {
    uid: "user_" + Date.now(),
    email: email,
    displayName: userData.nickname
  };
};

// ログイン処理
export const loginWithEmail = async (email: string, password: string): Promise<AuthUser | null> => {
  console.log("ログイン:", { email });
  
  // モック認証（開発用）
  const user: AuthUser = {
    uid: "user_" + Date.now(),
    email: email,
    displayName: "ログインユーザー"
  };
  
  // ログイン状態をlocalStorageに保存
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('currentUser', JSON.stringify(user));
  localStorage.setItem('loginTimestamp', Date.now().toString());
  
  return user;
};

// ログアウト処理
export const logout = async (): Promise<void> => {
  console.log("ログアウト処理開始");
  
  try {
    // localStorageからログイン情報を削除
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('loginTimestamp');
    localStorage.removeItem('schoolInfo'); // ユーザー情報もクリア
    localStorage.removeItem('chatBackground'); // チャット背景設定もクリア
    localStorage.removeItem('customChatBackground'); // カスタム背景もクリア
    
    console.log("ログアウト完了 - localStorageクリア済み");
  } catch (error) {
    console.error("ログアウト処理でエラー:", error);
  }
};

// 認証状態の変更を監視
export const onAuthChange = (callback: (user: AuthUser | null) => void) => {
  // 開発用：固定ユーザーでログイン状態
  callback({
    uid: "test-user",
    email: "test@school.jp",
    displayName: "テストユーザー"
  });
  
  // 購読解除用の関数
  return () => {};
};

// 現在のユーザー情報を取得
export const getCurrentUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null; // SSR対応
  
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const userData = localStorage.getItem('currentUser');
  
  if (isLoggedIn === 'true' && userData) {
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Failed to parse user data:', error);
      return null;
    }
  }
  
  return null;
};

// ログイン状態をチェック
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false; // SSR対応
  
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const loginTimestamp = localStorage.getItem('loginTimestamp');
  
  if (isLoggedIn === 'true' && loginTimestamp) {
    // オプション: ログイン有効期限をチェック（例: 30日間）
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const loginTime = parseInt(loginTimestamp);
    
    if (now - loginTime < thirtyDaysInMs) {
      return true;
    } else {
      // 有効期限切れの場合、ログアウト
      logout();
      return false;
    }
  }
  
  return false;
};

// エラーメッセージの変換
const getAuthErrorMessage = (errorCode: string): string => {
  return "認証エラーが発生しました";
};
