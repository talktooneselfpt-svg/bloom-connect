/**
 * 通知データの型定義
 */

import { Timestamp } from "firebase/firestore"

/**
 * 通知の種類（3階層）
 */
export type NotificationType =
  | 'personal'      // 個人宛通知
  | 'organization'  // 事業所宛通知
  | 'global'        // 全体通知

/**
 * 通知の優先度
 */
export type NotificationPriority = 'low' | 'normal' | 'high'

/**
 * 通知カテゴリ
 */
export type NotificationCategory =
  | 'system'        // システム通知
  | 'announcement'  // お知らせ
  | 'reminder'      // リマインダー
  | 'alert'         // アラート
  | 'message'       // メッセージ
  | 'update'        // 更新通知

/**
 * 通知データ
 */
export interface Notification {
  // 基本情報
  id: string
  type: NotificationType
  category: NotificationCategory

  // コンテンツ
  title: string
  message: string

  // ターゲット
  targetUserId?: string           // 個人通知の場合のユーザーID
  targetOrganizationId?: string   // 事業所通知の場合の事業所ID
  // global の場合は targetUserId, targetOrganizationId は null

  // 既読管理
  isRead: boolean
  readAt?: Timestamp

  // メタ情報
  priority: NotificationPriority
  actionUrl?: string              // クリック時の遷移先URL
  iconName?: string               // アイコン名

  // システム情報
  createdAt: Timestamp
  createdBy?: string              // 作成者のユーザーID
  expiresAt?: Timestamp           // 有効期限
}

/**
 * 通知作成用のデータ（IDやタイムスタンプは自動生成）
 */
export interface CreateNotificationData {
  type: NotificationType
  category: NotificationCategory
  title: string
  message: string
  targetUserId?: string
  targetOrganizationId?: string
  priority?: NotificationPriority
  actionUrl?: string
  iconName?: string
  createdBy?: string
  expiresAt?: Timestamp
}

/**
 * 通知フィルター
 */
export interface NotificationFilter {
  type?: NotificationType
  category?: NotificationCategory
  isRead?: boolean
  priority?: NotificationPriority
}
