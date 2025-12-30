"use client"

import { useState } from "react"
import RouteGuard from "@/components/RouteGuard"

export default function DevDashboard() {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("7d")

  // TODO: 実際のデータはAPIから取得
  const stats = {
    totalOrganizations: 12,
    activeOrganizations: 10,
    totalUsers: 245,
    activeUsers: 189,
    totalRevenue: 1250000,
    monthlyRevenue: 350000,
    errorCount: 3,
    uptime: 99.97
  }

  const recentOrganizations = [
    { id: 1, name: "さくら介護センター", plan: "プレミアム", users: 25, status: "active", lastActive: "2時間前" },
    { id: 2, name: "ひまわり訪問介護", plan: "スタンダード", users: 15, status: "active", lastActive: "5時間前" },
    { id: 3, name: "あおぞら福祉サービス", plan: "ベーシック", users: 8, status: "trial", lastActive: "1日前" }
  ]

  const systemHealth = [
    { service: "Webアプリ", status: "正常", uptime: "99.98%", responseTime: "245ms" },
    { service: "API", status: "正常", uptime: "99.95%", responseTime: "128ms" },
    { service: "データベース", status: "正常", uptime: "99.99%", responseTime: "45ms" },
    { service: "ストレージ", status: "警告", uptime: "98.50%", responseTime: "890ms" }
  ]

  return (
    <RouteGuard>
      <div className="min-h-screen bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">開発者ダッシュボード</h1>
          <p className="text-gray-400">システム全体の概要と主要メトリクス</p>
        </div>

        {/* 期間選択 */}
        <div className="mb-6 flex gap-2">
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

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">契約事業所</h3>
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-3xl font-bold mb-1">{stats.totalOrganizations}</p>
            <p className="text-sm text-green-400">稼働中: {stats.activeOrganizations}</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">総ユーザー数</h3>
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold mb-1">{stats.totalUsers}</p>
            <p className="text-sm text-green-400">アクティブ: {stats.activeUsers}</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">月間売上</h3>
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold mb-1">¥{stats.monthlyRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-400">累計: ¥{stats.totalRevenue.toLocaleString()}</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">稼働率</h3>
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold mb-1">{stats.uptime}%</p>
            <p className="text-sm text-red-400">エラー: {stats.errorCount}件</p>
          </div>
        </div>

        {/* 2カラムレイアウト */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 最近の事業所 */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">最近の事業所</h2>
            <div className="space-y-4">
              {recentOrganizations.map(org => (
                <div key={org.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{org.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        org.status === "active" ? "bg-green-500 text-white" : "bg-yellow-500 text-gray-900"
                      }`}>
                        {org.status === "active" ? "稼働中" : "トライアル"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{org.plan}</span>
                      <span>•</span>
                      <span>{org.users}ユーザー</span>
                      <span>•</span>
                      <span>{org.lastActive}</span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              すべての事業所を見る
            </button>
          </div>

          {/* システムヘルス */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">システムヘルス</h2>
            <div className="space-y-4">
              {systemHealth.map((service, index) => (
                <div key={index} className="p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{service.service}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      service.status === "正常" ? "bg-green-500 text-white" : "bg-yellow-500 text-gray-900"
                    }`}>
                      {service.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">稼働率: </span>
                      <span className="text-white font-medium">{service.uptime}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">応答時間: </span>
                      <span className="text-white font-medium">{service.responseTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
              詳細なモニタリングを見る
            </button>
          </div>
        </div>

        {/* クイックアクション */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-left">
            <h3 className="font-semibold mb-1">新規事業所を追加</h3>
            <p className="text-sm text-blue-100">新しい顧客組織をシステムに登録</p>
          </button>
          <button className="p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-left">
            <h3 className="font-semibold mb-1">機能をテスト</h3>
            <p className="text-sm text-purple-100">本番環境に展開する前にテスト</p>
          </button>
          <button className="p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-left">
            <h3 className="font-semibold mb-1">システムレポート</h3>
            <p className="text-sm text-green-100">詳細な分析レポートを生成</p>
          </button>
        </div>
      </div>
    </div>
    </RouteGuard>
  )
}
