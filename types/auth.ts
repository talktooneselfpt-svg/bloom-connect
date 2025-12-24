/**
 * 認証関連の型定義
 */

/**
 * 信頼済みデバイスの情報
 */
export interface TrustedDevice {
  /** デバイスID */
  id: string;
  /** 職員UID */
  staffUid: string;
  /** 組織ID */
  organizationId: string;
  /** デバイス名 */
  deviceName: string;
  /** デバイスフィンガープリント */
  deviceFingerprint: string;
  /** PIN（ハッシュ化） */
  pinHash?: string;
  /** 生体認証が有効かどうか */
  biometricEnabled: boolean;
  /** WebAuthn Credential ID */
  credentialId?: string;
  /** 最終使用日時 */
  lastUsedAt: string;
  /** 作成日時 */
  createdAt: string;
  /** 有効期限（例: 30日後に再認証） */
  expiresAt?: string;
}

/**
 * ログイン認証情報（完全認証用）
 */
export interface LoginCredentials {
  /** 事業所番号 */
  organizationCode: string;
  /** 個人番号（職員番号） */
  staffNumber: string;
  /** パスワード */
  password: string;
}

/**
 * PIN認証情報（簡易認証用）
 */
export interface PinCredentials {
  /** PIN（4〜6桁） */
  pin: string;
  /** デバイスID */
  deviceId: string;
}

/**
 * 認証タイプ
 */
export type AuthType = 'full' | 'pin' | 'biometric';

/**
 * 認証状態
 */
export interface AuthState {
  /** 認証済みかどうか */
  isAuthenticated: boolean;
  /** ログイン中のユーザー */
  user: {
    uid: string;
    staffNumber: string;
    nameKanji: string;
    organizationId: string;
    role: string;
  } | null;
  /** 信頼済みデバイスかどうか */
  isTrustedDevice: boolean;
  /** デバイスID */
  deviceId: string | null;
  /** 読み込み中 */
  loading: boolean;
}
