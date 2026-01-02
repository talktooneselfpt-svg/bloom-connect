import { Timestamp } from "firebase/firestore";

/**
 * 事業所情報の型定義
 */
export interface Establishment {
  id: string; // Firestore ドキュメントID
  establishmentId: string; // 6桁の事業所番号（ログイン用）
  name: string; // 事業所名
  nameKana?: string; // 事業所名（ひらがな）

  // プラン情報
  plan: "demo" | "free" | "paid"; // プラン種別
  staffLimit: number; // スタッフ登録上限数
  contractedApps: string[]; // 契約中のアプリID一覧

  // 業種・業態
  businessTypes: string[]; // 業種（訪問看護、訪問介護など）

  // 基本情報
  postalCode?: string; // 郵便番号
  address?: string; // 住所
  phone?: string; // 電話番号
  email?: string; // 代表メールアドレス

  // 管理情報
  isActive: boolean; // 有効状態
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  createdBy: string; // 作成者UID
  updatedBy?: string; // 更新者UID
}

/**
 * 業種一覧（医療・介護・福祉）
 */
export const BUSINESS_TYPES = [
  // 医療系
  "病院",
  "診療所（クリニック）",
  "歯科診療所",
  "訪問看護ステーション",
  "訪問診療",

  // 介護系
  "訪問介護（ホームヘルプサービス）",
  "通所介護（デイサービス）",
  "通所リハビリテーション（デイケア）",
  "短期入所生活介護（ショートステイ）",
  "特別養護老人ホーム（特養）",
  "介護老人保健施設（老健）",
  "グループホーム（認知症対応型共同生活介護）",
  "小規模多機能型居宅介護",
  "居宅介護支援事業所（ケアマネ）",
  "サービス付き高齢者向け住宅",
  "有料老人ホーム",

  // 障がい福祉系
  "居宅介護（障がい者ホームヘルプ）",
  "重度訪問介護",
  "就労継続支援A型",
  "就労継続支援B型",
  "就労移行支援",
  "生活介護",
  "共同生活援助（グループホーム）",
  "相談支援事業所",

  // 児童福祉系
  "放課後等デイサービス",
  "児童発達支援",
  "保育所",
  "認定こども園",

  // その他
  "その他",
] as const;

/**
 * プラン別の料金体系
 */
export const PLAN_PRICING = {
  demo: {
    name: "デモプラン",
    price: 0,
    staffLimit: 0,
    features: ["全機能閲覧可", "登録・編集不可"],
  },
  free: {
    name: "無料プラン",
    price: 0,
    staffLimit: 0,
    features: ["全機能閲覧可", "スタッフ・利用者の追加不可"],
  },
  paid: {
    name: "有料プラン",
    basePrice: 2000, // 基本料金（20名まで）
    basePriceStaffLimit: 20,
    additionalStaffPrice: 1500, // 10名追加ごと
    additionalStaffUnit: 10,
    features: ["全機能利用可", "アプリごとの追加料金あり"],
  },
} as const;

/**
 * アプリ一覧と料金
 */
export interface AppInfo {
  id: string;
  name: string;
  description: string;
  price: number; // 月額料金
  icon?: string; // アイコンURL
  category: string; // カテゴリ
}

export const AVAILABLE_APPS: AppInfo[] = [
  {
    id: "incident-report",
    name: "ヒヤリハット",
    description: "ヒヤリハット報告の作成・管理",
    price: 1000,
    category: "安全管理",
  },
  {
    id: "shift-management",
    name: "シフト作成・管理（AI使用）",
    description: "AIを活用したシフト自動作成と管理",
    price: 10000,
    category: "勤怠管理",
  },
  // 今後追加予定のアプリをここに追加
];
