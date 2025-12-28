/**
 * アプリケーション管理のFirestore操作
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type {
  App,
  AppSubscription,
  AppWithSubscription,
  CreateAppInput,
  UpdateAppInput,
} from '@/types/app'

const APPS_COLLECTION = 'apps'
const SUBSCRIPTIONS_COLLECTION = 'appSubscriptions'

/**
 * すべてのアプリを取得（有効なもののみ）
 */
export async function getAllApps(): Promise<App[]> {
  const q = query(
    collection(db, APPS_COLLECTION),
    where('isActive', '==', true),
    orderBy('order', 'asc'),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as App[]
}

/**
 * アプリIDでアプリを取得
 */
export async function getAppById(appId: string): Promise<App | null> {
  const docRef = doc(db, APPS_COLLECTION, appId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as App
}

/**
 * 組織のサブスクリプション一覧を取得
 */
export async function getOrganizationSubscriptions(
  organizationId: string
): Promise<AppSubscription[]> {
  const q = query(
    collection(db, SUBSCRIPTIONS_COLLECTION),
    where('organizationId', '==', organizationId),
    where('status', '==', 'active')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as AppSubscription[]
}

/**
 * 組織が利用可能なアプリ一覧を取得（サブスクリプション情報付き）
 */
export async function getAppsWithSubscription(
  organizationId: string
): Promise<AppWithSubscription[]> {
  const [apps, subscriptions] = await Promise.all([
    getAllApps(),
    getOrganizationSubscriptions(organizationId),
  ])

  const subscriptionMap = new Map(
    subscriptions.map((sub) => [sub.appId, sub])
  )

  return apps.map((app) => {
    const subscription = subscriptionMap.get(app.id)
    return {
      ...app,
      subscription,
      isPurchased: !!subscription,
    }
  })
}

/**
 * アプリを購入（サブスクリプションを作成）
 */
export async function purchaseApp(
  organizationId: string,
  appId: string,
  userId: string,
  isTrial: boolean = false
): Promise<string> {
  const app = await getAppById(appId)
  if (!app) {
    throw new Error('アプリが見つかりません')
  }

  const now = Timestamp.now()
  const trialDays = 14 // トライアル期間（14日間）

  const subscriptionData: Omit<AppSubscription, 'id'> = {
    organizationId,
    appId,
    status: isTrial ? 'trial' : 'active',
    startedAt: now,
    expiresAt: isTrial
      ? Timestamp.fromMillis(now.toMillis() + trialDays * 24 * 60 * 60 * 1000)
      : undefined,
    monthlyPrice: app.monthlyPrice,
    nextPaymentAt: isTrial
      ? Timestamp.fromMillis(now.toMillis() + trialDays * 24 * 60 * 60 * 1000)
      : Timestamp.fromMillis(now.toMillis() + 30 * 24 * 60 * 60 * 1000), // 30日後
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
  }

  const docRef = await addDoc(
    collection(db, SUBSCRIPTIONS_COLLECTION),
    subscriptionData
  )
  return docRef.id
}

/**
 * サブスクリプションをキャンセル
 */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  const docRef = doc(db, SUBSCRIPTIONS_COLLECTION, subscriptionId)
  await updateDoc(docRef, {
    status: 'canceled',
    canceledAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

/**
 * アプリを作成（管理者用）
 */
export async function createApp(input: CreateAppInput): Promise<string> {
  const appData: Omit<App, 'id'> = {
    ...input,
    isActive: true,
    order: 999, // デフォルトは最後
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  }

  const docRef = await addDoc(collection(db, APPS_COLLECTION), appData)
  return docRef.id
}

/**
 * アプリを更新（管理者用）
 */
export async function updateApp(
  appId: string,
  input: UpdateAppInput
): Promise<void> {
  const docRef = doc(db, APPS_COLLECTION, appId)
  await updateDoc(docRef, {
    ...input,
    updatedAt: serverTimestamp(),
  })
}

/**
 * 特定のアプリのサブスクリプションを取得
 */
export async function getSubscriptionByAppId(
  organizationId: string,
  appId: string
): Promise<AppSubscription | null> {
  const q = query(
    collection(db, SUBSCRIPTIONS_COLLECTION),
    where('organizationId', '==', organizationId),
    where('appId', '==', appId),
    where('status', '==', 'active')
  )

  const snapshot = await getDocs(q)
  if (snapshot.empty) {
    return null
  }

  const doc = snapshot.docs[0]
  return {
    id: doc.id,
    ...doc.data(),
  } as AppSubscription
}
