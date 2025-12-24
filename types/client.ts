/**
 * 利用者（ケア対象者）の型定義
 */

import { Timestamp } from "firebase/firestore"

export interface Client {
  id: string
  organizationId: string

  // 基本情報
  nameKanji: string
  nameKana: string
  birthDate: string // YYYY-MM-DD形式
  gender: string
  height?: number // cm（任意）
  weight?: number // kg（任意）
  livingArrangement: string // 独居・同居・施設入所

  // AI分析・ケア支援用データ
  primaryDiseases?: string // 主疾患（複数ある場合はカンマ区切り）
  medicalHistory?: string // 既往歴
  careLevel?: string // 介護度
  adlLevel?: string // 日常生活自立度
  hasDifficultDisease: boolean // 難病の有無
  hasDisability: boolean // 障害の有無
  medications?: string // 服薬情報（簡易版）

  // リスク管理・特記事項
  allergies?: string // アレルギー
  contraindications?: string // 禁忌事項
  specialNotes?: string // 留意事項
  emergencyContact: string // 緊急連絡先
  emergencyContactRelation?: string // 緊急連絡先続柄
  hasFallHistory: boolean // 転倒歴
  swallowingStatus: string // 嚥下状態

  // メタ情報
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
  updatedBy: string
  retiredAt?: Timestamp
  retiredBy?: string
}

// 性別の選択肢
export const GENDERS = [
  "男性",
  "女性",
  "その他"
] as const

// 居住形態の選択肢
export const LIVING_ARRANGEMENTS = [
  "独居",
  "同居",
  "施設入所",
  "その他"
] as const

// 介護度の選択肢
export const CARE_LEVELS = [
  "非該当",
  "要支援1",
  "要支援2",
  "要介護1",
  "要介護2",
  "要介護3",
  "要介護4",
  "要介護5"
] as const

// 日常生活自立度（障害高齢者）の選択肢
export const ADL_LEVELS = [
  "自立",
  "J1（何らかの障害等を有するが、日常生活はほぼ自立）",
  "J2（隣近所への外出等をしており日常生活は自立）",
  "A1（屋内での生活はおおむね自立）",
  "A2（外出の頻度が少ない）",
  "B1（屋内での生活は何らかの介助を要する）",
  "B2（日中もベッド上での生活が主体）",
  "C1（自力で寝返りをうつ）",
  "C2（自力では寝返りもうてない）"
] as const

// 嚥下状態の選択肢
export const SWALLOWING_STATUS = [
  "普通",
  "要注意",
  "とろみ必要",
  "刻み食",
  "ミキサー食",
  "経管栄養"
] as const
