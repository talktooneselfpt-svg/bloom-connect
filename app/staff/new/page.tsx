'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createStaffWithAuth } from '@/lib/auth/staff';
import { JOB_TYPES, JOB_CATEGORIES, POSITIONS, ROLES, EMPLOYMENT_TYPES } from '@/types/staff';
import { generateStaffEmail } from '@/lib/utils/email';
import { generateTemporaryPassword, generateStaffNumber } from '@/lib/utils/idGenerator';
import RouteGuard from '@/components/RouteGuard';

export default function NewStaffPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string>('');

  const [formData, setFormData] = useState({
    staffNumber: '',
    nameKanji: '',
    nameKana: '',
    jobTypes: [] as string[],
    position: '',
    role: '',
    department: '',
    employmentType: '',
    phoneCompany: '',
    phonePersonal: '',
    hireDate: '',
    licenseNumber: '',
    emergencyContact: '',
    memo: '',
  });

  // 初回マウント時にスタッフ番号を自動生成
  useEffect(() => {
    const number = generateStaffNumber();
    setFormData(prev => ({ ...prev, staffNumber: number }));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleJobTypeChange = (jobType: string) => {
    setFormData(prev => ({
      ...prev,
      jobTypes: prev.jobTypes.includes(jobType)
        ? prev.jobTypes.filter(j => j !== jobType)
        : [...prev.jobTypes, jobType]
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // バリデーション
      if (!formData.staffNumber) {
        throw new Error('個人番号は必須項目です');
      }
      if (!formData.nameKanji || !formData.nameKana) {
        throw new Error('氏名は必須項目です');
      }
      if (formData.jobTypes.length === 0) {
        throw new Error('職種は少なくとも1つ選択してください');
      }
      if (!formData.position) {
        throw new Error('役職は必須項目です');
      }
      if (!formData.role) {
        throw new Error('権限ロールは必須項目です');
      }

      // 一時パスワードを生成
      const tempPassword = generateTemporaryPassword();
      setTemporaryPassword(tempPassword);

      // 仮のデータ（実際にはログインユーザー情報を使用）
      const currentUserId = 'temp-user-id'; // TODO: 実際のユーザーIDに置き換え
      const organizationId = 'temp-org-id'; // TODO: 実際の組織IDに置き換え
      const organizationCode = 'ORG001'; // TODO: 実際の事業所コードに置き換え

      // メールアドレスを自動生成
      const email = generateStaffEmail(formData.staffNumber, organizationCode);

      // 任意フィールドの処理（空文字列の場合はプロパティ自体を含めない）
      const staffData: any = {
        organizationId,
        staffNumber: formData.staffNumber,
        nameKanji: formData.nameKanji,
        nameKana: formData.nameKana,
        jobTypes: formData.jobTypes,
        position: formData.position,
        role: formData.role,
        phoneCompany: formData.phoneCompany,
        email,
        isActive: true,
        passwordSetupCompleted: false, // 初回ログイン時にパスワード設定が必要
        createdBy: currentUserId,
        updatedBy: currentUserId,
      }

      // 任意フィールドが入力されている場合のみ追加
      if (formData.department?.trim()) {
        staffData.department = formData.department.trim()
      }
      if (formData.employmentType?.trim()) {
        staffData.employmentType = formData.employmentType.trim()
      }
      if (formData.phonePersonal?.trim()) {
        staffData.phonePersonal = formData.phonePersonal.trim()
      }
      if (formData.hireDate?.trim()) {
        staffData.hireDate = formData.hireDate.trim()
      }
      if (formData.licenseNumber?.trim()) {
        staffData.licenseNumber = formData.licenseNumber.trim()
      }
      if (formData.emergencyContact?.trim()) {
        staffData.emergencyContact = formData.emergencyContact.trim()
      }
      if (formData.memo?.trim()) {
        staffData.memo = formData.memo.trim()
      }

      // Firebase Auth でユーザーを作成し、Firestore に保存（一時パスワードを使用）
      await createStaffWithAuth(email, tempPassword, staffData);

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
      <RouteGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <div className="text-center mb-6">
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">登録完了</h2>
          <p className="text-gray-600 mb-6 text-center">職員の登録が完了しました。</p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-yellow-800 mb-2">一時パスワード</h3>
            <p className="text-xs text-yellow-700 mb-3">
              この一時パスワードを職員に伝えてください。初回ログイン時に新しいパスワードの設定が必要です。
            </p>
            <div className="bg-white rounded border border-yellow-300 p-3 font-mono text-lg text-center select-all">
              {temporaryPassword}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">ログイン情報</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><span className="font-medium">事業所番号:</span> ORG001</p>
              <p><span className="font-medium">職員番号:</span> {formData.staffNumber}</p>
              <p><span className="font-medium">氏名:</span> {formData.nameKanji}</p>
            </div>
          </div>

          <button
            onClick={() => router.push('/staff')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            職員一覧に戻る
          </button>
        </div>
      </div>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard>
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
            {/* 個人番号（職員番号） */}
            <div>
              <label htmlFor="staffNumber" className="block text-sm font-medium text-gray-700 mb-1">
                個人番号（職員番号） <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="staffNumber"
                name="staffNumber"
                value={formData.staffNumber}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-black cursor-not-allowed"
              />
              <p className="mt-1 text-sm text-red-600 font-medium">
                この個人番号は変更することができません
              </p>
            </div>

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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="やまだ たろう"
              />
            </div>

            {/* 職種（複数選択） */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                職種（複数選択可） <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-3">該当する職種・資格をすべて選択してください</p>
              <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-md p-4 bg-gray-50">
                {Object.entries(JOB_CATEGORIES).map(([category, jobs]) => (
                  <div key={category} className="mb-4 last:mb-0">
                    <h4 className="font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-300">
                      {category}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      {jobs.map(job => (
                        <label
                          key={job}
                          className="flex items-center space-x-2 hover:bg-white p-1 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.jobTypes.includes(job)}
                            onChange={() => handleJobTypeChange(job)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{job}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {formData.jobTypes.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    選択中: <span className="font-medium text-blue-600">{formData.jobTypes.length}件</span>
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.jobTypes.map(job => (
                      <span
                        key={job}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {job}
                        <button
                          type="button"
                          onClick={() => handleJobTypeChange(job)}
                          className="hover:text-blue-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              >
                <option value="">選択してください</option>
                {ROLES.map(role => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* 所属部署 */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                所属部署（任意）
              </label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="例: 訪問介護部"
              />
            </div>

            {/* 勤務形態 */}
            <div>
              <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700 mb-1">
                勤務形態（任意）
              </label>
              <select
                id="employmentType"
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              >
                <option value="">選択してください</option>
                {EMPLOYMENT_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* 会社用電話番号 */}
            <div>
              <label htmlFor="phoneCompany" className="block text-sm font-medium text-gray-700 mb-1">
                会社用電話番号（任意）
              </label>
              <input
                type="tel"
                id="phoneCompany"
                name="phoneCompany"
                value={formData.phoneCompany}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="090-1234-5678"
              />
            </div>

            {/* 一時パスワード自動生成の案内 */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-700">
                <span className="font-semibold">パスワードについて:</span> 一時パスワードは自動生成されます。登録完了後に表示されますので、職員に伝えてください。職員は初回ログイン時に新しいパスワードを設定します。
              </p>
            </div>

            {/* 入社日 */}
            <div>
              <label htmlFor="hireDate" className="block text-sm font-medium text-gray-700 mb-1">
                入社日（任意）
              </label>
              <input
                type="date"
                id="hireDate"
                name="hireDate"
                value={formData.hireDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>

            {/* 資格番号 */}
            <div>
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                資格番号（任意）
              </label>
              <input
                type="text"
                id="licenseNumber"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="例: 12345678"
              />
            </div>

            {/* 緊急連絡先 */}
            <div>
              <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-1">
                緊急連絡先（任意）
              </label>
              <input
                type="text"
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="例: 090-XXXX-XXXX（家族）"
              />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
    </RouteGuard>
  );
}
