/**
 * 事業所データの型定義
 */

import { Timestamp } from "firebase/firestore"

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
  organizationTypeOther?: string // 事業所種別がその他の場合の自由記載（任意）
  services?: string[] // 提供サービス一覧

  // 管理者情報
  administratorName: string // 管理者名（責任者の特定）
  administratorEmail?: string // 管理者メールアドレス

  // ブランディング
  logoUrl?: string // ロゴ画像URL（Firebase Storage）

  // 法的・契約情報
  termsAgreement?: TermsAgreement // 規約同意ステータス

  // システム情報
  isActive: boolean // 有効状態
  plan?: string // プラン（free, basic, premium など）
  createdAt: Timestamp // 作成日時
  updatedAt: Timestamp // 更新日時
  createdBy?: string // 作成者
  updatedBy?: string // 更新者
}

// 事業所種別の選択肢
export const ORGANIZATION_TYPES = [
  // 介護保険サービス
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

  // 障害福祉サービス（訪問系）
  "居宅介護（ホームヘルプ）",
  "重度訪問介護",
  "同行援護",
  "行動援護",

  // 障害福祉サービス（日中活動系）
  "療養介護",
  "生活介護",
  "短期入所（障害福祉ショートステイ）",
  "重度障害者等包括支援",

  // 障害福祉サービス（居住系）
  "施設入所支援",
  "共同生活援助（障害福祉グループホーム）",

  // 障害福祉サービス（訓練系・就労系）
  "自立訓練（機能訓練）",
  "自立訓練（生活訓練）",
  "就労移行支援",
  "就労継続支援A型",
  "就労継続支援B型",
  "就労定着支援",
  "自立生活援助",

  // 障害福祉サービス（相談支援）
  "計画相談支援",
  "地域移行支援",
  "地域定着支援",

  // 障害児通所支援
  "児童発達支援",
  "医療型児童発達支援",
  "放課後等デイサービス",
  "保育所等訪問支援",
  "居宅訪問型児童発達支援",

  // 障害児相談支援
  "障害児相談支援",

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
