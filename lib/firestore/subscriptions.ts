/**
 * サブスクリプションデータのFirestore操作
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  Subscription,
  PlanType,
  SubscriptionStatus,
  PLAN_DETAILS,
  DEFAULT_TRIAL_DAYS
} from '@/types/subscription'

const SUBSCRIPTIONS_COLLECTION = 'subscriptions'

/**
 * トライアルサブスクリプションを作成
 */
export async function createTrialSubscription(
  organizationId: string,
  createdBy: string,
  trialDays: number = DEFAULT_TRIAL_DAYS
): Promise<string> {
  const subRef = doc(collection(db, SUBSCRIPTIONS_COLLECTION))
  const now = Timestamp.now()
  const trialEndDate = Timestamp.fromDate(
    new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000)
  )

  const planDetails = PLAN_DETAILS.trial

  await setDoc(subRef, {
    organizationId,
    plan: 'trial' as PlanType,
    status: 'trial' as SubscriptionStatus,
    trialDays,
    trialStartDate: now,
    trialEndDate,
    startDate: now,
    monthlyPrice: planDetails.monthlyPrice,
    maxStaff: planDetails.maxStaff,
    maxClients: planDetails.maxClients,
    storageLimit: planDetails.storageLimit,
    features: planDetails.features,
    autoRenewal: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy,
    updatedBy: createdBy
  })

  return subRef.id
}

/**
 * 有料プランのサブスクリプションを作成
 */
export async function createPaidSubscription(
  organizationId: string,
  plan: PlanType,
  createdBy: string,
  autoRenewal: boolean = true
): Promise<string> {
  const subRef = doc(collection(db, SUBSCRIPTIONS_COLLECTION))
  const now = Timestamp.now()
  const nextBillingDate = Timestamp.fromDate(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30日後
  )

  const planDetails = PLAN_DETAILS[plan]

  await setDoc(subRef, {
    organizationId,
    plan,
    status: 'active' as SubscriptionStatus,
    trialDays: 0,
    startDate: now,
    nextBillingDate,
    monthlyPrice: planDetails.monthlyPrice,
    maxStaff: planDetails.maxStaff,
    maxClients: planDetails.maxClients,
    storageLimit: planDetails.storageLimit,
    features: planDetails.features,
    autoRenewal,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy,
    updatedBy: createdBy
  })

  return subRef.id
}

/**
 * サブスクリプション情報を取得
 */
export async function getSubscription(subscriptionId: string): Promise<Subscription | null> {
  const subRef = doc(db, SUBSCRIPTIONS_COLLECTION, subscriptionId)
  const subSnap = await getDoc(subRef)

  if (!subSnap.exists()) {
    return null
  }

  return {
    id: subSnap.id,
    ...subSnap.data()
  } as Subscription
}

/**
 * 組織のサブスクリプションを取得
 */
export async function getOrganizationSubscription(
  organizationId: string
): Promise<Subscription | null> {
  const q = query(
    collection(db, SUBSCRIPTIONS_COLLECTION),
    where('organizationId', '==', organizationId),
    orderBy('createdAt', 'desc')
  )

  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) {
    return null
  }

  const doc = querySnapshot.docs[0]
  return {
    id: doc.id,
    ...doc.data()
  } as Subscription
}

/**
 * すべてのサブスクリプションを取得（開発者用）
 */
export async function getAllSubscriptions(): Promise<Subscription[]> {
  const q = query(
    collection(db, SUBSCRIPTIONS_COLLECTION),
    orderBy('createdAt', 'desc')
  )

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Subscription))
}

/**
 * サブスクリプションを更新
 */
export async function updateSubscription(
  subscriptionId: string,
  updates: Partial<Omit<Subscription, 'id' | 'createdAt' | 'createdBy'>>,
  updatedBy: string
): Promise<void> {
  const subRef = doc(db, SUBSCRIPTIONS_COLLECTION, subscriptionId)

  await updateDoc(subRef, {
    ...updates,
    updatedAt: serverTimestamp(),
    updatedBy
  })
}

/**
 * プランをアップグレード
 */
export async function upgradePlan(
  subscriptionId: string,
  newPlan: PlanType,
  updatedBy: string
): Promise<void> {
  const planDetails = PLAN_DETAILS[newPlan]
  const now = Timestamp.now()
  const nextBillingDate = Timestamp.fromDate(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  )

  await updateSubscription(
    subscriptionId,
    {
      plan: newPlan,
      status: 'active',
      monthlyPrice: planDetails.monthlyPrice,
      maxStaff: planDetails.maxStaff,
      maxClients: planDetails.maxClients,
      storageLimit: planDetails.storageLimit,
      features: planDetails.features,
      nextBillingDate,
      trialEndDate: undefined, // トライアル終了
      autoRenewal: true
    },
    updatedBy
  )
}

/**
 * サブスクリプションをキャンセル
 */
export async function cancelSubscription(
  subscriptionId: string,
  reason: string,
  updatedBy: string
): Promise<void> {
  await updateSubscription(
    subscriptionId,
    {
      status: 'cancelled',
      autoRenewal: false,
      cancelledAt: Timestamp.now(),
      cancellationReason: reason
    },
    updatedBy
  )
}

/**
 * サブスクリプションを停止
 */
export async function suspendSubscription(
  subscriptionId: string,
  updatedBy: string
): Promise<void> {
  await updateSubscription(
    subscriptionId,
    {
      status: 'suspended',
      autoRenewal: false
    },
    updatedBy
  )
}

/**
 * サブスクリプションを再開
 */
export async function resumeSubscription(
  subscriptionId: string,
  updatedBy: string
): Promise<void> {
  const nextBillingDate = Timestamp.fromDate(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  )

  await updateSubscription(
    subscriptionId,
    {
      status: 'active',
      autoRenewal: true,
      nextBillingDate
    },
    updatedBy
  )
}

/**
 * トライアルが有効かチェック
 */
export function isTrialActive(subscription: Subscription): boolean {
  if (subscription.status !== 'trial') {
    return false
  }

  if (!subscription.trialEndDate) {
    return false
  }

  return subscription.trialEndDate.toDate() > new Date()
}

/**
 * トライアル残り日数を計算
 */
export function getTrialDaysRemaining(subscription: Subscription): number {
  if (!subscription.trialEndDate) {
    return 0
  }

  const now = new Date()
  const endDate = subscription.trialEndDate.toDate()
  const diffTime = endDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return Math.max(0, diffDays)
}

/**
 * サブスクリプションが有効かチェック
 */
export function isSubscriptionActive(subscription: Subscription): boolean {
  if (subscription.status === 'trial') {
    return isTrialActive(subscription)
  }

  return subscription.status === 'active'
}

/**
 * 機能が利用可能かチェック
 */
export function hasFeature(
  subscription: Subscription,
  feature: keyof Subscription['features']
): boolean {
  if (!isSubscriptionActive(subscription)) {
    return false
  }

  return subscription.features[feature]
}

/**
 * 制限チェック
 */
export function checkLimits(subscription: Subscription): {
  canAddStaff: boolean
  canAddClient: boolean
  storageAvailable: boolean
} {
  // TODO: 実際の使用状況と比較
  // 現在は制限値のみ返す
  return {
    canAddStaff: isSubscriptionActive(subscription),
    canAddClient: isSubscriptionActive(subscription),
    storageAvailable: isSubscriptionActive(subscription)
  }
}
