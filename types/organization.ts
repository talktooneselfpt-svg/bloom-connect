/**
 * 事業所データの型定義
 */

import { Timestamp } from "firebase/firestore"
import { ServiceType } from './services';

/**
 * 規約同意情報
 */
export interface TermsAgreement {
  version: string // 規約バージョン
  agreedAt: Timestamp // 同意日時
  agreedBy: string // 同意者（ユーザーID）
}

export interface Organization {
  // 基本情報
  id: string // 事業所ID（データベース上の紐付け）
  organizationCode: string // 事業所番号（ログイン用、ユニーク）
  name: string // 事業所名
  nameKana?: string // 事業所名（ひらがな）

  // 所在地情報
  prefecture?: string // 都道府県
  city?: string // 市区町村
  addressLine?: string // 詳細住所
  postalCode?: string // 郵便番号

  // 連絡先情報
  phone: string // 電話番号（必須、緊急時の連絡先）
  email: string // 連絡用メールアドレス（必須、重要なお知らせ送信先）

  // 事業所種別・特性
  organizationType: string // 事業所種別（訪問看護、訪問介護等）
  services?: ServiceType[] // 提供サービス一覧

  // 管理者情報
  administratorName: string // 管理者名（責任者の特定）
  administratorEmail?: string // 管理者メールアドレス

  // ブランディング
  logoUrl?: string // ロゴ画像URL（Firebase Storage）

  // 法的・契約情報
  termsAgreement?: TermsAgreement // 規約同意ステータス

  // システム情報
  isActive: boolean // 有効状態
  plan: 'demo' | 'subscription' // プラン（デモ / サブスクリプション）
  staffCount?: number // 登録職員数（料金計算用）
  subscriptionStartDate?: Timestamp // サブスク開始日
  subscriptionEndDate?: Timestamp // サブスク終了日（トライアル終了日）
  paymentStatus?: 'active' | 'overdue' | 'suspended' // 支払い状態
  stripeCustomerId?: string // Stripe 顧客 ID
  stripeSubscriptionId?: string // Stripe サブスクリプション ID
  createdAt: Timestamp // 作成日時
  updatedAt: Timestamp // 更新日時
  createdBy?: string // 作成者
  updatedBy?: string // 更新者
}

/**
 * 料金プラン
 */
export interface PricingPlan {
  planType: 'demo' | 'subscription'
  basePrice: number // 基本料金
  additionalStaffPrice: number // 追加職員料金（10人ごと）
  freeStaffLimit: number // 無料範囲の職員数
  features: string[] // プラン機能
}

/**
 * デモプラン: 無料・機能制限あり
 */
export const DEMO_PLAN: PricingPlan = {
  planType: 'demo',
  basePrice: 0,
  additionalStaffPrice: 0,
  freeStaffLimit: 5, // デモは5人まで
  features: [
    '職員登録（最大5人）',
    '利用者登録（最大10人）',
    '基本機能のみ',
    'データ保存期間: 30日',
  ],
};

/**
 * サブスクプラン: 職員数に応じた従量課金
 * - 20人以下: 基本料金 2,000円/月
 * - 21人以上: 基本料金 2,000円 + 10人ごとに 1,000円
 */
export const SUBSCRIPTION_PLAN: PricingPlan = {
  planType: 'subscription',
  basePrice: 2000, // 基本料金 2,000円
  additionalStaffPrice: 1000, // 10人ごとに 1,000円
  freeStaffLimit: 20, // 20人までは基本料金のみ
  features: [
    '無制限の職員登録',
    '無制限の利用者登録',
    'すべての機能',
    'データ無期限保存',
    'CSVインポート/エクスポート',
    'メールサポート',
  ],
};

/**
 * 月額料金を計算
 * @param staffCount 登録職員数
 * @param plan プラン種別
 * @returns 月額料金（円）
 */
export function calculateMonthlyPrice(staffCount: number, plan: 'demo' | 'subscription'): number {
  if (plan === 'demo') {
    return 0;
  }

  // サブスクプラン
  const basePlan = SUBSCRIPTION_PLAN;

  if (staffCount <= basePlan.freeStaffLimit) {
    // 20人以下: 基本料金のみ
    return basePlan.basePrice;
  }

  // 21人以上: 基本料金 + (超過人数 / 10) * 追加料金
  const excessStaff = staffCount - basePlan.freeStaffLimit;
  const additionalUnits = Math.ceil(excessStaff / 10);

  return basePlan.basePrice + (additionalUnits * basePlan.additionalStaffPrice);
}

// 事業所種別の選択肢
export const ORGANIZATION_TYPES = [
  "訪問看護",
  "訪問介護",
  "訪問入浴",
  "訪問リハビリテーション",
  "居宅介護支援",
  "通所介護（デイサービス）",
  "通所リハビリテーション（デイケア）",
  "短期入所生活介護（ショートステイ）",
  "小規模多機能型居宅介護",
  "認知症対応型共同生活介護（グループホーム）",
  "特定施設入居者生活介護（有料老人ホーム等）",
  "介護老人福祉施設（特別養護老人ホーム）",
  "介護老人保健施設",
  "介護医療院",
  "その他"
] as const

// 都道府県の選択肢
export const PREFECTURES = [
  "北海道",
  "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県",
  "岐阜県", "静岡県", "愛知県", "三重県",
  "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
  "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県",
  "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県",
  "沖縄県"
] as const
