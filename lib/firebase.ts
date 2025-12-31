import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app"
import { getFirestore, Firestore } from "firebase/firestore"
import { getAuth, Auth } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Firebaseアプリの初期化（クライアントサイドのみ）
let app: FirebaseApp
let db: Firestore
let auth: Auth

if (typeof window !== 'undefined') {
  // クライアントサイドでのみ初期化
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
  db = getFirestore(app, 'bloomconect')  // bloomconect データベースを使用
  auth = getAuth(app)
} else {
  // サーバーサイド（ビルド時）はダミーオブジェクト
  app = {} as FirebaseApp
  db = {} as Firestore
  auth = {} as Auth
}

// 環境判定
export const getAppEnv = (): 'development' | 'production' => {
  return (process.env.NEXT_PUBLIC_APP_ENV as 'development' | 'production') || 'development'
}

// 環境に応じたコレクション名を取得
export const getCollectionName = (baseName: string): string => {
  const env = getAppEnv()
  return env === 'production' ? baseName : `dev_${baseName}`
}

export { app, db, auth }
