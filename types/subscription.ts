/**
 * サブスクリプション管理の型定義
 * 組織の契約状態、料金計算、デバイス管理を統合
 */

import { Timestamp } from "firebase/firestore"
import { PlanType } from "./plan"

/**
 * サブスクリプションステータス
 */
export type SubscriptionStatus =
  | 'active' // 有効
  | 'trial' // トライアル期間
  | 'suspended' // 一時停止
  | 'cancelled' // キャンセル済み
  | 'expired' // 期限切れ

/**
 * 支払いステータス
 */
export type PaymentStatus =
  | 'pending' // 支払い待ち
  | 'paid' // 支払い済み
  | 'failed' // 支払い失敗
  | 'refunded' // 返金済み

/**
 * 支払い方法
 */
export type PaymentMethod =
  | 'credit_card' // クレジットカード
  | 'bank_transfer' // 銀行振込
  | 'invoice' // 請求書払い

/**
 * 組織のサブスクリプション情報
 */
export interface Subscription {
  id: string
  organizationId: string

  // プラン情報
  currentPlan: PlanType
  previousPlan?: PlanType

  // ステータス
  status: SubscriptionStatus

  // 期間情報
  startDate: Timestamp // 契約開始日
  currentPeriodStart: Timestamp // 現在の請求期間開始日
  currentPeriodEnd: Timestamp // 現在の請求期間終了日
  trialEndDate?: Timestamp // トライアル終了日
  cancelledAt?: Timestamp // キャンセル日時

  // デバイス情報
  deviceCount: number // 契約デバイス数
  maxDevices: number // 最大デバイス数（プランによる制限）

  // 職員数情報（参考値）
  totalStaffCount: number // 総職員数
  activeStaffCount: number // アクティブ職員数

  // 利用中のプロダクト
  activeProductIds: string[] // 有効なプロダクトIDのリスト
  aiEnabledProductIds: string[] // AI機能を有効にしているプロダクトIDのリスト

  // 料金情報（計算結果のキャッシュ）
  currentMonthlyFee: number // 当月の月額料金（円）
  nextMonthlyFee: number // 次月の予定月額料金（円）

  // 支払い情報
  paymentMethod?: PaymentMethod
  paymentDayOfMonth: number // 支払日（毎月の何日か、デフォルト1日）
  lastPaymentDate?: Timestamp // 最終支払日
  nextPaymentDate: Timestamp // 次回支払日

  // 割引・クーポン
  appliedCouponId?: string // 適用中のクーポンID
  discountRate: number // 割引率（0-100）
  discountAmount: number // 割引額（円）

  // メタ情報
  notes?: string // 備考
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
  updatedBy: string
}

/**
 * 請求履歴
 */
export interface Invoice {
  id: string
  organizationId: string
  subscriptionId: string

  // 請求期間
  billingPeriodStart: Timestamp
  billingPeriodEnd: Timestamp

  // プラン・プロダクト情報
  plan: PlanType
  deviceCount: number
  products: {
    productId: string
    productName: string
    price: number
    aiEnabled: boolean
    aiPrice: number
  }[]

  // 料金明細
  breakdown: {
    deviceFee: number // デバイス使用料
    productFees: number // プロダクト料金合計
    aiFees: number // AI使用料合計
    subtotal: number // 小計
    discount: number // 割引額
    tax: number // 消費税
    total: number // 合計
  }

  // 支払い情報
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod
  paymentDueDate: Timestamp // 支払期限
  paidAt?: Timestamp // 支払日時

  // 領収書・請求書
  invoiceUrl?: string // 請求書PDF URL
  receiptUrl?: string // 領収書PDF URL

  // メタ情報
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * 料金計算の結果
 */
export interface PricingCalculation {
  // 基本料金
  deviceFee: number // デバイス使用料（デバイス数 × 1000円）

  // プロダクト料金
  productDetails: {
    productId: string
    productName: string
    basePrice: number // 基本料金
    aiEnabled: boolean
    aiPrice: number // AI追加料金
    subtotal: number // 小計
  }[]
  productFeesTotal: number // プロダクト料金合計

  // AI料金
  aiFeesTotal: number // AI使用料合計

  // 合計
  subtotal: number // 小計（税抜）
  discount: number // 割引額
  taxRate: number // 税率（例: 0.10）
  tax: number // 消費税
  total: number // 合計（税込）

  // その他情報
  representativeFree: boolean // 代表者無料適用
  freeStaffCount: number // 無料職員数（通常1名）
}

/**
 * クーポン・割引情報
 */
export interface Coupon {
  id: string
  code: string // クーポンコード
  name: string // クーポン名
  description: string // 説明

  // 割引設定
  discountType: 'percentage' | 'fixed' // パーセント or 固定額
  discountValue: number // 割引値（パーセントの場合0-100、固定額の場合円）

  // 適用条件
  applicablePlans: PlanType[] // 適用可能なプラン
  minimumAmount?: number // 最低金額

  // 有効期間
  validFrom: Timestamp
  validUntil: Timestamp

  // 利用制限
  maxUses: number // 最大利用回数
  currentUses: number // 現在の利用回数
  maxUsesPerOrganization: number // 1組織あたりの最大利用回数

  // ステータス
  isActive: boolean

  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * デバイス割り当て情報
 */
export interface DeviceAssignment {
  organizationId: string
  deviceId: string
  deviceName: string
  assignedStaffIds: string[] // 割り当てられた職員UID（最大3人）
  staffCount: number // 現在の職員数
  maxStaff: number // 最大職員数（3人）
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * サブスクリプション変更リクエスト
 * 「私のページ」から変更する際に使用
 */
export interface SubscriptionChangeRequest {
  id: string
  organizationId: string
  requestedBy: string // リクエストした職員のUID

  // 変更内容
  changeType: 'plan_upgrade' | 'plan_downgrade' | 'add_product' | 'remove_product' | 'add_device' | 'remove_device'

  // 変更前
  currentPlan?: PlanType
  currentProductIds?: string[]
  currentDeviceCount?: number

  // 変更後
  newPlan?: PlanType
  newProductIds?: string[]
  newDeviceCount?: number

  // 料金変更
  currentMonthlyFee: number
  newMonthlyFee: number
  feeDifference: number

  // ステータス
  status: 'pending' | 'approved' | 'rejected' | 'applied'

  // 承認情報（必要に応じて）
  approvedBy?: string
  approvedAt?: Timestamp
  rejectedReason?: string

  // 適用予定日
  effectiveDate: Timestamp

  createdAt: Timestamp
  updatedAt: Timestamp
}
