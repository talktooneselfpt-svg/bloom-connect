/**
 * ユーザー設定のFirestore操作
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

/**
 * ユーザー設定
 */
export interface UserSettings {
  /** ユーザーID */
  userId: string
  /** テーマ設定 */
  theme: 'light' | 'dark' | 'system'
  /** 言語設定 */
  language: 'ja' | 'en'
  /** 通知設定 */
  notifications: {
    /** ブラウザ通知 */
    browser: boolean
    /** メール通知 */
    email: boolean
    /** 新規職員追加 */
    newStaff: boolean
    /** 新規利用者追加 */
    newClient: boolean
    /** システムアップデート */
    systemUpdates: boolean
  }
  /** 表示設定 */
  display: {
    /** ダッシュボードウィジェット */
    dashboardWidgets: string[]
    /** テーブル表示件数 */
    itemsPerPage: number
    /** サイドバー折りたたみ */
    sidebarCollapsed: boolean
  }
  /** 作成日時 */
  createdAt: Timestamp
  /** 更新日時 */
  updatedAt: Timestamp
}

const SETTINGS_COLLECTION = 'userSettings'

/**
 * デフォルト設定
 */
export const DEFAULT_USER_SETTINGS: Omit<UserSettings, 'userId' | 'createdAt' | 'updatedAt'> = {
  theme: 'system',
  language: 'ja',
  notifications: {
    browser: true,
    email: true,
    newStaff: true,
    newClient: true,
    systemUpdates: true,
  },
  display: {
    dashboardWidgets: ['stats', 'recentActivity', 'quickActions'],
    itemsPerPage: 20,
    sidebarCollapsed: false,
  },
}

/**
 * ユーザー設定を作成（初回セットアップ用）
 */
export async function createUserSettings(userId: string): Promise<void> {
  const settingsRef = doc(db, SETTINGS_COLLECTION, userId)

  await setDoc(settingsRef, {
    userId,
    ...DEFAULT_USER_SETTINGS,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

/**
 * ユーザー設定を取得
 */
export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const settingsRef = doc(db, SETTINGS_COLLECTION, userId)
  const settingsSnap = await getDoc(settingsRef)

  if (!settingsSnap.exists()) {
    return null
  }

  return settingsSnap.data() as UserSettings
}

/**
 * ユーザー設定を更新
 */
export async function updateUserSettings(
  userId: string,
  updates: Partial<Omit<UserSettings, 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const settingsRef = doc(db, SETTINGS_COLLECTION, userId)

  await updateDoc(settingsRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

/**
 * テーマを更新
 */
export async function updateTheme(
  userId: string,
  theme: 'light' | 'dark' | 'system'
): Promise<void> {
  await updateUserSettings(userId, { theme })
}

/**
 * 通知設定を更新
 */
export async function updateNotificationSettings(
  userId: string,
  notifications: Partial<UserSettings['notifications']>
): Promise<void> {
  const currentSettings = await getUserSettings(userId)

  if (!currentSettings) {
    throw new Error('User settings not found')
  }

  await updateUserSettings(userId, {
    notifications: {
      ...currentSettings.notifications,
      ...notifications,
    },
  })
}

/**
 * 表示設定を更新
 */
export async function updateDisplaySettings(
  userId: string,
  display: Partial<UserSettings['display']>
): Promise<void> {
  const currentSettings = await getUserSettings(userId)

  if (!currentSettings) {
    throw new Error('User settings not found')
  }

  await updateUserSettings(userId, {
    display: {
      ...currentSettings.display,
      ...display,
    },
  })
}
