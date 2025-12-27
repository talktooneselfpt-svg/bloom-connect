/**
 * 監査ログ・アクティビティログの型定義
 */

import { Timestamp } from "firebase/firestore"

/**
 * アクション種別
 */
export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'export'

/**
 * リソース種別
 */
export type ResourceType =
  | 'staff'
  | 'client'
  | 'organization'
  | 'subscription'
  | 'device'
  | 'notification'
  | 'plan'
  | 'settings'

/**
 * 監査ログ
 */
export interface AuditLog {
  id: string
  userId: string // 操作者のUID
  userName: string // 操作者の氏名
  organizationId: string // 事業所ID
  action: AuditAction // アクション種別
  resourceType: ResourceType // リソース種別
  resourceId: string // リソースのID
  resourceName?: string // リソース名（表示用）
  changes?: { // 変更内容（update時）
    before: any
    after: any
  }
  ipAddress: string // IPアドレス
  userAgent: string // ユーザーエージェント
  timestamp: Timestamp // 操作日時
  metadata?: Record<string, any> // その他のメタデータ
}

/**
 * 監査ログ作成用の入力データ
 */
export interface CreateAuditLogInput {
  userId: string
  userName: string
  organizationId: string
  action: AuditAction
  resourceType: ResourceType
  resourceId: string
  resourceName?: string
  changes?: {
    before: any
    after: any
  }
  metadata?: Record<string, any>
}

/**
 * アクションのラベル
 */
export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  create: '作成',
  update: '更新',
  delete: '削除',
  login: 'ログイン',
  logout: 'ログアウト',
  view: '閲覧',
  export: 'エクスポート',
}

/**
 * リソースタイプのラベル
 */
export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  staff: '職員',
  client: '利用者',
  organization: '事業所',
  subscription: 'サブスクリプション',
  device: 'デバイス',
  notification: '通知',
  plan: 'プラン',
  settings: '設定',
}

/**
 * アクションの色（Tailwind CSS）
 */
export const AUDIT_ACTION_COLORS: Record<AuditAction, { bg: string; text: string; border: string }> = {
  create: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300',
  },
  update: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
  },
  delete: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300',
  },
  login: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300',
  },
  logout: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-300',
  },
  view: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300',
  },
  export: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
    border: 'border-indigo-300',
  },
}

/**
 * 監査ログのフィルター条件
 */
export interface AuditLogFilter {
  startDate?: Date
  endDate?: Date
  userId?: string
  action?: AuditAction
  resourceType?: ResourceType
  searchQuery?: string
}

/**
 * 監査ログの統計情報
 */
export interface AuditLogStats {
  totalLogs: number
  logsByAction: Record<AuditAction, number>
  logsByResourceType: Record<ResourceType, number>
  uniqueUsers: number
  mostActiveUser: {
    userId: string
    userName: string
    count: number
  } | null
}
