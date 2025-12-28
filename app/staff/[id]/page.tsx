export function generateStaticParams() {
  return []
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getStaff } from '@/lib/firestore/staff';
import { Staff } from '@/types/staff';
export default function StaffDetailPage() {
  const router = useRouter();
  const params = useParams();
  const staffId = params.id as string;

  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStaff();
  }, [staffId]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const data = await getStaff(staffId);
      if (!data) {
        setError('職員が見つかりません');
      } else {
        setStaff(data);
      }
    } catch (err) {
      setError('職員情報の取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
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

  if (error || !staff) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded">
          {error || '職員が見つかりません'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md">
          {/* ヘッダー */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">職員詳細</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/staff/${staffId}/edit`)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  編集
                </button>
                <button
                  onClick={() => router.push('/staff')}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  一覧に戻る
                </button>
              </div>
            </div>
          </div>

          {/* 基本情報 */}
          <div className="px-6 py-6 space-y-6">
            {/* 在職状態 */}
            <div className="flex items-center gap-2">
              {staff.isActive ? (
                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                  在職中
                </span>
              ) : (
                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
                  退職済み
                </span>
              )}
            </div>

            {/* 氏名 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  氏名（漢字）
                </label>
                <p className="text-lg font-semibold text-gray-900">{staff.nameKanji}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  氏名（ひらがな）
                </label>
                <p className="text-lg text-gray-900">{staff.nameKana}</p>
              </div>
            </div>

            {/* 職種・役職・権限 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  職種
                </label>
                <p className="text-gray-900">{staff.jobType}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  役職
                </label>
                <p className="text-gray-900">{staff.position}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  権限ロール
                </label>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {staff.role}
                </span>
              </div>
            </div>

            {/* 所属部署・勤務形態 */}
            {(staff.department || staff.employmentType) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {staff.department && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      所属部署
                    </label>
                    <p className="text-gray-900">{staff.department}</p>
                  </div>
                )}
                {staff.employmentType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      勤務形態
                    </label>
                    <p className="text-gray-900">{staff.employmentType}</p>
                  </div>
                )}
              </div>
            )}

            {/* 連絡先 */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">連絡先</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    会社用電話番号
                  </label>
                  <p className="text-gray-900">{staff.phoneCompany}</p>
                </div>
                {staff.phonePersonal && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      個人用電話番号
                    </label>
                    <p className="text-gray-900">{staff.phonePersonal}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メールアドレス
                  </label>
                  <p className="text-gray-900">{staff.email}</p>
                </div>
                {staff.emergencyContact && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      緊急連絡先
                    </label>
                    <p className="text-gray-900">{staff.emergencyContact}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 勤務情報 */}
            {(staff.hireDate || staff.retireDate || staff.licenseNumber) && (
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">勤務情報</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {staff.hireDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        入社日
                      </label>
                      <p className="text-gray-900">{staff.hireDate}</p>
                    </div>
                  )}
                  {staff.retireDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        退職日
                      </label>
                      <p className="text-gray-900">{staff.retireDate}</p>
                    </div>
                  )}
                  {staff.licenseNumber && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        資格番号
                      </label>
                      <p className="text-gray-900">{staff.licenseNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* メモ */}
            {staff.memo && (
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">メモ</h2>
                <p className="text-gray-900 whitespace-pre-wrap">{staff.memo}</p>
              </div>
            )}

            {/* システム情報 */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">システム情報</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    作成日時
                  </label>
                  <p className="text-gray-600">{new Date(staff.createdAt).toLocaleString('ja-JP')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    更新日時
                  </label>
                  <p className="text-gray-600">{new Date(staff.updatedAt).toLocaleString('ja-JP')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    作成者
                  </label>
                  <p className="text-gray-600">{staff.createdBy}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    更新者
                  </label>
                  <p className="text-gray-600">{staff.updatedBy}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
