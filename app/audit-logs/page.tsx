"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface AuditLog {
  id: string
  timestamp: string
  user: string
  action: string
  resource: string
  details: string
  ipAddress: string
}

export default function AuditLogsPage() {
  const router = useRouter()
  const [filters, setFilters] = useState({
    keyword: "",
    startDate: "",
    endDate: "",
    user: "",
    action: "",
    resourceType: ""
  })

  // サンプルデータ
  const auditLogs: AuditLog[] = [
    {
      id: "1",
      timestamp: "2025/1/15 10:30:00",
      user: "山田太郎",
      action: "作成",
      resource: "職員",
      details: "鈴木花子",
      ipAddress: "192.168.1.100"
    }
  ]

  const stats = {
    totalLogs: 5,
    uniqueUsers: 3,
    topAction: "create",
    topActionCount: 1,
    mostActiveUser: "山田太郎",
    mostActiveUserCount: 2
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleReset = () => {
    setFilters({
      keyword: "",
      startDate: "",
      endDate: "",
      user: "",
      action: "",
      resourceType: ""
    })
  }

  const handleExportCSV = () => {
    // CSVエクスポート処理
    alert("CSV形式でエクスポートします")
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-2">
          <button
            onClick={() => router.push("/")}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            ダッシュボードに戻る
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">監査ログ・アクティビティログ</h1>
          <p className="text-gray-600">操作履歴を確認し、コンプライアンスとセキュリティを確保します</p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm text-gray-600 mb-1">総ログ数</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalLogs}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm text-gray-600 mb-1">ユニークユーザー</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.uniqueUsers}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm text-gray-600 mb-1">最多操作</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.topAction}</p>
            <p className="text-sm text-gray-600">{stats.topActionCount}件</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm text-gray-600 mb-1">最もアクティブ</h3>
            <p className="text-xl font-bold text-gray-900">{stats.mostActiveUser}</p>
            <p className="text-sm text-gray-600">{stats.mostActiveUserCount}件</p>
          </div>
        </div>

        {/* フィルター・検索 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">フィルター・検索</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* キーワード検索 */}
            <div>
              <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">
                キーワード検索
              </label>
              <input
                type="text"
                id="keyword"
                name="keyword"
                value={filters.keyword}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="検索..."
              />
            </div>

            {/* 開始日 */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                開始日
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>

            {/* 終了日 */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                終了日
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>

            {/* ユーザー */}
            <div>
              <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-1">
                ユーザー
              </label>
              <input
                type="text"
                id="user"
                name="user"
                value={filters.user}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="ユーザー名"
              />
            </div>

            {/* アクション */}
            <div>
              <label htmlFor="action" className="block text-sm font-medium text-gray-700 mb-1">
                アクション
              </label>
              <input
                type="text"
                id="action"
                name="action"
                value={filters.action}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="アクション"
              />
            </div>

            {/* リソース種別 */}
            <div>
              <label htmlFor="resourceType" className="block text-sm font-medium text-gray-700 mb-1">
                リソース種別
              </label>
              <input
                type="text"
                id="resourceType"
                name="resourceType"
                value={filters.resourceType}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="リソース種別"
              />
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleReset}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors font-medium"
            >
              フィルターをリセット
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV エクスポート
            </button>
            <button
              onClick={handlePrint}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              印刷
            </button>
          </div>
        </div>

        {/* 操作履歴テーブル */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">操作履歴 ({auditLogs.length}件)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日時
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ユーザー
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    リソース
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    詳細
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IPアドレス
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.timestamp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.resource}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.details}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
