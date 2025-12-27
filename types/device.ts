/**
 * デバイス管理の型定義
 */

import { Timestamp } from "firebase/firestore"

/**
 * デバイス情報
 */
export interface Device {
  id: string // デバイスID
  organizationId: string // 事業所ID
  deviceName: string // デバイス名（例: 事務所iPad、訪問車1号など）
  deviceType?: 'tablet' | 'smartphone' | 'pc' | 'other' // デバイスタイプ
  assignedStaffIds: string[] // 割り当てられた職員のUID（最大3人）
  maxStaff: number // 最大職員数（デフォルト3）
  isActive: boolean // デバイス有効状態
  description?: string // 備考
  serialNumber?: string // シリアル番号（オプション）

  // メタ情報
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string // 作成者のUID
  updatedBy: string // 更新者のUID
}

/**
 * デバイス作成用の入力データ
 */
export interface CreateDeviceInput {
  deviceName: string
  deviceType?: 'tablet' | 'smartphone' | 'pc' | 'other'
  assignedStaffIds?: string[]
  description?: string
  serialNumber?: string
}

/**
 * デバイス更新用の入力データ
 */
export interface UpdateDeviceInput {
  deviceName?: string
  deviceType?: 'tablet' | 'smartphone' | 'pc' | 'other'
  assignedStaffIds?: string[]
  isActive?: boolean
  description?: string
  serialNumber?: string
}

/**
 * デバイスタイプのラベル
 */
export const DEVICE_TYPE_LABELS: Record<string, string> = {
  tablet: 'タブレット',
  smartphone: 'スマートフォン',
  pc: 'PC',
  other: 'その他',
}

/**
 * デバイスと職員の統計情報
 */
export interface DeviceStats {
  totalDevices: number // 総デバイス数
  activeDevices: number // 有効デバイス数
  totalAssignedStaff: number // 割り当て済み職員数
  averageStaffPerDevice: number // デバイスあたりの平均職員数
  devicesAtCapacity: number // 満員のデバイス数（3人割り当て済み）
  devicesWithSpace: number // 空きのあるデバイス数
}
