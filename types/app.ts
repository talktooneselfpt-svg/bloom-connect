/**
 * アプリケーション管理の型定義
 */

import { Timestamp } from "firebase/firestore"

/**
 * アプリケーション情報
 */
export interface App {
  id: string // アプリID
  name: string // アプリ名
  slug: string // URLスラッグ（例: "staff-management"）
  description: string // アプリの説明
  icon: string // アイコン名（例: "users", "calendar", "chart"）
  category: AppCategory // カテゴリ
  monthlyPrice: number // 月額料金（円）
  features: string[] // 機能一覧
  isActive: boolean // アプリが有効かどうか
  order: number // 表示順序

  // メタ情報
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * アプリカテゴリ
 */
export type AppCategory = 'management' | 'communication' | 'analysis' | 'other'

/**
 * アプリカテゴリのラベル
 */
export const APP_CATEGORY_LABELS: Record<AppCategory, string> = {
  management: '管理',
  communication: 'コミュニケーション',
  analysis: '分析',
  other: 'その他',
}

/**
 * 組織のアプリサブスクリプション
 */
export interface AppSubscription {
  id: string // サブスクリプションID
  organizationId: string // 事業所ID
  appId: string // アプリID
  status: SubscriptionStatus // サブスクリプション状態
  startedAt: Timestamp // 開始日時
  expiresAt?: Timestamp // 有効期限（nullの場合は無期限）
  canceledAt?: Timestamp // キャンセル日時

  // 支払い情報
  monthlyPrice: number // 月額料金（購入時の料金を保存）
  lastPaymentAt?: Timestamp // 最終支払い日時
  nextPaymentAt?: Timestamp // 次回支払い予定日時

  // メタ情報
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string // 購入者のUID
}

/**
 * サブスクリプション状態
 */
export type SubscriptionStatus = 'active' | 'trial' | 'canceled' | 'expired'

/**
 * サブスクリプション状態のラベル
 */
export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: '有効',
  trial: 'トライアル',
  canceled: 'キャンセル済み',
  expired: '期限切れ',
}

/**
 * サブスクリプション状態の色
 */
export const SUBSCRIPTION_STATUS_COLORS: Record<SubscriptionStatus, { bg: string; text: string }> = {
  active: { bg: 'bg-green-100', text: 'text-green-800' },
  trial: { bg: 'bg-blue-100', text: 'text-blue-800' },
  canceled: { bg: 'bg-gray-100', text: 'text-gray-800' },
  expired: { bg: 'bg-red-100', text: 'text-red-800' },
}

/**
 * アプリ作成用の入力データ
 */
export interface CreateAppInput {
  name: string
  slug: string
  description: string
  icon: string
  category: AppCategory
  monthlyPrice: number
  features: string[]
}

/**
 * アプリ更新用の入力データ
 */
export interface UpdateAppInput {
  name?: string
  slug?: string
  description?: string
  icon?: string
  category?: AppCategory
  monthlyPrice?: number
  features?: string[]
  isActive?: boolean
  order?: number
}

/**
 * 組織に利用可能なアプリ（サブスクリプション情報付き）
 */
export interface AppWithSubscription extends App {
  subscription?: AppSubscription // サブスクリプション情報（購入済みの場合）
  isPurchased: boolean // 購入済みかどうか
}
