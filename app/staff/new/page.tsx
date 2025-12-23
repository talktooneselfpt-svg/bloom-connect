'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createStaffWithAuth } from '@/lib/auth/staff';
import { JOB_TYPES, POSITIONS, ROLES } from '@/types/staff';

export default function NewStaffPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nameKanji: '',
    nameKana: '',
    jobType: '',
    position: '',
    role: '',
    phoneCompany: '',
    phonePersonal: '',
    email: '',
    password: '',
    memo: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // バリデーション
      if (!formData.nameKanji || !formData.nameKana) {
        throw new Error('氏名は必須項目です');
      }
      if (!formData.jobType) {
        throw new Error('職種は必須項目です');
      }
      if (!formData.position) {
        throw new Error('役職は必須項目です');
      }
      if (!formData.role) {
        throw new Error('権限ロールは必須項目です');
      }
      if (!formData.phoneCompany) {
        throw new Error('会社用電話番号は必須項目です');
      }
      if (!formData.email) {
        throw new Error('メールアドレスは必須項目です');
      }
      if (!formData.password) {
        throw new Error('パスワードは必須項目です');
      }

      // メールアドレスの形式チェック
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('有効なメールアドレスを入力してください');
      }

      // パスワードの長さチェック
      if (formData.password.length < 6) {
        throw new Error('パスワードは6文字以上で設定してください');
      }

      // 仮のデータ（実際にはログインユーザー情報を使用）
      const currentUserId = 'temp-user-id'; // TODO: 実際のユーザーIDに置き換え
      const organizationId = 'temp-org-id'; // TODO: 実際の組織IDに置き換え

      // Firebase Auth でユーザーを作成し、Firestore に保存
      await createStaffWithAuth(
        formData.email,
        formData.password,
        {
          organizationId,
          nameKanji: formData.nameKanji,
          nameKana: formData.nameKana,
          jobType: formData.jobType,
          position: formData.position,
          role: formData.role,
          phoneCompany: formData.phoneCompany,
          phonePersonal: formData.phonePersonal || undefined,
          email: formData.email,
          isActive: true,
          memo: formData.memo || undefined,
          createdBy: currentUserId,
          updatedBy: currentUserId,
        }
      );

      setSuccess(true);

      // 3秒後に一覧ページにリダイレクト（一覧ページは別途作成が必要）
      setTimeout(() => {
        router.push('/staff');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '職員の登録に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-green-500"
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">登録完了</h2>
          <p className="text-gray-600">職員の登録が完了しました。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">職員登録</h1>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 氏名（漢字） */}
            <div>
              <label htmlFor="nameKanji" className="block text-sm font-medium text-gray-700 mb-1">
                氏名（漢字） <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nameKanji"
                name="nameKanji"
                value={formData.nameKanji}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="山田 太郎"
              />
            </div>

            {/* 氏名（ひらがな） */}
            <div>
              <label htmlFor="nameKana" className="block text-sm font-medium text-gray-700 mb-1">
                氏名（ひらがな） <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nameKana"
                name="nameKana"
                value={formData.nameKana}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="やまだ たろう"
              />
            </div>

            {/* 職種 */}
            <div>
              <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-1">
                職種 <span className="text-red-500">*</span>
              </label>
              <select
                id="jobType"
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                {JOB_TYPES.map(jobType => (
                  <option key={jobType} value={jobType}>
                    {jobType}
                  </option>
                ))}
              </select>
            </div>

            {/* 役職 */}
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                役職 <span className="text-red-500">*</span>
              </label>
              <select
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                {POSITIONS.map(position => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>

            {/* 権限ロール */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                権限ロール <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                {ROLES.map(role => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* 会社用電話番号 */}
            <div>
              <label htmlFor="phoneCompany" className="block text-sm font-medium text-gray-700 mb-1">
                会社用電話番号 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phoneCompany"
                name="phoneCompany"
                value={formData.phoneCompany}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="03-1234-5678"
              />
            </div>

            {/* 個人用電話番号 */}
            <div>
              <label htmlFor="phonePersonal" className="block text-sm font-medium text-gray-700 mb-1">
                個人用電話番号（任意）
              </label>
              <input
                type="tel"
                id="phonePersonal"
                name="phonePersonal"
                value={formData.phonePersonal}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="090-1234-5678"
              />
            </div>

            {/* メールアドレス */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="example@example.com"
              />
            </div>

            {/* パスワード */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                パスワード <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="6文字以上"
              />
              <p className="mt-1 text-sm text-gray-500">
                ログイン用のパスワード（6文字以上）
              </p>
            </div>

            {/* メモ */}
            <div>
              <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-1">
                メモ（任意）
              </label>
              <textarea
                id="memo"
                name="memo"
                value={formData.memo}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="備考やメモを入力してください"
              />
            </div>

            {/* 送信ボタン */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? '登録中...' : '登録する'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
