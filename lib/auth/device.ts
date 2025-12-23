/**
 * デバイス認証関連の関数
 */

/**
 * デバイスフィンガープリントを生成
 * ブラウザの情報からユニークなIDを生成
 */
export function generateDeviceFingerprint(): string {
  const navigator = window.navigator;
  const screen = window.screen;

  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
  ].join('|');

  // 簡易的なハッシュ生成（実際にはもっと堅牢なハッシュ関数を使用すべき）
  return btoa(fingerprint).substring(0, 32);
}

/**
 * デバイスIDを取得または生成
 */
export function getOrCreateDeviceId(): string {
  const DEVICE_ID_KEY = 'bloom_device_id';

  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
}

/**
 * PINをハッシュ化
 * @param pin PIN（4〜6桁）
 * @returns ハッシュ化されたPIN
 */
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * PINを検証
 * @param pin 入力されたPIN
 * @param pinHash 保存されているPINハッシュ
 * @returns 一致するかどうか
 */
export async function verifyPin(pin: string, pinHash: string): Promise<boolean> {
  const inputHash = await hashPin(pin);
  return inputHash === pinHash;
}

/**
 * 生体認証が利用可能かチェック
 */
export function isBiometricAvailable(): boolean {
  return !!(
    window.PublicKeyCredential &&
    navigator.credentials &&
    navigator.credentials.create
  );
}

/**
 * 生体認証を登録（WebAuthn）
 */
export async function registerBiometric(
  userId: string,
  userName: string
): Promise<string | null> {
  if (!isBiometricAvailable()) {
    throw new Error('このデバイスでは生体認証が利用できません');
  }

  try {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'Bloom Connect',
        id: window.location.hostname,
      },
      user: {
        id: new TextEncoder().encode(userId),
        name: userName,
        displayName: userName,
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },  // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
      },
      timeout: 60000,
      attestation: 'none',
    };

    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    }) as PublicKeyCredential;

    if (!credential) {
      return null;
    }

    // Credential IDを返す
    const credentialId = btoa(
      String.fromCharCode(...new Uint8Array(credential.rawId))
    );

    return credentialId;
  } catch (error) {
    console.error('生体認証の登録に失敗しました:', error);
    throw error;
  }
}

/**
 * 生体認証で認証（WebAuthn）
 */
export async function authenticateWithBiometric(
  credentialId: string
): Promise<boolean> {
  if (!isBiometricAvailable()) {
    throw new Error('このデバイスでは生体認証が利用できません');
  }

  try {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    // Base64をArrayBufferに変換
    const rawId = Uint8Array.from(atob(credentialId), c => c.charCodeAt(0));

    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      allowCredentials: [
        {
          id: rawId,
          type: 'public-key',
          transports: ['internal'],
        },
      ],
      timeout: 60000,
      userVerification: 'required',
    };

    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    });

    return !!assertion;
  } catch (error) {
    console.error('生体認証に失敗しました:', error);
    return false;
  }
}
