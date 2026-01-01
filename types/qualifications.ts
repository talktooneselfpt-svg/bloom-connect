/**
 * 職種・資格・研修の型定義（2025年度版）
 */

/**
 * 🟦 国家資格
 */

// 介護・福祉系国家資格
export const NATIONAL_CARE_WELFARE_QUALIFICATIONS = [
  '介護福祉士',
  '社会福祉士',
  '精神保健福祉士',
] as const;

// 心理・保育系国家資格
export const NATIONAL_PSYCHOLOGY_CHILDCARE_QUALIFICATIONS = [
  '公認心理師',
  '保育士',
] as const;

// 医療・リハビリ系国家資格
export const NATIONAL_MEDICAL_REHABILITATION_QUALIFICATIONS = [
  '医師',
  '歯科医師',
  '看護師',
  '准看護師',
  '保健師',
  '助産師',
  '理学療法士（PT）',
  '作業療法士（OT）',
  '言語聴覚士（ST）',
  '視能訓練士',
  '義肢装具士',
  '歯科衛生士',
  '管理栄養士',
  '栄養士',
  '薬剤師',
  'あん摩マッサージ指圧師',
  'はり師',
  'きゅう師',
  '柔道整復師',
] as const;

// すべての国家資格
export const NATIONAL_QUALIFICATIONS = [
  ...NATIONAL_CARE_WELFARE_QUALIFICATIONS,
  ...NATIONAL_PSYCHOLOGY_CHILDCARE_QUALIFICATIONS,
  ...NATIONAL_MEDICAL_REHABILITATION_QUALIFICATIONS,
] as const;

/**
 * 🟩 公的資格・法定研修
 */

// 介護保険（高齢者）
export const CARE_INSURANCE_QUALIFICATIONS = [
  '介護職員初任者研修',
  '介護職員実務者研修',
  '介護支援専門員（ケアマネジャー）',
  '主任介護支援専門員',
  '認知症介護実践者研修',
  '認知症介護リーダー研修',
  '認知症介護指導者研修',
  '喀痰吸引等研修1号',
  '喀痰吸引等研修2号',
  '喀痰吸引等研修3号',
] as const;

// 障害福祉（成人・児童）
export const DISABILITY_WELFARE_QUALIFICATIONS = [
  'サービス管理責任者（サビ管）',
  '児童発達支援管理責任者（児発管）',
  '相談支援専門員（初任）',
  '相談支援専門員（現任）',
  '強度行動障害支援者研修（基礎）',
  '強度行動障害支援者研修（実践）',
  '行動援護従業者研修',
  '同行援護従業者研修（一般）',
  '同行援護従業者研修（応用）',
  '重度訪問介護従業者研修',
  '移動支援従業者研修（ガイドヘルパー）',
  '福祉用具専門相談員',
  '医療的ケア児等コーディネーター養成研修',
] as const;

// すべての公的資格・法定研修
export const PUBLIC_QUALIFICATIONS = [
  ...CARE_INSURANCE_QUALIFICATIONS,
  ...DISABILITY_WELFARE_QUALIFICATIONS,
] as const;

/**
 * 🟧 民間資格
 */
export const PRIVATE_QUALIFICATIONS = [
  '臨床心理士',
  '福祉住環境コーディネーター',
  '認知症ケア専門士',
  'レクリエーション介護士',
  '介護予防運動指導員',
  '介護食アドバイザー',
  '行動分析士（ABA）',
] as const;

/**
 * 🟪 主な職種名（配置・ロール）
 */

// 介護・障害共通
export const COMMON_CARE_POSITIONS = [
  '施設長',
  '管理者',
  'サービス提供責任者（サ責）',
  '生活相談員',
  '地域連携員',
  '機能訓練指導員',
  '介護職員',
  '生活支援員',
  'ホームヘルパー',
] as const;

// 障害・児童特有
export const DISABILITY_CHILD_POSITIONS = [
  '就労支援員',
  '職業指導員',
  '児童指導員',
  '心理担当職員',
  'ピアサポーター',
] as const;

// 医療・運営
export const MEDICAL_ADMINISTRATIVE_POSITIONS = [
  '訪問看護師',
  '訪問リハビリ職',
  '事務職員（介護請求事務）',
  '事務職員（障害福祉請求事務）',
  '送迎ドライバー',
  '介護助手',
] as const;

// すべての職種
export const ALL_POSITIONS = [
  ...COMMON_CARE_POSITIONS,
  ...DISABILITY_CHILD_POSITIONS,
  ...MEDICAL_ADMINISTRATIVE_POSITIONS,
] as const;

/**
 * 🟫 行政・地域支援
 */
export const ADMINISTRATIVE_COMMUNITY_POSITIONS = [
  '地域包括支援センター職員（社会福祉士）',
  '地域包括支援センター職員（保健師）',
  '地域包括支援センター職員（主任ケアマネ）',
  '生活困窮者自立支援員',
  '成年後見人（弁護士）',
  '成年後見人（司法書士）',
] as const;

/**
 * すべての資格・研修
 */
export const ALL_QUALIFICATIONS = [
  ...NATIONAL_QUALIFICATIONS,
  ...PUBLIC_QUALIFICATIONS,
  ...PRIVATE_QUALIFICATIONS,
] as const;

/**
 * 型定義
 */
export type NationalQualification = typeof NATIONAL_QUALIFICATIONS[number];
export type PublicQualification = typeof PUBLIC_QUALIFICATIONS[number];
export type PrivateQualification = typeof PRIVATE_QUALIFICATIONS[number];
export type Position = typeof ALL_POSITIONS[number];
export type AdministrativePosition = typeof ADMINISTRATIVE_COMMUNITY_POSITIONS[number];
export type Qualification = typeof ALL_QUALIFICATIONS[number];
