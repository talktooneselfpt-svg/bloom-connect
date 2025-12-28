/**
 * デバイス招待コードの型定義
 */

import { Timestamp } from "firebase/firestore"

/**
 * デバイス招待コード
 */
export interface DeviceInvitation {
  id: string // 招待ID
  organizationId: string // 事業所ID
  invitationCode: string // 6桁の招待コード
  targetStaffId: string // 招待対象の職員UID
  targetStaffName: string // 職員名（表示用）
  deviceName: string // 予定されているデバイス名
  deviceType: 'tablet' | 'smartphone' | 'pc' | 'other' // デバイスタイプ

  // ステータス
  status: 'pending' | 'used' | 'expired' // 未使用・使用済み・期限切れ
  usedAt?: Timestamp // 使用日時
  registeredDeviceId?: string // 登録されたデバイスID（使用済みの場合）

  // 有効期限
  expiresAt: Timestamp // 有効期限（デフォルト: 作成から7日間）

  // メタ情報
  createdAt: Timestamp
  createdBy: string // 作成者のUID（通常は管理者）
  createdByName: string // 作成者名
}

/**
 * 招待コード作成用の入力データ
 */
export interface CreateInvitationInput {
  targetStaffId: string
  targetStaffName: string
  deviceName: string
  deviceType: 'tablet' | 'smartphone' | 'pc' | 'other'
  expiresInDays?: number // 有効日数（デフォルト7日）
}

/**
 * 招待コードステータスのラベル
 */
export const INVITATION_STATUS_LABELS: Record<DeviceInvitation['status'], string> = {
  pending: '未使用',
  used: '使用済み',
  expired: '期限切れ',
}

/**
 * 招待コードステータスの色
 */
export const INVITATION_STATUS_COLORS: Record<DeviceInvitation['status'], { bg: string; text: string }> = {
  pending: { bg: 'bg-blue-100', text: 'text-blue-800' },
  used: { bg: 'bg-green-100', text: 'text-green-800' },
  expired: { bg: 'bg-gray-100', text: 'text-gray-800' },
}
