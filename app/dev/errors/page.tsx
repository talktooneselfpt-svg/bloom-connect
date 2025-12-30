"use client"
import RouteGuard from "@/components/RouteGuard"

import { useState } from "react"

interface ErrorLog {
  id: string
  timestamp: string
  level: "error" | "warning" | "critical"
  message: string
  service: string
  userId?: string
  organizationId?: string
  stackTrace?: string
  resolved: boolean
}

export default function ErrorsPage() {
  const [filterLevel, setFilterLevel] = useState<string>("all")
  const [filterResolved, setFilterResolved] = useState<string>("unresolved")
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null)

  // TODO: 実際のデータはAPIから取得
  const errorLogs: ErrorLog[] = [
    {
      id: "err-001",
      timestamp: "2025-12-29 14:32:15",
      level: "critical",
      message: "データベース接続タイムアウト",
      service: "API",
      organizationId: "org-005",
      stackTrace: "Error: Connection timeout\n  at Database.connect (db.ts:45)\n  at API.handler (api.ts:123)",
      resolved: false
    },
    {
      id: "err-002",
      timestamp: "2025-12-29 14:15:32",
      level: "error",
      message: "ファイルアップロード失敗: サイズ制限超過",
      service: "Storage",
      userId: "user-234",
      organizationId: "org-003",
      resolved: false
    },
    {
      id: "err-003",
      timestamp: "2025-12-29 13:45:18",
      level: "warning",
      message: "API応答遅延: 5秒以上",
      service: "API",
      organizationId: "org-001",
      resolved: true
    },
    {
      id: "err-004",
      timestamp: "2025-12-29 12:22:41",
      level: "error",
      message: "認証トークン検証エラー",
      service: "Auth",
      userId: "user-456",
      resolved: true
    },
    {
      id: "err-005",
      timestamp: "2025-12-29 11:08:55",
      level: "warning",
      message: "メモリ使用率80%超過",
      service: "WebApp",
      resolved: false
    }
  ]

  const filteredErrors = errorLogs.filter(error => {
    const levelMatch = filterLevel === "all" || error.level === filterLevel
    const resolvedMatch =
      filterResolved === "all" ||
      (filterResolved === "resolved" && error.resolved) ||
      (filterResolved === "unresolved" && !error.resolved)
    return levelMatch && resolvedMatch
  })

  const getLevelColor = (level: string) => {
    switch (level) {
      case "critical": return "bg-red-500 text-white"
      case "error": return "bg-orange-500 text-white"
      case "warning": return "bg-yellow-500 text-gray-900"
      default: return "bg-gray-500 text-white"
    }
  }

  const getLevelText = (level: string) => {
    switch (level) {
      case "critical": return "クリティカル"
      case "error": return "エラー"
      case "warning": return "警告"
      default: return level
    }
  }

  return (
    <RouteGuard>
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">エラーログ</h1>
          <p className="text-gray-400">システムエラーと警告の監視</p>
        </div>

        {/* 統計サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
            <p className="text-sm text-red-300 mb-1">クリティカル</p>
            <p className="text-2xl font-bold text-red-400">
              {errorLogs.filter(e => e.level === "critical" && !e.resolved).length}
            </p>
          </div>
          <div className="bg-orange-900/30 border border-orange-700 rounded-lg p-4">
            <p className="text-sm text-orange-300 mb-1">エラー</p>
            <p className="text-2xl font-bold text-orange-400">
              {errorLogs.filter(e => e.level === "error" && !e.resolved).length}
            </p>
          </div>
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
            <p className="text-sm text-yellow-300 mb-1">警告</p>
            <p className="text-2xl font-bold text-yellow-400">
              {errorLogs.filter(e => e.level === "warning" && !e.resolved).length}
            </p>
          </div>
          <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
            <p className="text-sm text-green-300 mb-1">解決済み</p>
            <p className="text-2xl font-bold text-green-400">
              {errorLogs.filter(e => e.resolved).length}
            </p>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">レベル</label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべて</option>
                <option value="critical">クリティカル</option>
                <option value="error">エラー</option>
                <option value="warning">警告</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">ステータス</label>
              <select
                value={filterResolved}
                onChange={(e) => setFilterResolved(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべて</option>
                <option value="unresolved">未解決</option>
                <option value="resolved">解決済み</option>
              </select>
            </div>
            <div className="lg:ml-auto flex items-end gap-2">
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                更新
              </button>
              <button className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                CSVエクスポート
              </button>
            </div>
          </div>
        </div>

        {/* エラーログ一覧 */}
        <div className="space-y-3">
          {filteredErrors.map((error) => (
            <div
              key={error.id}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
              onClick={() => setSelectedError(selectedError?.id === error.id ? null : error)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs px-2 py-1 rounded ${getLevelColor(error.level)}`}>
                      {getLevelText(error.level)}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">{error.id}</span>
                    {error.resolved && (
                      <span className="text-xs px-2 py-1 rounded bg-green-500 text-white">
                        解決済み
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{error.message}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{error.service}</span>
                    <span>•</span>
                    <span>{error.timestamp}</span>
                    {error.organizationId && (
                      <>
                        <span>•</span>
                        <span>事業所: {error.organizationId}</span>
                      </>
                    )}
                    {error.userId && (
                      <>
                        <span>•</span>
                        <span>ユーザー: {error.userId}</span>
                      </>
                    )}
                  </div>
                </div>
                <svg
                  className={`w-6 h-6 text-gray-400 transition-transform ${
                    selectedError?.id === error.id ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* 詳細情報（展開時） */}
              {selectedError?.id === error.id && error.stackTrace && (
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <h4 className="font-semibold mb-2">スタックトレース</h4>
                  <pre className="bg-gray-900 rounded p-4 text-xs text-gray-300 overflow-x-auto mb-4">
                    {error.stackTrace}
                  </pre>
                  <div className="flex gap-2">
                    {!error.resolved && (
                      <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm">
                        解決済みにする
                      </button>
                    )}
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm">
                      詳細を見る
                    </button>
                    <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm">
                      関連ログを検索
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredErrors.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-semibold mb-2">エラーはありません</p>
            <p>該当するエラーログが見つかりませんでした。</p>
          </div>
        )}
      </div>
    </div>
    </RouteGuard>
  )
}
