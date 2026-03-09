// Firebase設定ファイル
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// Firebase機能の有効/無効化フラグ
const FIREBASE_ENABLED = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_FIREBASE_ENABLED === 'true';

// Firebase Console から取得した設定情報
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "dummy-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dummy.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dummy-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dummy.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:dummy",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-DUMMY"
};

// Firebase アプリとサービスの初期化
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

// クライアントサイドでのみ初期化
if (FIREBASE_ENABLED) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.warn('🔴 Firebase initialization failed:', error);
    console.warn('🔴 Continuing without Firebase functionality');
  }
} else {
  if (typeof window !== 'undefined') {
    console.warn('🔴 Firebase is disabled');
  } else {
    console.warn('🔴 Firebase initialization skipped (server side)');
  }
}

export { db, auth };
export default app;