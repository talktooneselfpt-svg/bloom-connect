'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getStaffByOrganization, retireStaff } from '@/lib/firestore/staff';
import { Staff, ROLES } from '@/types/staff';
import { exportToCSV, exportToHTML, printData, formatStaffForExport } from '@/lib/utils/export';

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

  // エクスポート処理
  const handleExportCSV = () => {
    const exportData = formatStaffForExport(filteredStaff);
    const timestamp = new Date().toISOString().split('T')[0];
    exportToCSV(exportData, `職員一覧_${timestamp}`, {
      '職員番号': '職員番号',
      '氏名（漢字）': '氏名（漢字）',
      '氏名（カナ）': '氏名（カナ）',
      'メールアドレス': 'メールアドレス',
      '電話番号': '電話番号',
      '職種': '職種',
      '役割': '役割',
      '状態': '状態',
      '登録日': '登録日',
    });
  };

  const handleExportHTML = () => {
    const exportData = formatStaffForExport(filteredStaff);
    const timestamp = new Date().toISOString().split('T')[0];
    exportToHTML(exportData, `職員一覧_${timestamp}`, '職員一覧', {
      '職員番号': '職員番号',
      '氏名（漢字）': '氏名（漢字）',
      '氏名（カナ）': '氏名（カナ）',
      'メールアドレス': 'メールアドレス',
      '電話番号': '電話番号',
      '職種': '職種',
      '役割': '役割',
      '状態': '状態',
      '登録日': '登録日',
    });
  };

  const handlePrint = () => {
    const exportData = formatStaffForExport(filteredStaff);
    printData(exportData, '職員一覧', {
      '職員番号': '職員番号',
      '氏名（漢字）': '氏名（漢字）',
      '氏名（カナ）': '氏名（カナ）',
      'メールアドレス': 'メールアドレス',
      '電話番号': '電話番号',
      '職種': '職種',
      '役割': '役割',
      '状態': '状態',
      '登録日': '登録日',
    });
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
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">職員一覧</h1>
                <button
                  onClick={() => router.push('/staff/new')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  + 新規登録
                </button>
              </div>

              {/* エクスポートボタン群 */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleExportCSV}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  CSV エクスポート
                </button>
                <button
                  onClick={handleExportHTML}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  HTML エクスポート
                </button>
                <button
                  onClick={handlePrint}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  印刷
                </button>
                <button
                  onClick={() => router.push('/staff/import')}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  CSV インポート
                </button>
              </div>
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
