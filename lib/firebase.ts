import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app"
import { getFirestore, Firestore } from "firebase/firestore"
import { getAuth, Auth } from "firebase/auth"

// ビルド時の環境変数チェック
const isConfigured =
  typeof process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'undefined' &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== ''

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'dummy-key-for-build',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'dummy-domain',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dummy-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'dummy-bucket',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'dummy-sender',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'dummy-app-id',
}

// Firebaseアプリの初期化（ビルド時はダミー、ランタイムで実際の値に置き換え）
let app: FirebaseApp
let db: Firestore
let auth: Auth

if (typeof window !== 'undefined' || isConfigured) {
  // クライアントサイドまたは環境変数が設定されている場合
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
  db = getFirestore(app)
  auth = getAuth(app)
} else {
  // ビルド時のダミーオブジェクト（実際には使用されない）
  app = {} as FirebaseApp
  db = {} as Firestore
  auth = {} as Auth
}

export { app, db, auth }
