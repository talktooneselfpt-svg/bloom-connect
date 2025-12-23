'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createStaffWithAuth } from '@/lib/auth/staff';
import { JOB_TYPES, POSITIONS, ROLES, EMPLOYMENT_TYPES } from '@/types/staff';
import { generateStaffEmail } from '@/lib/utils/email';

export default function NewStaffPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    staffNumber: '',
    nameKanji: '',
    nameKana: '',
    jobType: '',
    position: '',
    role: '',
    department: '',
    employmentType: '',
    phoneCompany: '',
    phonePersonal: '',
    password: '',
    hireDate: '',
    licenseNumber: '',
    emergencyContact: '',
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
      if (!formData.staffNumber) {
        throw new Error('個人番号は必須項目です');
      }
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
      if (!formData.password) {
        throw new Error('パスワードは必須項目です');
      }

      // パスワードの長さチェック
      if (formData.password.length < 6) {
        throw new Error('パスワードは6文字以上で設定してください');
      }

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
        jobType: formData.jobType,
        position: formData.position,
        role: formData.role,
        phoneCompany: formData.phoneCompany,
        email,
        isActive: true,
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

      // Firebase Auth でユーザーを作成し、Firestore に保存
      await createStaffWithAuth(email, formData.password, staffData);

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
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="例: 001"
              />
              <p className="mt-1 text-sm text-gray-500">
                ログイン時に使用する個人番号を入力してください
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
                会社用電話番号 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phoneCompany"
                name="phoneCompany"
                value={formData.phoneCompany}
                onChange={handleChange}
                required
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="6文字以上"
              />
              <p className="mt-1 text-sm text-gray-500">
                ログイン用のパスワード（6文字以上）
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
  );
}
