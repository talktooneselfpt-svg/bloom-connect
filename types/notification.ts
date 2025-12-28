/**
 * 通知機能の型定義
 */

import { Timestamp } from "firebase/firestore"

/**
 * 通知タイプ
 */
export type NotificationType =
  | 'organization' // 事業所からの通知
  | 'system' // 運営からの通知

/**
 * 通知カテゴリー
 */
export type NotificationCategory =
  | 'announcement' // お知らせ
  | 'update' // アップデート情報
  | 'maintenance' // メンテナンス
  | 'alert' // 重要な警告
  | 'info' // 一般情報
  | 'reminder' // リマインダー

/**
 * 通知の優先度
 */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

/**
 * 通知
 */
export interface Notification {
  id: string
  type: NotificationType // 事業所 or 運営
  category: NotificationCategory // カテゴリー
  priority: NotificationPriority // 優先度

  // 内容
  title: string // タイトル
  message: string // メッセージ本文
  link?: string // リンク先URL（オプション）
  linkText?: string // リンクテキスト（オプション）

  // 発信元情報
  organizationId?: string // 事業所からの通知の場合、事業所ID
  senderId?: string // 送信者のUID（事業所管理者など）
  senderName?: string // 送信者名

  // 対象
  targetUserIds?: string[] // 特定のユーザーのみに送信する場合（空の場合は全員）
  targetRoles?: string[] // 特定のロールのみに送信する場合（例: ['管理者']）

  // 状態
  isRead: boolean // 既読フラグ
  isArchived: boolean // アーカイブ済みフラグ
  isPinned: boolean // ピン留めフラグ

  // 有効期限
  expiresAt?: Timestamp // 有効期限（過ぎると自動で非表示）

  // メタ情報
  createdAt: Timestamp
  updatedAt: Timestamp
  readAt?: Timestamp // 既読日時
}

/**
 * ユーザーごとの通知既読状態
 * （通知を全ユーザー共通で管理し、既読状態だけユーザーごとに管理する場合）
 */
export interface UserNotificationStatus {
  id: string
  userId: string
  notificationId: string
  isRead: boolean
  readAt?: Timestamp
  isArchived: boolean
  archivedAt?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * 通知設定（ユーザーごと）
 */
export interface NotificationSettings {
  id: string
  userId: string

  // 通知の受信設定
  enableOrganizationNotifications: boolean // 事業所通知を受信するか
  enableSystemNotifications: boolean // 運営通知を受信するか

  // カテゴリーごとの受信設定
  enableAnnouncements: boolean // お知らせ
  enableUpdates: boolean // アップデート
  enableMaintenance: boolean // メンテナンス
  enableAlerts: boolean // 警告
  enableInfo: boolean // 一般情報
  enableReminders: boolean // リマインダー

  // 通知方法
  enablePushNotifications: boolean // プッシュ通知
  enableEmailNotifications: boolean // メール通知

  // メタ情報
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * 通知作成用の入力データ
 */
export interface CreateNotificationInput {
  type: NotificationType
  category: NotificationCategory
  priority: NotificationPriority
  title: string
  message: string
  link?: string
  linkText?: string
  organizationId?: string
  senderId?: string
  senderName?: string
  targetUserIds?: string[]
  targetRoles?: string[]
  expiresAt?: Date
}

/**
 * 通知タイプのラベル
 */
export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  organization: '事業所',
  system: '運営',
}

/**
 * 通知カテゴリーのラベル
 */
export const NOTIFICATION_CATEGORY_LABELS: Record<NotificationCategory, string> = {
  announcement: 'お知らせ',
  update: 'アップデート',
  maintenance: 'メンテナンス',
  alert: '警告',
  info: '情報',
  reminder: 'リマインダー',
}

/**
 * 通知優先度のラベル
 */
export const NOTIFICATION_PRIORITY_LABELS: Record<NotificationPriority, string> = {
  low: '低',
  normal: '通常',
  high: '高',
  urgent: '緊急',
}

/**
 * 通知カテゴリーの色（Tailwind CSS）
 */
export const NOTIFICATION_CATEGORY_COLORS: Record<NotificationCategory, { bg: string; text: string }> = {
  announcement: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
  },
  update: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
  },
  maintenance: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
  },
  alert: {
    bg: 'bg-red-100',
    text: 'text-red-800',
  },
  info: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
  },
  reminder: {
    bg: 'bg-green-100',
    text: 'text-green-800',
  },
}

/**
 * 通知優先度の色（Tailwind CSS）
 */
export const NOTIFICATION_PRIORITY_COLORS: Record<NotificationPriority, { bg: string; text: string; border: string }> = {
  low: {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    border: 'border-gray-200',
  },
  normal: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
  },
  high: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200',
  },
  urgent: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
  },
}

/**
 * 通知のサンプルデータ
 */
export const SAMPLE_NOTIFICATIONS: Partial<Notification>[] = [
  {
    id: 'notif-001',
    type: 'system',
    category: 'update',
    priority: 'normal',
    title: '新機能リリースのお知らせ',
    message: 'AI分析レポート機能がリリースされました。マイページから有効化できます。',
    link: '/my-page',
    linkText: 'マイページを開く',
    isRead: false,
    isArchived: false,
    isPinned: true,
  },
  {
    id: 'notif-002',
    type: 'system',
    category: 'maintenance',
    priority: 'high',
    title: 'システムメンテナンスのお知らせ',
    message: '2025年1月15日 2:00-4:00にシステムメンテナンスを実施します。この間、サービスをご利用いただけません。',
    isRead: false,
    isArchived: false,
    isPinned: false,
  },
  {
    id: 'notif-003',
    type: 'organization',
    category: 'announcement',
    priority: 'normal',
    title: '今月のミーティング日程',
    message: '1月20日 15:00より全体ミーティングを実施します。',
    senderName: '管理者',
    isRead: true,
    isArchived: false,
    isPinned: false,
  },
  {
    id: 'notif-004',
    type: 'organization',
    category: 'reminder',
    priority: 'normal',
    title: 'シフト提出期限のリマインダー',
    message: '来月のシフト希望は1月25日までに提出してください。',
    senderName: '管理者',
    isRead: false,
    isArchived: false,
    isPinned: false,
  },
  {
    id: 'notif-005',
    type: 'system',
    category: 'alert',
    priority: 'urgent',
    title: '【重要】セキュリティアップデート',
    message: 'セキュリティの向上のため、パスワードの変更を推奨します。',
    link: '/settings/password',
    linkText: 'パスワードを変更',
    isRead: false,
    isArchived: false,
    isPinned: true,
  },
]

/**
 * 優先度に応じた色を取得
 */
export function getPriorityColor(priority: NotificationPriority): string {
  switch (priority) {
    case 'urgent':
      return 'red'
    case 'high':
      return 'orange'
    case 'normal':
      return 'blue'
    case 'low':
      return 'gray'
    default:
      return 'gray'
  }
}

/**
 * カテゴリーに応じたアイコンを取得（Tailwind CSS用のアイコン名）
 */
export function getCategoryIcon(category: NotificationCategory): string {
  switch (category) {
    case 'announcement':
      return 'megaphone'
    case 'update':
      return 'sparkles'
    case 'maintenance':
      return 'wrench'
    case 'alert':
      return 'exclamation-triangle'
    case 'info':
      return 'information-circle'
    case 'reminder':
      return 'bell'
    default:
      return 'information-circle'
  }
}
