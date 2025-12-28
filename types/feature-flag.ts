/**
 * 機能フラグ（Feature Flags）の型定義
 */

import { Timestamp } from "firebase/firestore"

/**
 * 機能のステージ
 */
export type FeatureStage = 'development' | 'staging' | 'production' | 'disabled'

/**
 * 機能フラグ
 */
export interface FeatureFlag {
  id: string
  key: string // 機能の識別子（例: 'advanced_search', 'ai_assistant'）
  name: string // 機能の表示名
  description: string // 機能の説明
  stage: FeatureStage // 現在のステージ
  enabledForOrganizations?: string[] // 特定の事業所のみ有効化
  enabledForUsers?: string[] // 特定のユーザーのみ有効化
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string // 作成者のUID
  lastModifiedBy: string // 最終更新者のUID
  metadata?: {
    version?: string
    releaseDate?: Date
    deprecationDate?: Date
  }
}

/**
 * 機能フラグ作成用の入力データ
 */
export interface CreateFeatureFlagInput {
  key: string
  name: string
  description: string
  stage?: FeatureStage
  enabledForOrganizations?: string[]
  enabledForUsers?: string[]
  metadata?: {
    version?: string
    releaseDate?: Date
    deprecationDate?: Date
  }
}

/**
 * ステージのラベル
 */
export const FEATURE_STAGE_LABELS: Record<FeatureStage, string> = {
  development: '開発中',
  staging: 'テスト中',
  production: '本番',
  disabled: '無効',
}

/**
 * ステージの色（Tailwind CSS）
 */
export const FEATURE_STAGE_COLORS: Record<FeatureStage, { bg: string; text: string }> = {
  development: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
  },
  staging: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
  },
  production: {
    bg: 'bg-green-100',
    text: 'text-green-800',
  },
  disabled: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
  },
}

/**
 * 機能フラグの履歴
 */
export interface FeatureFlagHistory {
  id: string
  featureFlagId: string
  action: 'created' | 'stage_changed' | 'enabled_for_organization' | 'disabled_for_organization' | 'updated' | 'deleted'
  previousStage?: FeatureStage
  newStage?: FeatureStage
  userId: string
  userName: string
  timestamp: Timestamp
  metadata?: Record<string, any>
}
