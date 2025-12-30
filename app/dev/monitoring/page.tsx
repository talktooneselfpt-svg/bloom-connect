"use client"
import RouteGuard from "@/components/RouteGuard"

import { useState } from "react"

export default function MonitoringPage() {
  const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d" | "30d">("24h")

  // TODO: 実際のデータはAPIから取得
  const systemMetrics = {
    webApp: {
      status: "正常",
      uptime: 99.98,
      responseTime: 245,
      requestsPerMin: 1250,
      errorRate: 0.02
    },
    api: {
      status: "正常",
      uptime: 99.95,
      responseTime: 128,
      requestsPerMin: 3840,
      errorRate: 0.05
    },
    database: {
      status: "正常",
      uptime: 99.99,
      responseTime: 45,
      connections: 48,
      maxConnections: 100,
      storageUsed: 45.6,
      storageTotal: 100
    },
    storage: {
      status: "警告",
      uptime: 98.50,
      responseTime: 890,
      filesStored: 12450,
      storageUsed: 87.3,
      storageTotal: 100
    }
  }

  const recentActivities = [
    { time: "2分前", event: "API: 新しいリクエストピーク検出", level: "info" },
    { time: "15分前", event: "ストレージ: 容量使用率85%を超過", level: "warning" },
    { time: "1時間前", event: "データベース: バックアップ完了", level: "success" },
    { time: "2時間前", event: "Webアプリ: デプロイ完了 v2.4.1", level: "success" },
    { time: "3時間前", event: "API: 一時的な応答遅延 (解決済み)", level: "warning" }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "正常": return "text-green-400"
      case "警告": return "text-yellow-400"
      case "エラー": return "text-red-400"
      default: return "text-gray-400"
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "正常": return "bg-green-500"
      case "警告": return "bg-yellow-500"
      case "エラー": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "success": return "text-green-400"
      case "info": return "text-blue-400"
      case "warning": return "text-yellow-400"
      case "error": return "text-red-400"
      default: return "text-gray-400"
    }
  }

  return (
    <RouteGuard>
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">システム監視</h1>
          <p className="text-gray-400">リアルタイムシステムヘルスとパフォーマンスモニタリング</p>
        </div>

        {/* 期間選択 */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setTimeRange("1h")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === "1h" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            1時間
          </button>
          <button
            onClick={() => setTimeRange("24h")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === "24h" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            24時間
          </button>
          <button
            onClick={() => setTimeRange("7d")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === "7d" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            7日間
          </button>
          <button
            onClick={() => setTimeRange("30d")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === "30d" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            30日間
          </button>
        </div>

        {/* システムステータスカード */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Webアプリ */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusBgColor(systemMetrics.webApp.status)} animate-pulse`}></div>
                <h3 className="text-lg font-bold">Webアプリケーション</h3>
              </div>
              <span className={`text-sm font-semibold ${getStatusColor(systemMetrics.webApp.status)}`}>
                {systemMetrics.webApp.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">稼働率</p>
                <p className="text-xl font-bold text-green-400">{systemMetrics.webApp.uptime}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">応答時間</p>
                <p className="text-xl font-bold">{systemMetrics.webApp.responseTime}ms</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">リクエスト/分</p>
                <p className="text-xl font-bold">{systemMetrics.webApp.requestsPerMin.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">エラー率</p>
                <p className="text-xl font-bold">{systemMetrics.webApp.errorRate}%</p>
              </div>
            </div>
          </div>

          {/* API */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusBgColor(systemMetrics.api.status)} animate-pulse`}></div>
                <h3 className="text-lg font-bold">API</h3>
              </div>
              <span className={`text-sm font-semibold ${getStatusColor(systemMetrics.api.status)}`}>
                {systemMetrics.api.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">稼働率</p>
                <p className="text-xl font-bold text-green-400">{systemMetrics.api.uptime}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">応答時間</p>
                <p className="text-xl font-bold">{systemMetrics.api.responseTime}ms</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">リクエスト/分</p>
                <p className="text-xl font-bold">{systemMetrics.api.requestsPerMin.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">エラー率</p>
                <p className="text-xl font-bold">{systemMetrics.api.errorRate}%</p>
              </div>
            </div>
          </div>

          {/* データベース */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusBgColor(systemMetrics.database.status)} animate-pulse`}></div>
                <h3 className="text-lg font-bold">データベース</h3>
              </div>
              <span className={`text-sm font-semibold ${getStatusColor(systemMetrics.database.status)}`}>
                {systemMetrics.database.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">稼働率</p>
                <p className="text-xl font-bold text-green-400">{systemMetrics.database.uptime}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">応答時間</p>
                <p className="text-xl font-bold">{systemMetrics.database.responseTime}ms</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">接続数</p>
                <p className="text-xl font-bold">{systemMetrics.database.connections}/{systemMetrics.database.maxConnections}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">ストレージ使用</p>
                <p className="text-xl font-bold">{systemMetrics.database.storageUsed}GB</p>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${(systemMetrics.database.storageUsed / systemMetrics.database.storageTotal) * 100}%` }}
              />
            </div>
          </div>

          {/* ストレージ */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusBgColor(systemMetrics.storage.status)} animate-pulse`}></div>
                <h3 className="text-lg font-bold">ストレージ</h3>
              </div>
              <span className={`text-sm font-semibold ${getStatusColor(systemMetrics.storage.status)}`}>
                {systemMetrics.storage.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">稼働率</p>
                <p className="text-xl font-bold text-yellow-400">{systemMetrics.storage.uptime}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">応答時間</p>
                <p className="text-xl font-bold text-yellow-400">{systemMetrics.storage.responseTime}ms</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">ファイル数</p>
                <p className="text-xl font-bold">{systemMetrics.storage.filesStored.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">使用率</p>
                <p className="text-xl font-bold text-yellow-400">{systemMetrics.storage.storageUsed}%</p>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full"
                style={{ width: `${systemMetrics.storage.storageUsed}%` }}
              />
            </div>
          </div>
        </div>

        {/* 最近のアクティビティ */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
          <h2 className="text-xl font-bold mb-4">最近のアクティビティ</h2>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-700 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${getLevelColor(activity.level).replace('text-', 'bg-')}`}></div>
                <div className="flex-1">
                  <p className={`font-medium ${getLevelColor(activity.level)}`}>{activity.event}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-left">
            <h3 className="font-semibold mb-1">詳細レポート</h3>
            <p className="text-sm text-blue-100">システムの詳細分析レポートを表示</p>
          </button>
          <button className="p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-left">
            <h3 className="font-semibold mb-1">アラート設定</h3>
            <p className="text-sm text-purple-100">監視アラートの閾値を設定</p>
          </button>
          <button className="p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-left">
            <h3 className="font-semibold mb-1">パフォーマンステスト</h3>
            <p className="text-sm text-green-100">負荷テストを実行</p>
          </button>
        </div>
      </div>
    </div>
    </RouteGuard>
  )
}
