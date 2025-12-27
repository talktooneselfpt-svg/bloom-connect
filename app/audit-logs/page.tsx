'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type {
  AuditLog,
  AuditLogFilter,
  AuditLogStats,
  AuditAction,
  ResourceType,
} from '@/types/audit-log'
import {
  AUDIT_ACTION_LABELS,
  RESOURCE_TYPE_LABELS,
  AUDIT_ACTION_COLORS,
} from '@/types/audit-log'
import { getAuditLogs, calculateAuditLogStats, formatAuditLogsForExport } from '@/lib/firestore/audit-logs'
import { Timestamp } from 'firebase/firestore'

// サンプルデータ（実装時にFirestoreから取得）
const SAMPLE_LOGS: Partial<AuditLog>[] = [
  {
    id: '1',
    userId: 'user-001',
    userName: '山田太郎',
    organizationId: 'org-001',
    action: 'create',
    resourceType: 'staff',
    resourceId: 'staff-123',
    resourceName: '鈴木花子',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0...',
    timestamp: Timestamp.fromDate(new Date('2025-01-15 10:30:00')),
  },
  {
    id: '2',
    userId: 'user-002',
    userName: '佐藤次郎',
    organizationId: 'org-001',
    action: 'update',
    resourceType: 'client',
    resourceId: 'client-456',
    resourceName: '田中一郎',
    changes: {
      before: { status: 'active' },
      after: { status: 'inactive' },
    },
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0...',
    timestamp: Timestamp.fromDate(new Date('2025-01-15 09:15:00')),
  },
  {
    id: '3',
    userId: 'user-001',
    userName: '山田太郎',
    organizationId: 'org-001',
    action: 'delete',
    resourceType: 'device',
    resourceId: 'device-789',
    resourceName: '事務所iPad',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0...',
    timestamp: Timestamp.fromDate(new Date('2025-01-14 16:45:00')),
  },
  {
    id: '4',
    userId: 'user-003',
    userName: '高橋三郎',
    organizationId: 'org-001',
    action: 'login',
    resourceType: 'settings',
    resourceId: 'auth-001',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0...',
    timestamp: Timestamp.fromDate(new Date('2025-01-14 08:00:00')),
  },
  {
    id: '5',
    userId: 'user-002',
    userName: '佐藤次郎',
    organizationId: 'org-001',
    action: 'export',
    resourceType: 'staff',
    resourceId: 'export-001',
    resourceName: 'スタッフ一覧',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0...',
    timestamp: Timestamp.fromDate(new Date('2025-01-13 14:20:00')),
  },
]

