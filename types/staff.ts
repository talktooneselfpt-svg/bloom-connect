import { Qualification, Position } from './qualifications';

/**
 * 職員データの型定義
 */
export interface Staff {
  /** 組織ID */
  organizationId: string;
  /** Firebase Authentication の UID */
  uid: string;
  /** 個人番号（ログイン用・職員番号） */
  staffNumber: string;
  /** 氏名（漢字） */
  nameKanji: string;
  /** 氏名（ひらがな） */
  nameKana: string;
  /** 職種（複数選択可能） */
  jobTypes: string[];
  /** 保有資格（複数選択可能） */
  qualifications?: string[];
  /** 役職 */
  position: string;
  /** 権限ロール */
  role: string;
  /** 所属部署（任意） */
  department?: string;
  /** 勤務形態（任意） */
  employmentType?: string;
  /** 会社用電話番号 */
  phoneCompany: string;
  /** 個人用電話番号（任意） */
  phonePersonal?: string;
  /** メールアドレス */
  email: string;
  /** 在職状態 */
  isActive: boolean;
  /** パスワード設定完了フラグ（初回ログイン時のパスワード設定が完了しているか） */
  passwordSetupCompleted: boolean;
  /** 入社日（任意） */
  hireDate?: string;
  /** 退職日（任意） */
  retireDate?: string;
  /** 資格番号（任意） */
  licenseNumber?: string;
  /** 緊急連絡先（任意） */
  emergencyContact?: string;
  /** プロフィール写真URL（任意） */
  photoUrl?: string;
  /** メモ（任意） */
  memo?: string;
  /** 作成日時 */
  createdAt: string;
  /** 更新日時 */
  updatedAt: string;
  /** 作成者 */
  createdBy: string;
  /** 更新者 */
  updatedBy: string;
}

/**
 * 職種の選択肢（ALL_POSITIONS から再エクスポート）
 */
export { ALL_POSITIONS as JOB_TYPES } from './qualifications';

/**
 * 役職の選択肢
 */
export const POSITIONS = [
  '代表',
  '施設長',
  '管理者',
  '主任',
  'リーダー',
  'サブリーダー',
  'サービス提供責任者（サ責）',
  'スタッフ',
  'パートスタッフ',
  '事務',
  'ビューアー',
] as const;

/**
 * 権限ロールの選択肢
 */
export const ROLES = [
  '管理者',
  'マネージャー',
  'リーダー',
  'スタッフ',
  'ビューアー',
] as const;

/**
 * 勤務形態の選択肢
 */
export const EMPLOYMENT_TYPES = [
  '常勤',
  '非常勤',
  'パート',
  'アルバイト',
  '契約社員',
  '派遣',
] as const;

export type StaffPosition = typeof POSITIONS[number];
export type Role = typeof ROLES[number];
export type EmploymentType = typeof EMPLOYMENT_TYPES[number];
