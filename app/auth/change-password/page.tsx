'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { updateStaff } from '@/lib/firestore/staff';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { staff, uid } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const isInitialSetup = staff?.passwordSetupCompleted === false;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // バリデーション
      if (!isInitialSetup && !formData.currentPassword) {
        throw new Error('現在のパスワードを入力してください');
      }

      if (!formData.newPassword) {
        throw new Error('新しいパスワードを入力してください');
      }

      if (formData.newPassword.length < 8) {
        throw new Error('パスワードは8文字以上で入力してください');
      }

      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error('新しいパスワードが一致しません');
      }

      const user = auth.currentUser;
      if (!user || !uid || !staff) {
        throw new Error('ユーザー情報が見つかりません');
      }

      // 初回セットアップでない場合は、現在のパスワードで再認証
      if (!isInitialSetup) {
        const credential = EmailAuthProvider.credential(
          user.email!,
          formData.currentPassword
        );
        await reauthenticateWithCredential(user, credential);
      }

      // パスワードを更新
      await updatePassword(user, formData.newPassword);

      // passwordSetupCompletedフラグを更新
      if (isInitialSetup) {
        await updateStaff(uid, {
          passwordSetupCompleted: true,
          updatedBy: uid,
        });
      }

      setSuccess(true);

      // 2秒後にホームページにリダイレクト
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err: any) {
      console.error('パスワード変更エラー:', err);

      if (err.code === 'auth/wrong-password') {
        setError('現在のパスワードが間違っています');
      } else if (err.code === 'auth/weak-password') {
        setError('パスワードが弱すぎます');
      } else if (err.code === 'auth/requires-recent-login') {
        setError('セキュリティのため、再度ログインしてください');
      } else {
        setError(err.message || 'パスワードの変更に失敗しました');
      }

      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            パスワードを変更しました
          </h2>
          <p className="text-gray-600">
            ホームページにリダイレクトしています...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isInitialSetup ? '初回パスワード設定' : 'パスワード変更'}
          </h1>
          <p className="text-gray-600">
            {isInitialSetup
              ? '初回ログインのため、パスワードを設定してください'
              : '新しいパスワードを設定してください'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isInitialSetup && (
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                現在のパスワード <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="現在のパスワードを入力"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              新しいパスワード <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              minLength={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="8文字以上で入力"
            />
            <p className="text-xs text-gray-500 mt-1">
              8文字以上で入力してください
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              新しいパスワード（確認） <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="もう一度入力"
            />
          </div>

          <div className="flex gap-3">
            {!isInitialSetup && (
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                キャンセル
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '変更中...' : isInitialSetup ? 'パスワードを設定' : 'パスワードを変更'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
