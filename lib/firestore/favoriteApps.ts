import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface FavoriteApps {
  userId: string
  appIds: string[]
  updatedAt: string
}

const COLLECTION_NAME = 'favoriteApps'

/**
 * ユーザーのお気に入りアプリを取得
 */
export async function getFavoriteApps(userId: string): Promise<string[]> {
  try {
    const docRef = doc(db, COLLECTION_NAME, userId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data() as FavoriteApps
      return data.appIds || []
    }

    // デフォルトのお気に入り（初回）
    return ['staff', 'clients', 'reports']
  } catch (error) {
    console.error('Error fetching favorite apps:', error)
    return ['staff', 'clients', 'reports'] // エラー時もデフォルトを返す
  }
}

/**
 * お気に入りアプリを保存
 */
export async function saveFavoriteApps(
  userId: string,
  appIds: string[]
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, userId)
    const docSnap = await getDoc(docRef)

    const data = {
      userId,
      appIds,
      updatedAt: new Date().toISOString()
    }

    if (docSnap.exists()) {
      // 既存のドキュメントを更新
      await updateDoc(docRef, data)
    } else {
      // 新規ドキュメントを作成
      await setDoc(docRef, data)
    }
  } catch (error) {
    console.error('Error saving favorite apps:', error)
    throw new Error('お気に入りアプリの保存に失敗しました')
  }
}

/**
 * お気に入りアプリを追加
 */
export async function addFavoriteApp(
  userId: string,
  appId: string
): Promise<void> {
  try {
    const currentApps = await getFavoriteApps(userId)

    if (!currentApps.includes(appId)) {
      await saveFavoriteApps(userId, [...currentApps, appId])
    }
  } catch (error) {
    console.error('Error adding favorite app:', error)
    throw new Error('お気に入りアプリの追加に失敗しました')
  }
}

/**
 * お気に入りアプリを削除
 */
export async function removeFavoriteApp(
  userId: string,
  appId: string
): Promise<void> {
  try {
    const currentApps = await getFavoriteApps(userId)
    const newApps = currentApps.filter(id => id !== appId)
    await saveFavoriteApps(userId, newApps)
  } catch (error) {
    console.error('Error removing favorite app:', error)
    throw new Error('お気に入りアプリの削除に失敗しました')
  }
}

/**
 * お気に入りアプリをトグル
 */
export async function toggleFavoriteApp(
  userId: string,
  appId: string
): Promise<void> {
  try {
    const currentApps = await getFavoriteApps(userId)

    if (currentApps.includes(appId)) {
      await removeFavoriteApp(userId, appId)
    } else {
      await addFavoriteApp(userId, appId)
    }
  } catch (error) {
    console.error('Error toggling favorite app:', error)
    throw new Error('お気に入りアプリの切り替えに失敗しました')
  }
}
