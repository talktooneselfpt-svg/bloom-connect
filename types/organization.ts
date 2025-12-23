/**
 * 事業所データの型定義
 */
export interface Organization {
  /** 事業所ID */
  id: string;
  /** 事業所番号（ログイン用） */
  organizationCode: string;
  /** 事業所名 */
  name: string;
  /** 事業所名（ひらがな） */
  nameKana?: string;
  /** 郵便番号 */
  postalCode?: string;
  /** 住所 */
  address?: string;
  /** 電話番号 */
  phone?: string;
  /** メールアドレス */
  email?: string;
  /** 有効状態 */
  isActive: boolean;
  /** プラン（free, basic, premium など） */
  plan?: string;
  /** 作成日時 */
  createdAt: string;
  /** 更新日時 */
  updatedAt: string;
}
