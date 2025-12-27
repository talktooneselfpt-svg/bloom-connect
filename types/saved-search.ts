/**
 * 保存済み検索条件の型定義
 */

import { Timestamp } from "firebase/firestore"

/**
 * 検索対象のリソースタイプ
 */
export type SearchResourceType = 'staff' | 'client' | 'organization' | 'device'

/**
 * 保存済み検索条件
 */
export interface SavedSearch {
  id: string
  userId: string // 作成したユーザーのUID
  resourceType: SearchResourceType // 対象リソース
  name: string // 検索条件の名前（例: "有効な看護師"）
  description?: string // 説明
  filters: Record<string, any> // フィルター条件（リソースごとに異なる）
  sortBy?: string // ソート項目
  sortOrder?: 'asc' | 'desc' // ソート順
  isDefault: boolean // デフォルトとして使用するか
  createdAt: Timestamp
  updatedAt: Timestamp
  lastUsedAt?: Timestamp // 最後に使用した日時
}

/**
 * スタッフ検索用のフィルター
 */
export interface StaffSearchFilters {
  searchTerm?: string // 検索キーワード
  filterActive?: 'all' | 'active' | 'inactive' // 在職状態
  filterRole?: string // 役割
  filterJobType?: string // 職種
  createdAfter?: Date // 登録日（以降）
  createdBefore?: Date // 登録日（以前）
}

/**
 * 利用者検索用のフィルター
 */
export interface ClientSearchFilters {
  searchTerm?: string // 検索キーワード
  filterActive?: 'all' | 'active' | 'inactive' // 状態
  filterCareLevel?: string // 介護度
  ageMin?: number // 年齢（最小）
  ageMax?: number // 年齢（最大）
  createdAfter?: Date // 登録日（以降）
  createdBefore?: Date // 登録日（以前）
}

/**
 * デバイス検索用のフィルター
 */
export interface DeviceSearchFilters {
  searchQuery?: string // 検索キーワード
  filterActive?: 'all' | 'active' | 'inactive' // 状態
  filterDeviceType?: string // デバイス種別
}

/**
 * 保存済み検索条件作成用の入力データ
 */
export interface CreateSavedSearchInput {
  resourceType: SearchResourceType
  name: string
  description?: string
  filters: Record<string, any>
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  isDefault?: boolean
}

/**
 * 保存済み検索条件更新用の入力データ
 */
export interface UpdateSavedSearchInput {
  name?: string
  description?: string
  filters?: Record<string, any>
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  isDefault?: boolean
}
