/**
 * Firestore 通知管理用ヘルパー関数
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  DocumentSnapshot,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import {
  Notification,
  CreateNotificationData,
  NotificationFilter,
} from "@/types/notification"

/**
 * 通知を作成
 */
export async function createNotification(
  data: CreateNotificationData
): Promise<string> {
  const notificationData: Omit<Notification, "id"> = {
    ...data,
    priority: data.priority || "normal",
    isRead: false,
    createdAt: Timestamp.now(),
  }

  const docRef = await addDoc(collection(db, "notifications"), notificationData)
  return docRef.id
}

/**
 * 通知を取得
 */
export async function getNotification(
  notificationId: string
): Promise<Notification | null> {
  const docRef = doc(db, "notifications", notificationId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Notification
}

/**
 * ユーザーの通知を取得（個人 + 事業所 + 全体）
 */
export async function getUserNotifications(
  userId: string,
  organizationId: string,
  filter?: NotificationFilter,
  limitCount: number = 20,
  lastDoc?: DocumentSnapshot
): Promise<{ notifications: Notification[]; lastVisible: DocumentSnapshot | null }> {
  const notifications: Notification[] = []

  // 個人宛通知
  let personalQuery = query(
    collection(db, "notifications"),
    where("type", "==", "personal"),
    where("targetUserId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  )

  if (filter?.isRead !== undefined) {
    personalQuery = query(personalQuery, where("isRead", "==", filter.isRead))
  }
  if (filter?.category) {
    personalQuery = query(personalQuery, where("category", "==", filter.category))
  }
  if (lastDoc) {
    personalQuery = query(personalQuery, startAfter(lastDoc))
  }

  const personalSnapshot = await getDocs(personalQuery)
  personalSnapshot.forEach((doc) => {
    notifications.push({ id: doc.id, ...doc.data() } as Notification)
  })

  // 事業所宛通知
  let orgQuery = query(
    collection(db, "notifications"),
    where("type", "==", "organization"),
    where("targetOrganizationId", "==", organizationId),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  )

  if (filter?.isRead !== undefined) {
    orgQuery = query(orgQuery, where("isRead", "==", filter.isRead))
  }
  if (filter?.category) {
    orgQuery = query(orgQuery, where("category", "==", filter.category))
  }

  const orgSnapshot = await getDocs(orgQuery)
  orgSnapshot.forEach((doc) => {
    notifications.push({ id: doc.id, ...doc.data() } as Notification)
  })

  // 全体通知
  let globalQuery = query(
    collection(db, "notifications"),
    where("type", "==", "global"),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  )

  if (filter?.isRead !== undefined) {
    globalQuery = query(globalQuery, where("isRead", "==", filter.isRead))
  }
  if (filter?.category) {
    globalQuery = query(globalQuery, where("category", "==", filter.category))
  }

  const globalSnapshot = await getDocs(globalQuery)
  globalSnapshot.forEach((doc) => {
    notifications.push({ id: doc.id, ...doc.data() } as Notification)
  })

  // 作成日時でソート
  notifications.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)

  // limitCount 分だけ返す
  const limitedNotifications = notifications.slice(0, limitCount)
  const lastVisible = limitedNotifications.length > 0
    ? personalSnapshot.docs[personalSnapshot.docs.length - 1] || null
    : null

  return {
    notifications: limitedNotifications,
    lastVisible,
  }
}

/**
 * 未読通知の数を取得
 */
export async function getUnreadCount(
  userId: string,
  organizationId: string
): Promise<number> {
  let count = 0

  // 個人宛未読通知
  const personalQuery = query(
    collection(db, "notifications"),
    where("type", "==", "personal"),
    where("targetUserId", "==", userId),
    where("isRead", "==", false)
  )
  const personalSnapshot = await getDocs(personalQuery)
  count += personalSnapshot.size

  // 事業所宛未読通知
  const orgQuery = query(
    collection(db, "notifications"),
    where("type", "==", "organization"),
    where("targetOrganizationId", "==", organizationId),
    where("isRead", "==", false)
  )
  const orgSnapshot = await getDocs(orgQuery)
  count += orgSnapshot.size

  // 全体未読通知
  const globalQuery = query(
    collection(db, "notifications"),
    where("type", "==", "global"),
    where("isRead", "==", false)
  )
  const globalSnapshot = await getDocs(globalQuery)
  count += globalSnapshot.size

  return count
}

/**
 * 通知を既読にする
 */
export async function markAsRead(notificationId: string): Promise<void> {
  const docRef = doc(db, "notifications", notificationId)
  await updateDoc(docRef, {
    isRead: true,
    readAt: Timestamp.now(),
  })
}

/**
 * 複数の通知を既読にする
 */
export async function markMultipleAsRead(notificationIds: string[]): Promise<void> {
  const promises = notificationIds.map((id) => markAsRead(id))
  await Promise.all(promises)
}

/**
 * 全ての通知を既読にする
 */
export async function markAllAsRead(
  userId: string,
  organizationId: string
): Promise<void> {
  const { notifications } = await getUserNotifications(
    userId,
    organizationId,
    { isRead: false },
    1000
  )

  const unreadIds = notifications.map((n) => n.id)
  await markMultipleAsRead(unreadIds)
}

/**
 * 通知を削除
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  const docRef = doc(db, "notifications", notificationId)
  await deleteDoc(docRef)
}

/**
 * 通知のリアルタイム購読
 */
export function subscribeToNotifications(
  userId: string,
  organizationId: string,
  callback: (notifications: Notification[]) => void
): Unsubscribe {
  // 個人宛通知を購読
  const personalQuery = query(
    collection(db, "notifications"),
    where("type", "==", "personal"),
    where("targetUserId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(50)
  )

  return onSnapshot(personalQuery, (snapshot) => {
    const notifications: Notification[] = []
    snapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() } as Notification)
    })
    callback(notifications)
  })
}

/**
 * 未読数のリアルタイム購読
 */
export function subscribeToUnreadCount(
  userId: string,
  organizationId: string,
  callback: (count: number) => void
): Unsubscribe {
  const personalQuery = query(
    collection(db, "notifications"),
    where("type", "==", "personal"),
    where("targetUserId", "==", userId),
    where("isRead", "==", false)
  )

  return onSnapshot(personalQuery, async (snapshot) => {
    let count = snapshot.size

    // 事業所宛と全体通知の未読数も取得
    const orgQuery = query(
      collection(db, "notifications"),
      where("type", "==", "organization"),
      where("targetOrganizationId", "==", organizationId),
      where("isRead", "==", false)
    )
    const orgSnapshot = await getDocs(orgQuery)
    count += orgSnapshot.size

    const globalQuery = query(
      collection(db, "notifications"),
      where("type", "==", "global"),
      where("isRead", "==", false)
    )
    const globalSnapshot = await getDocs(globalQuery)
    count += globalSnapshot.size

    callback(count)
  })
}
