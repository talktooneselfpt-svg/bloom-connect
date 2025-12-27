/**
 * 通知のFirestore操作
 */

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type {
  Notification,
  CreateNotificationInput,
  NotificationSettings,
} from '@/types/notification'

const NOTIFICATIONS_COLLECTION = 'notifications'
const NOTIFICATION_SETTINGS_COLLECTION = 'notificationSettings'

/**
 * 通知を作成
 */
export async function createNotification(
  input: CreateNotificationInput,
  createdBy: string
): Promise<string> {
  try {
    const notification: Omit<Notification, 'id'> = {
      type: input.type,
      category: input.category,
      priority: input.priority || 'normal',
      title: input.title,
      message: input.message,
      link: input.link,
      linkText: input.linkText,
      organizationId: input.organizationId,
      senderId: createdBy,
      senderName: input.senderName || '',
      targetUserIds: input.targetUserIds,
      targetRoles: input.targetRoles,
      isRead: false,
      isArchived: false,
      isPinned: false,
      expiresAt: input.expiresAt,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }

    const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), notification)
    return docRef.id
  } catch (error) {
    console.error('通知の作成に失敗しました:', error)
    throw error
  }
}

/**
 * ユーザーの通知を取得
 */
export async function getUserNotifications(
  userId: string,
  organizationId?: string,
  options?: {
    includeArchived?: boolean
    type?: 'organization' | 'system'
    maxResults?: number
  }
): Promise<Notification[]> {
  try {
    const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')]

    // ターゲットユーザーまたは全体通知
    // Note: Firestoreの制限により、array-containsとwhereの組み合わせには制限があります
    // 実際の実装ではクライアント側でフィルタリングする必要があるかもしれません

    if (options?.type) {
      constraints.push(where('type', '==', options.type))
    }

    if (!options?.includeArchived) {
      constraints.push(where('isArchived', '==', false))
    }

    if (options?.maxResults) {
      constraints.push(limit(options.maxResults))
    }

    const q = query(collection(db, NOTIFICATIONS_COLLECTION), ...constraints)
    const querySnapshot = await getDocs(q)

    let notifications: Notification[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Notification[]

    // クライアント側でフィルタリング
    notifications = notifications.filter((notif) => {
      // ユーザーがターゲットに含まれているか、または全体通知か
      const isTargeted =
        !notif.targetUserIds || notif.targetUserIds.length === 0 || notif.targetUserIds.includes(userId)

      // 組織IDでフィルタリング
      const matchesOrg = !organizationId || notif.organizationId === organizationId

      // 有効期限チェック
      const notExpired = !notif.expiresAt || notif.expiresAt.toMillis() > Date.now()

      return isTargeted && matchesOrg && notExpired
    })

    return notifications
  } catch (error) {
    console.error('通知の取得に失敗しました:', error)
    throw error
  }
}

/**
 * 通知を既読にする
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const notifRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId)
    await updateDoc(notifRef, {
      isRead: true,
      readAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('通知の既読化に失敗しました:', error)
    throw error
  }
}

/**
 * 複数の通知を既読にする
 */
export async function markMultipleNotificationsAsRead(notificationIds: string[]): Promise<void> {
  try {
    const promises = notificationIds.map((id) => markNotificationAsRead(id))
    await Promise.all(promises)
  } catch (error) {
    console.error('通知の一括既読化に失敗しました:', error)
    throw error
  }
}

/**
 * 通知をアーカイブする
 */
export async function archiveNotification(notificationId: string): Promise<void> {
  try {
    const notifRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId)
    await updateDoc(notifRef, {
      isArchived: true,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('通知のアーカイブに失敗しました:', error)
    throw error
  }
}

/**
 * 通知をピン留めする/解除する
 */
export async function toggleNotificationPin(notificationId: string, isPinned: boolean): Promise<void> {
  try {
    const notifRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId)
    await updateDoc(notifRef, {
      isPinned,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('通知のピン留め切り替えに失敗しました:', error)
    throw error
  }
}

/**
 * 通知を削除
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  try {
    const notifRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId)
    await deleteDoc(notifRef)
  } catch (error) {
    console.error('通知の削除に失敗しました:', error)
    throw error
  }
}

/**
 * 未読通知数を取得
 */
export async function getUnreadNotificationCount(
  userId: string,
  organizationId?: string
): Promise<number> {
  try {
    const notifications = await getUserNotifications(userId, organizationId, {
      includeArchived: false,
    })
    return notifications.filter((n) => !n.isRead).length
  } catch (error) {
    console.error('未読通知数の取得に失敗しました:', error)
    return 0
  }
}

/**
 * 通知設定を取得
 */
export async function getNotificationSettings(userId: string): Promise<NotificationSettings | null> {
  try {
    const settingsRef = doc(db, NOTIFICATION_SETTINGS_COLLECTION, userId)
    const settingsDoc = await getDoc(settingsRef)

    if (!settingsDoc.exists()) {
      return null
    }

    return {
      id: settingsDoc.id,
      ...settingsDoc.data(),
    } as NotificationSettings
  } catch (error) {
    console.error('通知設定の取得に失敗しました:', error)
    throw error
  }
}

/**
 * 通知設定を更新
 */
export async function updateNotificationSettings(
  userId: string,
  settings: Partial<Omit<NotificationSettings, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  try {
    const settingsRef = doc(db, NOTIFICATION_SETTINGS_COLLECTION, userId)
    const settingsDoc = await getDoc(settingsRef)

    if (settingsDoc.exists()) {
      // 既存の設定を更新
      await updateDoc(settingsRef, {
        ...settings,
        updatedAt: Timestamp.now(),
      })
    } else {
      // 新規作成
      const newSettings: Omit<NotificationSettings, 'id'> = {
        userId,
        enableOrganizationNotifications: settings.enableOrganizationNotifications ?? true,
        enableSystemNotifications: settings.enableSystemNotifications ?? true,
        enableAnnouncements: settings.enableAnnouncements ?? true,
        enableUpdates: settings.enableUpdates ?? true,
        enableMaintenance: settings.enableMaintenance ?? true,
        enableAlerts: settings.enableAlerts ?? true,
        enableInfo: settings.enableInfo ?? true,
        enableReminders: settings.enableReminders ?? true,
        enablePushNotifications: settings.enablePushNotifications ?? false,
        enableEmailNotifications: settings.enableEmailNotifications ?? false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }
      await addDoc(collection(db, NOTIFICATION_SETTINGS_COLLECTION), newSettings)
    }
  } catch (error) {
    console.error('通知設定の更新に失敗しました:', error)
    throw error
  }
}
