'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getOrganizationByCode, getStaffByNumber, getTrustedDevice, registerTrustedDevice, updateDeviceLastUsed } from '@/lib/firestore/auth';
import { getOrCreateDeviceId, generateDeviceFingerprint, hashPin, verifyPin, isBiometricAvailable, authenticateWithBiometric } from '@/lib/auth/device';

type LoginMode = 'full' | 'pin' | 'biometric';

export default function LoginPage() {
  const router = useRouter();
  const [loginMode, setLoginMode] = useState<LoginMode>('full');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [trustedDevice, setTrustedDevice] = useState<any>(null);

  // 完全認証用
  const [fullAuthData, setFullAuthData] = useState({
    organizationCode: '',
    staffNumber: '',
    password: '',
    rememberDevice: false,
  });

  // PIN認証用
  const [pin, setPin] = useState('');

  useEffect(() => {
    checkTrustedDevice();
  }, []);

  const checkTrustedDevice = async () => {
    try {
      const devId = getOrCreateDeviceId();
      setDeviceId(devId);

      const device = await getTrustedDevice(devId);
      if (device) {
        setTrustedDevice(device);
        // PINまたは生体認証が利用可能
        if (device.biometricEnabled && isBiometricAvailable()) {
          setLoginMode('biometric');
        } else if (device.pinHash) {
          setLoginMode('pin');
        }
      }
    } catch (error) {
      console.error('デバイス確認エラー:', error);
    }
  };

  const handleFullAuth = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // 1. 事業所番号から組織を検索
      const organization = await getOrganizationByCode(fullAuthData.organizationCode);
      if (!organization) {
        throw new Error('事業所番号が正しくありません');
      }

      // 2. 組織ID + 個人番号から職員を検索
      const staff = await getStaffByNumber(organization.id, fullAuthData.staffNumber);
      if (!staff) {
        throw new Error('個人番号が正しくありません');
      }

      if (!staff.isActive) {
        throw new Error('このアカウントは無効化されています');
      }

      // 3. Firebase Authentication でログイン
      const userCredential = await signInWithEmailAndPassword(auth, staff.email, fullAuthData.password);

      // 4. パスワード設定完了フラグをチェック
      const staffDoc = await getDoc(doc(db, 'staff', userCredential.user.uid));
      const staffData = staffDoc.data();

      if (staffData && !staffData.passwordSetupCompleted) {
        // 初回ログイン - パスワード設定ページにリダイレクト
        router.push('/auth/setup-password');
        return;
      }

      // 5. デバイスを信頼済みとして登録（チェックボックスがONの場合）
      if (fullAuthData.rememberDevice && deviceId) {
        const fingerprint = generateDeviceFingerprint();
        await registerTrustedDevice({
          id: deviceId,
          staffUid: staff.uid,
          organizationId: organization.id,
          deviceName: navigator.userAgent.substring(0, 50),
          deviceFingerprint: fingerprint,
          biometricEnabled: false,
        });
      }

      // 6. ホームページにリダイレクト
      router.push('/staff');
    } catch (err: any) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('パスワードが正しくありません');
      } else {
        setError(err.message || 'ログインに失敗しました');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePinAuth = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!trustedDevice || !trustedDevice.pinHash) {
        throw new Error('PINが設定されていません');
      }

      // PINを検証
      const isValid = await verifyPin(pin, trustedDevice.pinHash);
      if (!isValid) {
        throw new Error('PINが正しくありません');
      }

      // デバイスの最終使用日時を更新
      await updateDeviceLastUsed(deviceId!);

      // TODO: 自動ログイン処理（Firebase Auth のカスタムトークンを使用）
      // 現時点では仮実装
      router.push('/staff');
    } catch (err: any) {
      setError(err.message || 'PIN認証に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBiometricAuth = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      if (!trustedDevice || !trustedDevice.credentialId) {
        throw new Error('生体認証が設定されていません');
      }

      // 生体認証を実行
      const isAuthenticated = await authenticateWithBiometric(trustedDevice.credentialId);
      if (!isAuthenticated) {
        throw new Error('生体認証に失敗しました');
      }

      // デバイスの最終使用日時を更新
      await updateDeviceLastUsed(deviceId!);

      // TODO: 自動ログイン処理（Firebase Auth のカスタムトークンを使用）
      router.push('/staff');
    } catch (err: any) {
      setError(err.message || '生体認証に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* ロゴ・タイトル */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bloom Connect</h1>
          <p className="text-gray-600">職員管理システム</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* タブ切り替え */}
        {trustedDevice && (
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            {trustedDevice.pinHash && (
              <button
                onClick={() => setLoginMode('pin')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  loginMode === 'pin'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                PIN
              </button>
            )}
            {trustedDevice.biometricEnabled && isBiometricAvailable() && (
              <button
                onClick={() => setLoginMode('biometric')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  loginMode === 'biometric'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                生体認証
              </button>
            )}
            <button
              onClick={() => setLoginMode('full')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                loginMode === 'full'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              通常
            </button>
          </div>
        )}

        {/* 完全認証フォーム */}
        {loginMode === 'full' && (
          <form onSubmit={handleFullAuth} className="space-y-4">
            <div>
              <label htmlFor="organizationCode" className="block text-sm font-medium text-gray-700 mb-1">
                事業所番号
              </label>
              <input
                type="text"
                id="organizationCode"
                value={fullAuthData.organizationCode}
                onChange={(e) => setFullAuthData({ ...fullAuthData, organizationCode: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="例: 1234567890"
              />
            </div>

            <div>
              <label htmlFor="staffNumber" className="block text-sm font-medium text-gray-700 mb-1">
                個人番号（職員番号）
              </label>
              <input
                type="text"
                id="staffNumber"
                value={fullAuthData.staffNumber}
                onChange={(e) => setFullAuthData({ ...fullAuthData, staffNumber: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="例: 001"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <input
                type="password"
                id="password"
                value={fullAuthData.password}
                onChange={(e) => setFullAuthData({ ...fullAuthData, password: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="パスワードを入力"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberDevice"
                checked={fullAuthData.rememberDevice}
                onChange={(e) => setFullAuthData({ ...fullAuthData, rememberDevice: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberDevice" className="ml-2 block text-sm text-gray-700">
                このデバイスを信頼する（次回からPIN/生体認証でログイン可能）
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              )}
              {isSubmitting ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>
        )}

        {/* PIN認証フォーム */}
        {loginMode === 'pin' && (
          <form onSubmit={handlePinAuth} className="space-y-4">
            <div className="text-center mb-6">
              <p className="text-gray-600">PINを入力してください</p>
              {trustedDevice && (
                <p className="text-sm text-gray-500 mt-1">
                  デバイス: {trustedDevice.deviceName}
                </p>
              )}
            </div>

            <div>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-center text-2xl tracking-widest"
                placeholder="••••"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || pin.length < 4}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? '認証中...' : 'ログイン'}
            </button>
          </form>
        )}

        {/* 生体認証 */}
        {loginMode === 'biometric' && (
          <div className="text-center space-y-6">
            <div className="mb-6">
              <p className="text-gray-600 mb-2">生体認証でログイン</p>
              {trustedDevice && (
                <p className="text-sm text-gray-500">
                  デバイス: {trustedDevice.deviceName}
                </p>
              )}
            </div>

            <button
              onClick={handleBiometricAuth}
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-4 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
              {isSubmitting ? '認証中...' : '顔認証 / 指紋認証でログイン'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
