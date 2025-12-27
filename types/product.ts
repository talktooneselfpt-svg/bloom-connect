/**
 * プロダクト（機能）の型定義
 * 今後のプロダクト追加に対応できる柔軟な設計
 */

import { Timestamp } from "firebase/firestore"

/**
 * プロダクトカテゴリー
 */
export type ProductCategory =
  | 'staff_management' // 職員管理
  | 'schedule' // スケジュール・シフト
  | 'record' // 記録・報告
  | 'safety' // 安全管理
  | 'quality' // 品質管理
  | 'communication' // コミュニケーション
  | 'analytics' // 分析・レポート
  | 'other' // その他

/**
 * プロダクトタイプ（AI使用有無）
 */
export type ProductType = 'standard' | 'ai'

/**
 * プロダクトステータス
 */
export type ProductStatus =
  | 'coming_soon' // 開発中（近日公開）
  | 'beta' // ベータ版
  | 'active' // 提供中
  | 'deprecated' // 非推奨

/**
 * プロダクト定義
 */
export interface Product {
  id: string // プロダクトID（例: 'hiyari_hatto', 'shift_management'）
  name: string // プロダクト名
  displayName: string // 表示名
  description: string // 説明
  category: ProductCategory // カテゴリー
  type: ProductType // タイプ（standard or ai）
  status: ProductStatus // ステータス

  // 料金情報
  pricing: {
    standard: number // スタンダードプランでの価格（月額）
    ai?: number // AIプラン使用時の追加料金（月額、AI機能がある場合のみ）
  }

  // 機能情報
  features: string[] // 機能一覧
  requiredPlan: 'free' | 'standard' | 'ai' // 必要最低プラン

  // AI機能情報（AI対応プロダクトの場合）
  aiFeatures?: {
    description: string // AI機能の説明
    apiUsage: string // 使用するAPI（例: 'OpenAI GPT-4', 'Claude'）
    estimatedCost: string // 推定コスト説明
  }

  // メタ情報
  icon?: string // アイコンURL
  thumbnailUrl?: string // サムネイル画像URL
  documentationUrl?: string // ドキュメントURL
  demoVideoUrl?: string // デモ動画URL

  // システム情報
  isActive: boolean // 提供中かどうか
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * 現在提供中のプロダクト例（将来的に増やせる）
 */
export const PRODUCT_IDS = {
  // 安全管理
  HIYARI_HATTO: 'hiyari_hatto', // ヒヤリハット報告
  ACCIDENT_REPORT: 'accident_report', // 事故報告

  // スケジュール
  SHIFT_MANAGEMENT: 'shift_management', // シフト管理
  SCHEDULE_COORDINATION: 'schedule_coordination', // スケジュール調整

  // 記録
  DAILY_REPORT: 'daily_report', // 日報
  CARE_RECORD: 'care_record', // ケア記録
  NURSING_RECORD: 'nursing_record', // 看護記録

  // 職員管理
  STAFF_TRAINING: 'staff_training', // 研修管理
  ATTENDANCE: 'attendance', // 勤怠管理

  // 品質管理
  QUALITY_CHECK: 'quality_check', // 品質チェック
  CUSTOMER_SURVEY: 'customer_survey', // 利用者アンケート

  // コミュニケーション
  TEAM_CHAT: 'team_chat', // チームチャット
  NOTICE_BOARD: 'notice_board', // お知らせ掲示板

  // 分析（主にAI機能）
  AI_ANALYTICS: 'ai_analytics', // AI分析レポート
  RISK_PREDICTION: 'risk_prediction', // リスク予測
} as const

/**
 * プロダクトサンプル定義（初期設定例）
 * 実際はFirestoreに保存して管理
 */
export const SAMPLE_PRODUCTS: Partial<Record<string, Omit<Product, 'createdAt' | 'updatedAt'>>> = {
  [PRODUCT_IDS.HIYARI_HATTO]: {
    id: PRODUCT_IDS.HIYARI_HATTO,
    name: 'hiyari_hatto',
    displayName: 'ヒヤリハット報告',
    description: 'ヒヤリハット事例を簡単に記録・共有できます',
    category: 'safety',
    type: 'standard',
    status: 'active',
    pricing: {
      standard: 1000, // 月額1000円
    },
    features: [
      'スマホから簡単報告',
      '写真添付機能',
      '再発防止策の記録',
      'チーム内共有',
    ],
    requiredPlan: 'standard',
    isActive: true,
  },
  [PRODUCT_IDS.SHIFT_MANAGEMENT]: {
    id: PRODUCT_IDS.SHIFT_MANAGEMENT,
    name: 'shift_management',
    displayName: 'シフト管理',
    description: 'スタッフのシフトを効率的に管理',
    category: 'schedule',
    type: 'ai',
    status: 'active',
    pricing: {
      standard: 5000, // 月額5000円
      ai: 2000, // AI機能使用時は追加2000円
    },
    features: [
      'シフト自動作成',
      '希望シフト収集',
      '公平性チェック',
      '勤務時間集計',
    ],
    requiredPlan: 'standard',
    aiFeatures: {
      description: 'AIが過去のデータから最適なシフトを自動生成',
      apiUsage: 'Claude AI',
      estimatedCost: '月額約2000円（シフト作成回数による）',
    },
    isActive: true,
  },
  [PRODUCT_IDS.AI_ANALYTICS]: {
    id: PRODUCT_IDS.AI_ANALYTICS,
    name: 'ai_analytics',
    displayName: 'AI分析レポート',
    description: 'AIが事業所のデータを分析してレポートを生成',
    category: 'analytics',
    type: 'ai',
    status: 'beta',
    pricing: {
      standard: 0, // AI専用機能のためスタンダードプランでは利用不可
      ai: 3000,
    },
    features: [
      'データ自動分析',
      'トレンド検出',
      '改善提案',
      'カスタムレポート',
    ],
    requiredPlan: 'ai',
    aiFeatures: {
      description: 'AIが蓄積データを分析し、業務改善のインサイトを提供',
      apiUsage: 'Claude AI + データ分析API',
      estimatedCost: '月額約3000円（分析頻度による）',
    },
    isActive: true,
  },
}

/**
 * 組織のプロダクト利用状態
 */
export interface OrganizationProduct {
  id: string
  organizationId: string
  productId: string
  isActive: boolean // 利用中かどうか
  enableAI: boolean // AI機能を有効にするか（AI対応プロダクトの場合）
  activatedAt: Timestamp // 利用開始日時
  deactivatedAt?: Timestamp // 利用停止日時
  activatedBy: string // 有効化した職員のUID
  deactivatedBy?: string // 無効化した職員のUID
}
