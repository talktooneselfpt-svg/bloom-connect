import { Timestamp } from "firebase/firestore";

/**
 * エンドユーザー向けユーザー（スタッフ）型定義
 * Custom Claims認証方式に対応
 */
export interface UserDocument {
  uid: string; // Firebase Auth UID
  establishmentId: string; // 所属事業所ID (6桁の数字)
  staffId: string; // 表示用個人ID (5桁の英数字)
  name: string; // 氏名
  role: "admin" | "staff"; // 権限ロール
  jobType: string; // 職種 (看護師, 介護士 etc)

  // 管理用メタデータ
  createdAt: Timestamp;
  createdBy: string; // 作成した管理者のUID
  status: "active" | "suspended"; // アカウント状態
  updatedAt?: Timestamp;
  updatedBy?: string;
}

/**
 * Custom Claims（認証トークン内に埋め込まれる情報）
 */
export interface CustomClaims {
  eid: string; // establishmentId (6桁)
  role: "admin" | "staff"; // 権限ロール
  plan: "demo" | "free" | "paid"; // 事業所のプラン情報
  mustChangePassword?: boolean; // 初回ログイン・リセット時用フラグ
  admin?: boolean; // SuperAdmin フラグ
}

/**
 * ログインフォーム用の入力データ
 */
export interface LoginFormData {
  establishmentId: string; // 事業所ID (6桁)
  staffId: string; // 個人ID (5桁)
  password: string; // パスワード
}

/**
 * パスワード変更フォーム用の入力データ
 */
export interface PasswordChangeFormData {
  newPassword: string;
  confirmPassword: string;
}
