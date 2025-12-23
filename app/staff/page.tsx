'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getStaffByOrganization, retireStaff } from '@/lib/firestore/staff';
import { Staff, ROLES } from '@/types/staff';

export default function StaffListPage() {
  const router = useRouter();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // フィルター・検索用のstate
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('active');
  const [filterRole, setFilterRole] = useState<string>('all');

  useEffect(() => {
    loadStaffList();
  }, []);

  const loadStaffList = async () => {
    try {
      setLoading(true);
      // TODO: 実際の組織IDに置き換え
      const organizationId = 'temp-org-id';
      const data = await getStaffByOrganization(organizationId);
      setStaffList(data);
    } catch (err) {
      setError('職員一覧の取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetire = async (staffId: string) => {
    if (!confirm('この職員を退職状態にしますか？')) {
      return;
    }

    try {
      const retireDate = new Date().toISOString().split('T')[0];
      const currentUserId = 'temp-user-id'; // TODO: 実際のユーザーIDに置き換え
      await retireStaff(staffId, retireDate, currentUserId);
      await loadStaffList();
    } catch (err) {
      alert('退職処理に失敗しました');
      console.error(err);
    }
  };

  // 検索・フィルタリング処理
  const filteredStaff = useMemo(() => {
    return staffList.filter(staff => {
      // 在職状態フィルター
      if (filterActive === 'active' && !staff.isActive) return false;
      if (filterActive === 'inactive' && staff.isActive) return false;

      // ロールフィルター
      if (filterRole !== 'all' && staff.role !== filterRole) return false;

      // 検索フィルター（名前、職種、役職で検索）
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchName = staff.nameKanji.toLowerCase().includes(term) ||
                          staff.nameKana.toLowerCase().includes(term);
        const matchJob = staff.jobType.toLowerCase().includes(term);
        const matchPosition = staff.position.toLowerCase().includes(term);
        const matchEmail = staff.email.toLowerCase().includes(term);

        if (!matchName && !matchJob && !matchPosition && !matchEmail) return false;
      }

      return true;
    });
  }, [staffList, searchTerm, filterActive, filterRole]);

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md">
          {/* ヘッダー */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">職員一覧</h1>
              <button
                onClick={() => router.push('/staff/new')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                + 新規登録
              </button>
            </div>
          </div>

          {/* 検索・フィルター */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 space-y-4">
            {/* 検索バー */}
            <div>
              <input
                type="text"
                placeholder="名前、職種、役職、メールアドレスで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>

            {/* フィルター */}
            <div className="flex flex-wrap gap-4">
              {/* 在職状態フィルター */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">在職状態:</label>
                <select
                  value={filterActive}
                  onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
                  className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
                >
                  <option value="all">すべて</option>
                  <option value="active">在職中</option>
                  <option value="inactive">退職済み</option>
                </select>
              </div>

              {/* ロールフィルター */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">権限:</label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
                >
                  <option value="all">すべて</option>
                  {ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {/* 結果数表示 */}
              <div className="flex items-center ml-auto">
                <span className="text-sm text-gray-600">
                  {filteredStaff.length}件 / {staffList.length}件
                </span>
              </div>
            </div>
          </div>

          {/* テーブル */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    氏名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    職種
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    役職
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    権限
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    電話番号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    メール
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状態
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStaff.map((staff) => (
                  <tr
                    key={staff.uid}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/staff/${staff.uid}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{staff.nameKanji}</div>
                      <div className="text-sm text-gray-500">{staff.nameKana}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {staff.jobType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {staff.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {staff.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {staff.phoneCompany}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {staff.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {staff.isActive ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          在職中
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          退職
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => router.push(`/staff/${staff.uid}/edit`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          編集
                        </button>
                        {staff.isActive && (
                          <button
                            onClick={() => handleRetire(staff.uid)}
                            className="text-red-600 hover:text-red-900"
                          >
                            退職処理
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStaff.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">
                {searchTerm || filterRole !== 'all' || filterActive !== 'active'
                  ? '検索条件に一致する職員が見つかりません'
                  : '職員が登録されていません'}
              </p>
              {!searchTerm && filterRole === 'all' && filterActive === 'active' && (
                <button
                  onClick={() => router.push('/staff/new')}
                  className="mt-4 text-blue-600 hover:text-blue-800"
                >
                  最初の職員を登録する
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