export default function AuditLogsPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<Partial<AuditLog>[]>([])
  const [stats, setStats] = useState<AuditLogStats | null>(null)
  const [loading, setLoading] = useState(false)

  // フィルター状態
  const [filters, setFilters] = useState<AuditLogFilter>({
    startDate: undefined,
    endDate: undefined,
    userId: undefined,
    action: undefined,
    resourceType: undefined,
    searchQuery: '',
  })

  // 日付入力用の文字列状態
  const [startDateStr, setStartDateStr] = useState('')
  const [endDateStr, setEndDateStr] = useState('')

  // TODO: 実際のユーザーIDと組織IDを取得
  const currentUserId = 'test-user-001'
  const currentOrganizationId = 'test-org-001'

  useEffect(() => {
    loadLogs()
    loadStats()
  }, [])

  const loadLogs = async () => {
    try {
      setLoading(true)
      // TODO: Firestoreから取得
      setLogs(SAMPLE_LOGS)
    } catch (error) {
      console.error('監査ログの取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // TODO: Firestoreから統計を計算
      const sampleStats: AuditLogStats = {
        totalLogs: SAMPLE_LOGS.length,
        logsByAction: {
          create: 1,
          update: 1,
          delete: 1,
          login: 1,
          logout: 0,
          view: 0,
          export: 1,
        },
        logsByResourceType: {
          staff: 2,
          client: 1,
          organization: 0,
          subscription: 0,
          device: 1,
          notification: 0,
          plan: 0,
          settings: 1,
        },
        uniqueUsers: 3,
        mostActiveUser: {
          userId: 'user-001',
          userName: '山田太郎',
          count: 2,
        },
      }
      setStats(sampleStats)
    } catch (error) {
      console.error('統計の取得に失敗しました:', error)
    }
  }

  // フィルター適用
  const filteredLogs = useMemo(() => {
    let filtered = [...logs]

    // 日付範囲フィルター
    if (filters.startDate) {
      filtered = filtered.filter(
        (log) => log.timestamp && log.timestamp.toDate() >= filters.startDate!
      )
    }

    if (filters.endDate) {
      filtered = filtered.filter(
        (log) => log.timestamp && log.timestamp.toDate() <= filters.endDate!
      )
    }

    // ユーザーフィルター
    if (filters.userId) {
      filtered = filtered.filter((log) => log.userId === filters.userId)
    }

    // アクションフィルター
    if (filters.action) {
      filtered = filtered.filter((log) => log.action === filters.action)
    }

    // リソースタイプフィルター
    if (filters.resourceType) {
      filtered = filtered.filter((log) => log.resourceType === filters.resourceType)
    }

    // 検索クエリフィルター
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(
        (log) =>
          log.userName?.toLowerCase().includes(query) ||
          log.resourceName?.toLowerCase().includes(query) ||
          log.resourceId?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [logs, filters])

  // ユニークなユーザーリスト
  const uniqueUsers = useMemo(() => {
    const usersMap = new Map<string, string>()
    logs.forEach((log) => {
      if (log.userId && log.userName) {
        usersMap.set(log.userId, log.userName)
      }
    })
    return Array.from(usersMap.entries()).map(([id, name]) => ({ id, name }))
  }, [logs])

  const handleFilterChange = (key: keyof AuditLogFilter, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleStartDateChange = (dateStr: string) => {
    setStartDateStr(dateStr)
    if (dateStr) {
      handleFilterChange('startDate', new Date(dateStr))
    } else {
      handleFilterChange('startDate', undefined)
    }
  }

  const handleEndDateChange = (dateStr: string) => {
    setEndDateStr(dateStr)
    if (dateStr) {
      handleFilterChange('endDate', new Date(dateStr))
    } else {
      handleFilterChange('endDate', undefined)
    }
  }

  const handleResetFilters = () => {
    setFilters({
      startDate: undefined,
      endDate: undefined,
      userId: undefined,
      action: undefined,
      resourceType: undefined,
      searchQuery: '',
    })
    setStartDateStr('')
    setEndDateStr('')
  }

  const handleExportCSV = () => {
    // TODO: CSVエクスポート機能を実装
    const exportData = formatAuditLogsForExport(filteredLogs as AuditLog[])
    console.log('CSV Export:', exportData)
    alert('CSV エクスポート機能は準備中です')
  }

  const handleExportPDF = () => {
    // TODO: PDFエクスポート機能を実装
    alert('PDF エクスポート機能は準備中です')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← ダッシュボードに戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">監査ログ・アクティビティログ</h1>
          <p className="text-gray-600 mt-2">
            操作履歴を確認し、コンプライアンスとセキュリティを確保します
          </p>
        </div>

        {/* 統計情報 */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">総ログ数</div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalLogs}</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">ユニークユーザー</div>
              <div className="text-3xl font-bold text-gray-900">{stats.uniqueUsers}</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">最多操作</div>
              <div className="text-lg font-semibold text-gray-900">
                {Object.entries(stats.logsByAction)
                  .sort((a, b) => b[1] - a[1])[0]?.[0] || '-'}
              </div>
              <div className="text-xs text-gray-500">
                {Object.entries(stats.logsByAction)
                  .sort((a, b) => b[1] - a[1])[0]?.[1] || 0}件
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">最もアクティブ</div>
              <div className="text-sm font-semibold text-gray-900">
                {stats.mostActiveUser?.userName || '-'}
              </div>
              <div className="text-xs text-gray-500">
                {stats.mostActiveUser?.count || 0}件
              </div>
            </div>
          </div>
        )}

        {/* フィルターとエクスポート */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">フィルター・検索</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* 検索クエリ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                キーワード検索
              </label>
              <input
                type="text"
                placeholder="ユーザー名、リソース名など"
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 開始日 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                開始日
              </label>
              <input
                type="date"
                value={startDateStr}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 終了日 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                終了日
              </label>
              <input
                type="date"
                value={endDateStr}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* ユーザー */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ユーザー
              </label>
              <select
                value={filters.userId || ''}
                onChange={(e) => handleFilterChange('userId', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">すべてのユーザー</option>
                {uniqueUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            {/* アクション */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                アクション
              </label>
              <select
                value={filters.action || ''}
                onChange={(e) =>
                  handleFilterChange('action', e.target.value ? (e.target.value as AuditAction) : undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">すべてのアクション</option>
                {Object.entries(AUDIT_ACTION_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* リソースタイプ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                リソース種別
              </label>
              <select
                value={filters.resourceType || ''}
                onChange={(e) =>
                  handleFilterChange('resourceType', e.target.value ? (e.target.value as ResourceType) : undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">すべてのリソース</option>
                {Object.entries(RESOURCE_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              フィルターをリセット
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              CSV エクスポート
            </button>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              PDF エクスポート
            </button>
          </div>
        </div>

        {/* ログ一覧 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              操作履歴 ({filteredLogs.length}件)
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">読み込み中...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              条件に一致する監査ログがありません
            </div>
          ) : (
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
                  {filteredLogs.map((log) => {
                    if (!log.id || !log.action) return null
                    const actionColors = AUDIT_ACTION_COLORS[log.action]

                    return (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.timestamp?.toDate().toLocaleString('ja-JP')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.userName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${actionColors.bg} ${actionColors.text}`}
                          >
                            {AUDIT_ACTION_LABELS[log.action]}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div>{RESOURCE_TYPE_LABELS[log.resourceType!]}</div>
                          <div className="text-xs text-gray-500">
                            {log.resourceName || log.resourceId}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {log.changes ? (
                            <div className="max-w-xs truncate" title={JSON.stringify(log.changes)}>
                              変更あり
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.ipAddress}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
