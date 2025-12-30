import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  readAt?: string
  createdAt: string
  link?: string
}

const COLLECTION_NAME = 'notifications'

/**
 * ユーザーの通知一覧を取得
 */
export async function getUserNotifications(
  userId: string,
  limitCount: number = 10
): Promise<Notification[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Notification))
  } catch (error) {
    console.error('Error fetching notifications:', error)
    throw new Error('通知の取得に失敗しました')
  }
}

/**
 * 通知をリアルタイムで監視
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notifications: Notification[]) => void,
  limitCount: number = 10
): () => void {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Notification))
    callback(notifications)
  }, (error) => {
    console.error('Error subscribing to notifications:', error)
  })
}

/**
 * 通知を既読にする
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const notificationRef = doc(db, COLLECTION_NAME, notificationId)
    await updateDoc(notificationRef, {
      read: true,
      readAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    throw new Error('通知の更新に失敗しました')
  }
}

/**
 * すべての通知を既読にする
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      where('read', '==', false)
    )

    const snapshot = await getDocs(q)
    const updates = snapshot.docs.map(doc =>
      updateDoc(doc.ref, {
        read: true,
        readAt: new Date().toISOString()
      })
    )

    await Promise.all(updates)
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    throw new Error('通知の一括更新に失敗しました')
  }
}

/**
 * 通知を作成（管理者用）
 */
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info',
  link?: string
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
      ...(link && { link })
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating notification:', error)
    throw new Error('通知の作成に失敗しました')
  }
}

/**
 * 通知を削除
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, notificationId))
  } catch (error) {
    console.error('Error deleting notification:', error)
    throw new Error('通知の削除に失敗しました')
  }
}

/**
 * 未読通知数を取得
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      where('read', '==', false)
    )

    const snapshot = await getDocs(q)
    return snapshot.size
  } catch (error) {
    console.error('Error getting unread count:', error)
    return 0
  }
}
