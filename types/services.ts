/**
 * 介護保険・障害福祉サービス種別の型定義（2025年度版）
 */

/**
 * 🏥 介護保険サービス
 */

// 1. 居宅サービス - 訪問系
export const HOME_CARE_VISIT_SERVICES = [
  '訪問介護（ホームヘルプ）',
  '訪問入浴介護',
  '訪問看護',
  '訪問リハビリテーション',
  '居宅療養管理指導',
] as const;

// 1. 居宅サービス - 通所系
export const HOME_CARE_DAY_SERVICES = [
  '通所介護（デイサービス）',
  '通所リハビリテーション（デイケア）',
] as const;

// 1. 居宅サービス - 短期入所系
export const HOME_CARE_SHORT_STAY_SERVICES = [
  '短期入所生活介護（福祉系ショートステイ）',
  '短期入所療養介護（医療系ショートステイ）',
] as const;

// 1. 居宅サービス - その他
export const HOME_CARE_OTHER_SERVICES = [
  '福祉用具貸与',
  '特定福祉用具販売',
  '特定施設入居者生活介護（有料老人ホーム等）',
] as const;

// 2. 地域密着型サービス - 訪問・通所・複合系
export const COMMUNITY_BASED_VISIT_DAY_SERVICES = [
  '夜間対応型訪問介護',
  '定期巡回・随時対応型訪問介護看護',
  '地域密着型通所介護',
  '認知症対応型通所介護',
  '小規模多機能型居宅介護',
  '看護小規模多機能型居宅介護（複合型サービス）',
] as const;

// 2. 地域密着型サービス - 居住・入所系
export const COMMUNITY_BASED_RESIDENCE_SERVICES = [
  '認知症対応型共同生活介護（グループホーム）',
  '地域密着型特定施設入居者生活介護（定員29人以下）',
  '地域密着型介護老人福祉施設入所者生活介護（小規模特養）',
] as const;

// 3. 施設サービス
export const FACILITY_SERVICES = [
  '介護老人福祉施設（特別養護老人ホーム）',
  '介護老人保健施設（老健）',
  '介護医療院',
] as const;

// 4. 計画・支援サービス
export const PLANNING_SUPPORT_SERVICES = [
  '居宅介護支援（要介護者のケアプラン作成）',
  '介護予防支援（要支援者のケアプラン作成）',
  '地域包括支援センター',
] as const;

// すべての介護保険サービス
export const LONG_TERM_CARE_SERVICES = [
  ...HOME_CARE_VISIT_SERVICES,
  ...HOME_CARE_DAY_SERVICES,
  ...HOME_CARE_SHORT_STAY_SERVICES,
  ...HOME_CARE_OTHER_SERVICES,
  ...COMMUNITY_BASED_VISIT_DAY_SERVICES,
  ...COMMUNITY_BASED_RESIDENCE_SERVICES,
  ...FACILITY_SERVICES,
  ...PLANNING_SUPPORT_SERVICES,
] as const;

/**
 * 🌈 障害福祉サービス
 */

// 訪問系（総合支援法）
export const DISABILITY_VISIT_SERVICES = [
  '居宅介護',
  '重度訪問介護',
  '同行援護',
  '行動援護',
  '重度障害者等包括支援',
] as const;

// 日中活動・居住・訓練系
export const DISABILITY_DAY_RESIDENCE_SERVICES = [
  '生活介護',
  '自立訓練（機能）',
  '自立訓練（生活）',
  '自立生活援助',
  '就労移行支援',
  '就労継続支援（A型）',
  '就労継続支援（B型）',
  '就労定着支援',
  '就労選択支援',
  '共同生活援助（グループホーム）',
  '短期入所（児者共通）',
] as const;

// 施設系
export const DISABILITY_FACILITY_SERVICES = [
  '施設入所支援',
  '療養介護',
] as const;

// 相談支援系
export const DISABILITY_CONSULTATION_SERVICES = [
  '計画相談支援',
  '地域移行支援',
  '地域定着支援',
  '障害児相談支援',
] as const;

// 児童福祉法（障害児）
export const DISABILITY_CHILD_SERVICES = [
  '児童発達支援',
  '放課後等デイサービス',
  '居宅訪問型児童発達支援',
  '保育所等訪問支援',
  '障害児入所施設（福祉型）',
  '障害児入所施設（医療型）',
] as const;

// 地域生活支援事業
export const COMMUNITY_LIFE_SUPPORT_SERVICES = [
  '移動支援（ガイドヘルプ）',
  '日中一時支援',
  '地域活動支援センター（Ⅰ型）',
  '地域活動支援センター（Ⅱ型）',
  '地域活動支援センター（Ⅲ型）',
  '訪問入浴サービス',
  '住宅入居等支援（居住サポート）',
] as const;

// すべての障害福祉サービス
export const DISABILITY_WELFARE_SERVICES = [
  ...DISABILITY_VISIT_SERVICES,
  ...DISABILITY_DAY_RESIDENCE_SERVICES,
  ...DISABILITY_FACILITY_SERVICES,
  ...DISABILITY_CONSULTATION_SERVICES,
  ...DISABILITY_CHILD_SERVICES,
  ...COMMUNITY_LIFE_SUPPORT_SERVICES,
] as const;

/**
 * すべてのサービス種別
 */
export const ALL_SERVICES = [
  ...LONG_TERM_CARE_SERVICES,
  ...DISABILITY_WELFARE_SERVICES,
] as const;

/**
 * 型定義
 */
export type LongTermCareService = typeof LONG_TERM_CARE_SERVICES[number];
export type DisabilityWelfareService = typeof DISABILITY_WELFARE_SERVICES[number];
export type ServiceType = typeof ALL_SERVICES[number];
