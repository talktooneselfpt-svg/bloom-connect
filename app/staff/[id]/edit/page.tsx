'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getStaff, updateStaff } from '@/lib/firestore/staff';
import { JOB_TYPES, POSITIONS, ROLES, EMPLOYMENT_TYPES, Staff } from '@/types/staff';
export default function EditStaffPage() {
  const router = useRouter();
  const params = useParams();
  const staffId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nameKanji: '',
    nameKana: '',
    jobType: '',
    position: '',
    role: '',
    department: '',
    employmentType: '',
    phoneCompany: '',
    phonePersonal: '',
    email: '',
    hireDate: '',
    licenseNumber: '',
    emergencyContact: '',
    memo: '',
  });

  useEffect(() => {
    loadStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffId]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const data = await getStaff(staffId);
      if (!data) {
        setError('職員が見つかりません');
        return;
      }

      setFormData({
        nameKanji: data.nameKanji,
        nameKana: data.nameKana,
        jobType: data.jobType,
        position: data.position,
        role: data.role,
        department: data.department || '',
        employmentType: data.employmentType || '',
        phoneCompany: data.phoneCompany,
        phonePersonal: data.phonePersonal || '',
        email: data.email,
        hireDate: data.hireDate || '',
        licenseNumber: data.licenseNumber || '',
        emergencyContact: data.emergencyContact || '',
        memo: data.memo || '',
      });
    } catch (err) {
      setError('職員情報の取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

      // メールアドレスの形式チェック
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('有効なメールアドレスを入力してください');
      }

      const currentUserId = 'temp-user-id'; // TODO: 実際のユーザーIDに置き換え

      // 任意フィールドの処理（空文字列の場合はプロパティ自体を含めない）
      const updateData: any = {
        nameKanji: formData.nameKanji,
        nameKana: formData.nameKana,
        jobType: formData.jobType,
        position: formData.position,
        role: formData.role,
        phoneCompany: formData.phoneCompany,
        email: formData.email,
        updatedBy: currentUserId,
      };

      // 任意フィールドが入力されている場合のみ追加
      if (formData.department?.trim()) {
        updateData.department = formData.department.trim();
      }
      if (formData.employmentType?.trim()) {
        updateData.employmentType = formData.employmentType.trim();
      }
      if (formData.phonePersonal?.trim()) {
        updateData.phonePersonal = formData.phonePersonal.trim();
      }
      if (formData.hireDate?.trim()) {
        updateData.hireDate = formData.hireDate.trim();
      }
      if (formData.licenseNumber?.trim()) {
        updateData.licenseNumber = formData.licenseNumber.trim();
      }
      if (formData.emergencyContact?.trim()) {
        updateData.emergencyContact = formData.emergencyContact.trim();
      }
      if (formData.memo?.trim()) {
        updateData.memo = formData.memo.trim();
      }

      await updateStaff(staffId, updateData);

      setSuccess(true);

      // 2秒後に詳細ページにリダイレクト
      setTimeout(() => {
        router.push(`/staff/${staffId}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '職員情報の更新に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">更新完了</h2>
          <p className="text-gray-600">職員情報の更新が完了しました。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">職員情報編集</h1>

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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="example@example.com"
              />
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
                {isSubmitting ? '更新中...' : '更新する'}
              </button>
              <button
                type="button"
                onClick={() => router.push(`/staff/${staffId}`)}
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
