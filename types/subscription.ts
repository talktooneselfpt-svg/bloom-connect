/**
 * サブスクリプション（契約プラン）の型定義
 */

import { Timestamp } from 'firebase/firestore'

/**
 * プラン種別
 */
export const PLAN_TYPES = [
  'trial',      // トライアル（無料）
  'basic',      // ベーシック
  'standard',   // スタンダード
  'premium',    // プレミアム
] as const

export type PlanType = typeof PLAN_TYPES[number]

/**
 * サブスクリプション状態
 */
export const SUBSCRIPTION_STATUSES = [
  'active',     // 有効
  'trial',      // トライアル中
  'expired',    // 期限切れ
  'cancelled',  // キャンセル済み
  'suspended',  // 停止中
] as const

export type SubscriptionStatus = typeof SUBSCRIPTION_STATUSES[number]

/**
 * サブスクリプションデータ
 */
export interface Subscription {
  /** ドキュメントID */
  id: string
  /** 組織ID */
  organizationId: string
  /** プラン種別 */
  plan: PlanType
  /** サブスクリプション状態 */
  status: SubscriptionStatus
  /** トライアル期間（日数）*/
  trialDays: number
  /** トライアル開始日 */
  trialStartDate?: Timestamp
  /** トライアル終了日 */
  trialEndDate?: Timestamp
  /** サブスクリプション開始日 */
  startDate: Timestamp
  /** サブスクリプション終了日（nullの場合は無期限） */
  endDate?: Timestamp
  /** 次回請求日 */
  nextBillingDate?: Timestamp
  /** 月額料金 */
  monthlyPrice: number
  /** 最大職員数 */
  maxStaff: number
  /** 最大利用者数 */
  maxClients: number
  /** ストレージ容量（GB） */
  storageLimit: number
  /** 機能制限 */
  features: {
    /** レポート機能 */
    reports: boolean
    /** データエクスポート */
    dataExport: boolean
    /** API連携 */
    apiAccess: boolean
    /** カスタムロール */
    customRoles: boolean
    /** 優先サポート */
    prioritySupport: boolean
  }
  /** 自動更新フラグ */
  autoRenewal: boolean
  /** キャンセル日時 */
  cancelledAt?: Timestamp
  /** キャンセル理由 */
  cancellationReason?: string
  /** 作成日時 */
  createdAt: Timestamp
  /** 更新日時 */
  updatedAt: Timestamp
  /** 作成者 */
  createdBy: string
  /** 更新者 */
  updatedBy: string
}

/**
 * プラン別の料金と制限
 */
export const PLAN_DETAILS: Record<PlanType, {
  name: string
  monthlyPrice: number
  maxStaff: number
  maxClients: number
  storageLimit: number
  features: Subscription['features']
}> = {
  trial: {
    name: 'トライアル',
    monthlyPrice: 0,
    maxStaff: 5,
    maxClients: 10,
    storageLimit: 1,
    features: {
      reports: true,
      dataExport: false,
      apiAccess: false,
      customRoles: false,
      prioritySupport: false,
    },
  },
  basic: {
    name: 'ベーシック',
    monthlyPrice: 9800,
    maxStaff: 10,
    maxClients: 50,
    storageLimit: 10,
    features: {
      reports: true,
      dataExport: true,
      apiAccess: false,
      customRoles: false,
      prioritySupport: false,
    },
  },
  standard: {
    name: 'スタンダード',
    monthlyPrice: 19800,
    maxStaff: 30,
    maxClients: 200,
    storageLimit: 50,
    features: {
      reports: true,
      dataExport: true,
      apiAccess: true,
      customRoles: false,
      prioritySupport: false,
    },
  },
  premium: {
    name: 'プレミアム',
    monthlyPrice: 39800,
    maxStaff: 9999,
    maxClients: 9999,
    storageLimit: 500,
    features: {
      reports: true,
      dataExport: true,
      apiAccess: true,
      customRoles: true,
      prioritySupport: true,
    },
  },
}

/**
 * デフォルトのトライアル期間（日数）
 */
export const DEFAULT_TRIAL_DAYS = 30
