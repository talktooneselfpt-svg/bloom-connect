"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/hooks/useAuth"
import {
  getOrganizationStats,
  getWeeklyStats,
  getMonthlyStats,
  getYearlyStats,
  calculateMonthOverMonthGrowth,
  type OrganizationStats,
  type PeriodStats,
} from "@/lib/firestore/reports"

export default function ReportsPage() {
  const { staff: currentStaff } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month")
  const [stats, setStats] = useState<OrganizationStats | null>(null)
  const [periodStats, setPeriodStats] = useState<PeriodStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 組織統計データを取得
  useEffect(() => {
    if (!currentStaff?.organizationId) {
      setLoading(false)
      return
    }

    const loadStats = async () => {
      try {
        setLoading(true)
        const data = await getOrganizationStats(currentStaff.organizationId)
        setStats(data)
      } catch (err) {
        console.error("統計データの取得に失敗:", err)
        setError("統計データの取得に失敗しました")
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [currentStaff?.organizationId])

  // 期間別統計データを取得
  useEffect(() => {
    if (!currentStaff?.organizationId) return

    const loadPeriodStats = async () => {
      try {
        let data: PeriodStats[] = []

        switch (selectedPeriod) {
          case "week":
            data = await getWeeklyStats(currentStaff.organizationId)
            break
          case "month":
            data = await getMonthlyStats(currentStaff.organizationId)
            break
          case "year":
            data = await getYearlyStats(currentStaff.organizationId)
            break
        }

        setPeriodStats(data)
      } catch (err) {
        console.error("期間別統計の取得に失敗:", err)
      }
    }

    loadPeriodStats()
  }, [currentStaff?.organizationId, selectedPeriod])

  // スタッフ数の前月比を計算
  const staffGrowth = stats
    ? calculateMonthOverMonthGrowth(
        stats.staffRegisteredThisMonth,
        stats.staffRegisteredLastMonth
      )
    : null

  // クライアント数の前月比を計算
  const clientGrowth = stats
    ? calculateMonthOverMonthGrowth(
        stats.clientsRegisteredThisMonth,
        stats.clientsRegisteredLastMonth
      )
    : null

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded">
          {error || "統計データを取得できませんでした"}
        </div>
      </div>
    )
  }

  // グラフの最大値を計算
  const maxRegistrations = Math.max(
    ...periodStats.map(s => Math.max(s.staffRegistrations, s.clientRegistrations)),
    1 // 0除算を避けるため
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">レポート・分析</h1>
          <p className="text-gray-600">業務統計とデータ分析</p>
        </div>

        {/* 期間選択 */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPeriod("week")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedPeriod === "week"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              週間
            </button>
            <button
              onClick={() => setSelectedPeriod("month")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedPeriod === "month"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              月間
            </button>
            <button
              onClick={() => setSelectedPeriod("year")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedPeriod === "year"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              年間
            </button>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* 総スタッフ数 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm text-gray-600 mb-2">総スタッフ数</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalStaff}</p>
            {staffGrowth && staffGrowth.direction !== 'neutral' && (
              <p className={`text-xs mt-1 ${
                staffGrowth.direction === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {staffGrowth.direction === 'up' ? '↑' : '↓'} 前月比 {staffGrowth.direction === 'up' ? '+' : '-'}{staffGrowth.percentage}%
              </p>
            )}
            {(!staffGrowth || staffGrowth.direction === 'neutral') && (
              <p className="text-xs text-gray-600 mt-1">変動なし</p>
            )}
          </div>

          {/* 稼働スタッフ数 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm text-gray-600 mb-2">稼働スタッフ数</h3>
            <p className="text-3xl font-bold text-green-600">{stats.activeStaff}</p>
            <p className="text-xs text-gray-600 mt-1">
              全体の {stats.totalStaff > 0 ? Math.round((stats.activeStaff / stats.totalStaff) * 100) : 0}%
            </p>
          </div>

          {/* 総利用者数 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm text-gray-600 mb-2">総利用者数</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.totalClients}</p>
            {clientGrowth && clientGrowth.direction !== 'neutral' && (
              <p className={`text-xs mt-1 ${
                clientGrowth.direction === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {clientGrowth.direction === 'up' ? '↑' : '↓'} 前月比 {clientGrowth.direction === 'up' ? '+' : '-'}{clientGrowth.percentage}%
              </p>
            )}
            {(!clientGrowth || clientGrowth.direction === 'neutral') && (
              <p className="text-xs text-gray-600 mt-1">変動なし</p>
            )}
          </div>

          {/* 利用中の利用者数 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm text-gray-600 mb-2">利用中の利用者</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.activeClients}</p>
            <p className="text-xs text-gray-600 mt-1">
              全体の {stats.totalClients > 0 ? Math.round((stats.activeClients / stats.totalClients) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* グラフエリア */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* スタッフ登録数の推移 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">スタッフ登録数の推移</h2>
            <div className="h-64 flex items-end justify-around gap-2">
              {periodStats.map((stat, i) => {
                const height = maxRegistrations > 0
                  ? (stat.staffRegistrations / maxRegistrations) * 100
                  : 0
                return (
                  <div key={i} className="flex flex-col items-center flex-1">
                    <div
                      className="w-full bg-blue-600 rounded-t transition-all hover:bg-blue-700"
                      style={{ height: `${Math.max(height, 5)}%` }}
                      title={`${stat.staffRegistrations}人`}
                    ></div>
                    <span className="text-xs text-gray-600 mt-2 text-center">
                      {stat.staffRegistrations}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-around mt-4 text-xs text-gray-600">
              {periodStats.map((stat, i) => (
                <span key={i} className="text-center flex-1">{stat.period}</span>
              ))}
            </div>
          </div>

          {/* クライアント登録数の推移 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">利用者登録数の推移</h2>
            <div className="h-64 flex items-end justify-around gap-2">
              {periodStats.map((stat, i) => {
                const height = maxRegistrations > 0
                  ? (stat.clientRegistrations / maxRegistrations) * 100
                  : 0
                return (
                  <div key={i} className="flex flex-col items-center flex-1">
                    <div
                      className="w-full bg-purple-600 rounded-t transition-all hover:bg-purple-700"
                      style={{ height: `${Math.max(height, 5)}%` }}
                      title={`${stat.clientRegistrations}人`}
                    ></div>
                    <span className="text-xs text-gray-600 mt-2 text-center">
                      {stat.clientRegistrations}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-around mt-4 text-xs text-gray-600">
              {periodStats.map((stat, i) => (
                <span key={i} className="text-center flex-1">{stat.period}</span>
              ))}
            </div>
          </div>
        </div>

        {/* サマリー情報 */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">サマリー</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">スタッフ情報</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex justify-between">
                  <span>総スタッフ数:</span>
                  <span className="font-medium text-gray-900">{stats.totalStaff}人</span>
                </li>
                <li className="flex justify-between">
                  <span>稼働中:</span>
                  <span className="font-medium text-green-600">{stats.activeStaff}人</span>
                </li>
                <li className="flex justify-between">
                  <span>退職済み:</span>
                  <span className="font-medium text-gray-500">{stats.inactiveStaff}人</span>
                </li>
                <li className="flex justify-between">
                  <span>今月の新規登録:</span>
                  <span className="font-medium text-blue-600">{stats.staffRegisteredThisMonth}人</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">利用者情報</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex justify-between">
                  <span>総利用者数:</span>
                  <span className="font-medium text-gray-900">{stats.totalClients}人</span>
                </li>
                <li className="flex justify-between">
                  <span>利用中:</span>
                  <span className="font-medium text-green-600">{stats.activeClients}人</span>
                </li>
                <li className="flex justify-between">
                  <span>退所済み:</span>
                  <span className="font-medium text-gray-500">{stats.inactiveClients}人</span>
                </li>
                <li className="flex justify-between">
                  <span>今月の新規登録:</span>
                  <span className="font-medium text-purple-600">{stats.clientsRegisteredThisMonth}人</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* レポート出力 */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">レポート出力</h2>
          <p className="text-sm text-gray-600 mb-4">
            統計データをCSVまたはPDF形式で出力できます（近日実装予定）
          </p>
          <div className="flex gap-3">
            <button
              disabled
              className="bg-gray-300 text-gray-500 px-6 py-2 rounded-md cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV出力
            </button>
            <button
              disabled
              className="bg-gray-300 text-gray-500 px-6 py-2 rounded-md cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              PDF出力
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
