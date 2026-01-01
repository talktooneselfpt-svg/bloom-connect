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

/**
 * 環境に応じたコレクション名を取得する
 * @param baseName ベースとなるコレクション名 (例: 'staff', 'clients')
 * @returns 環境に応じたコレクション名 (開発環境では 'dev_' プレフィックスが付く)
 *
 * 例:
 * - 開発環境: getCollectionName('staff') → 'dev_staff'
 * - 本番環境: getCollectionName('staff') → 'staff'
 */
export function getCollectionName(baseName: string): string {
  const env = process.env.NEXT_PUBLIC_APP_ENV || 'production'

  // 開発環境の場合は 'dev_' プレフィックスを追加
  if (env === 'development') {
    return `dev_${baseName}`
  }

  // 本番環境の場合はそのまま
  return baseName
}

/**
 * 現在の環境を判定する
 * @returns 'development' | 'production'
 */
export function getEnvironment(): 'development' | 'production' {
  return (process.env.NEXT_PUBLIC_APP_ENV as 'development' | 'production') || 'production'
}

/**
 * 開発環境かどうかを判定する
 * @returns 開発環境の場合は true
 */
export function isDevelopment(): boolean {
  return getEnvironment() === 'development'
}

export { app, db, auth }
