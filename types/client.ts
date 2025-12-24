/**
 * 利用者（ケア対象者）の型定義
 */

import { Timestamp } from "firebase/firestore"

/**
 * 服薬情報
 */
export interface Medication {
  id: string
  medicationName: string // 薬品名
  dosage: string // 用法用量
  frequency: string // 服用頻度（例: 1日3回、朝夕2回など）
  startDate: string // 開始日（YYYY-MM-DD形式）
  endDate?: string // 終了日（任意、YYYY-MM-DD形式）
  purpose?: string // 目的・効能
  sideEffects?: string // 副作用・注意事項
  isActive: boolean // 現在服用中かどうか
}

/**
 * 既往歴の記録
 */
export interface MedicalHistoryRecord {
  id: string
  diseaseName: string // 病名
  diagnosisDate: string // 診断日（YYYY-MM-DD形式）
  treatmentPeriod?: string // 治療期間（例: 2020年1月〜2021年3月）
  status: string // 状態（治療中、完治、経過観察など）
  notes?: string // メモ
}

/**
 * 家族・キーパーソン情報
 */
export interface FamilyMember {
  id: string
  name: string // 氏名
  relation: string // 続柄（例: 長男、長女、配偶者など）
  phoneNumber: string // 電話番号
  email?: string // メールアドレス（任意）
  address?: string // 住所（任意）
  isEmergencyContact: boolean // 緊急連絡先かどうか
  priority: number // 優先順位（1が最優先）
  notes?: string // メモ
}

/**
 * 主治医情報
 */
export interface Doctor {
  name: string // 医師名
  specialization?: string // 専門分野
  phoneNumber: string // 電話番号
  medicalInstitution: string // 所属医療機関
}

/**
 * 医療機関情報
 */
export interface MedicalInstitution {
  name: string // 医療機関名
  type: string // 種別（病院、診療所、クリニックなど）
  department?: string // 診療科
  phoneNumber: string // 電話番号
  address?: string // 住所
  notes?: string // メモ
}

/**
 * ADL評価（将来の自動更新用）
 */
export interface ADLEvaluation {
  evaluationDate: string // 評価日（YYYY-MM-DD形式）
  bartelIndex?: number // バーセルインデックス（0-100）
  evaluationDetails?: string // 評価詳細
  evaluatedBy?: string // 評価者
}

/**
 * 認知機能評価（将来の自動更新用）
 */
export interface CognitiveEvaluation {
  evaluationDate: string // 評価日（YYYY-MM-DD形式）
  mmseScore?: number // MMSE得点（0-30）
  evaluationDetails?: string // 評価詳細
  evaluatedBy?: string // 評価者
}

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
  medicalHistory?: string // 既往歴（旧形式、後方互換性のため残す）
  medicalHistoryRecords?: MedicalHistoryRecord[] // 既往歴（構造化）
  careLevel?: string // 介護度
  adlLevel?: string // 日常生活自立度
  adlEvaluations?: ADLEvaluation[] // ADL評価履歴（将来の自動更新用）
  cognitiveEvaluations?: CognitiveEvaluation[] // 認知機能評価履歴（将来の自動更新用）
  hasDifficultDisease: boolean // 難病の有無
  hasDisability: boolean // 障害の有無
  medications?: string // 服薬情報（旧形式、後方互換性のため残す）
  medicationList?: Medication[] // 服薬情報（構造化）

  // 医療機関・主治医情報
  primaryDoctor?: Doctor // 主治医
  medicalInstitutions?: MedicalInstitution[] // 通院中の医療機関

  // リスク管理・特記事項
  allergies?: string // アレルギー
  contraindications?: string // 禁忌事項
  specialNotes?: string // 留意事項
  emergencyContact: string // 緊急連絡先（旧形式、後方互換性のため残す）
  emergencyContactRelation?: string // 緊急連絡先続柄（旧形式）
  familyMembers?: FamilyMember[] // 家族・キーパーソン情報（構造化）
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

// 医療機関の種別
export const MEDICAL_INSTITUTION_TYPES = [
  "病院",
  "診療所",
  "クリニック",
  "訪問診療",
  "その他"
] as const

// 既往歴の状態
export const MEDICAL_HISTORY_STATUS = [
  "治療中",
  "完治",
  "経過観察",
  "その他"
] as const

// 服薬頻度の選択肢
export const MEDICATION_FREQUENCIES = [
  "1日1回",
  "1日2回",
  "1日3回",
  "朝のみ",
  "昼のみ",
  "夕のみ",
  "就寝前",
  "食前",
  "食後",
  "頓服",
  "その他"
] as const

// 続柄の選択肢
export const FAMILY_RELATIONS = [
  "配偶者",
  "長男",
  "次男",
  "三男",
  "長女",
  "次女",
  "三女",
  "息子",
  "娘",
  "父",
  "母",
  "兄",
  "弟",
  "姉",
  "妹",
  "孫",
  "その他"
] as const
