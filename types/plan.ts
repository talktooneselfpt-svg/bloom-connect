/**
 * プラン体系の型定義
 */

import { Timestamp } from "firebase/firestore"

/**
 * プランタイプ
 */
export type PlanType = 'demo' | 'free' | 'standard' | 'ai'

/**
 * プラン情報
 */
export interface Plan {
  id: PlanType
  name: string
  displayName: string
  description: string
  features: string[]
  basePrice: number // 基本料金（月額）
  devicePrice: number // デバイス使用料（1端末あたり、月額）
  maxStaffPerDevice: number // 1端末あたりの最大職員数
  allowsProducts: boolean // プロダクト使用可否
  allowsAIProducts: boolean // AIプロダクト使用可否
  allowsCommunity: boolean // コミュニティーアクセス可否
}

/**
 * プラン定義（定数）
 */
export const PLANS: Record<PlanType, Plan> = {
  demo: {
    id: 'demo',
    name: 'demo',
    displayName: 'デモプラン',
    description: 'デモデータで機能をお試しいただけます',
    features: [
      'デモデータでの動作確認',
      '全機能のお試し利用',
      '実データの保存不可',
    ],
    basePrice: 0,
    devicePrice: 0,
    maxStaffPerDevice: 999,
    allowsProducts: true,
    allowsAIProducts: true,
    allowsCommunity: false,
  },
  free: {
    id: 'free',
    name: 'free',
    displayName: '無料プラン',
    description: '代表者1名のみ無料で利用可能',
    features: [
      '代表者1名のスタンダードプラン機能',
      'コミュニティーへの参加',
      '事業所情報の登録',
    ],
    basePrice: 0,
    devicePrice: 0,
    maxStaffPerDevice: 1,
    allowsProducts: true, // 代表者1名のみ
    allowsAIProducts: false,
    allowsCommunity: true,
  },
  standard: {
    id: 'standard',
    name: 'standard',
    displayName: 'スタンダードプラン',
    description: '事業所データに基づくプロダクトを利用可能',
    features: [
      '事業所データの管理',
      '複数職員の登録',
      'プロダクト機能の利用',
      'デバイスごとの料金体系',
    ],
    basePrice: 0,
    devicePrice: 1000, // 1端末あたり1000円/月
    maxStaffPerDevice: 3,
    allowsProducts: true,
    allowsAIProducts: false,
    allowsCommunity: true,
  },
  ai: {
    id: 'ai',
    name: 'ai',
    displayName: 'AIプラン',
    description: 'スタンダードプラン + 生成AI・外部API機能',
    features: [
      'スタンダードプランの全機能',
      '生成AI搭載プロダクト',
      '外部API連携機能',
      'AI分析レポート',
    ],
    basePrice: 0,
    devicePrice: 1000, // 1端末あたり1000円/月
    maxStaffPerDevice: 3,
    allowsProducts: true,
    allowsAIProducts: true,
    allowsCommunity: true,
  },
}

/**
 * プラン変更履歴
 */
export interface PlanChangeHistory {
  id: string
  organizationId: string
  fromPlan: PlanType
  toPlan: PlanType
  changedAt: Timestamp
  changedBy: string // 変更者のUID
  reason?: string // 変更理由
}

/**
 * デバイス情報
 */
export interface Device {
  id: string // デバイスID
  organizationId: string // 事業所ID
  deviceName: string // デバイス名（例: 事務所iPad、訪問車1号など）
  assignedStaffIds: string[] // 割り当てられた職員のUID（最大3人）
  isActive: boolean // デバイス有効状態
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
  updatedBy: string
}
