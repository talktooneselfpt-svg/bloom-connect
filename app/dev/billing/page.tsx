"use client"
import RouteGuard from "@/components/RouteGuard"

import { useState } from "react"

interface BillingRecord {
  id: number
  organizationName: string
  plan: string
  amount: number
  status: "paid" | "pending" | "overdue" | "cancelled"
  billingDate: string
  paidDate?: string
  invoiceNumber: string
}

export default function BillingPage() {
  const [selectedMonth, setSelectedMonth] = useState("2025-12")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  // TODO: 実際のデータはAPIから取得
  const billingRecords: BillingRecord[] = [
    {
      id: 1,
      organizationName: "さくら介護センター",
      plan: "プレミアム",
      amount: 50000,
      status: "paid",
      billingDate: "2025-12-01",
      paidDate: "2025-12-03",
      invoiceNumber: "INV-2025-12-001"
    },
    {
      id: 2,
      organizationName: "ひまわり訪問介護",
      plan: "スタンダード",
      amount: 30000,
      status: "paid",
      billingDate: "2025-12-01",
      paidDate: "2025-12-05",
      invoiceNumber: "INV-2025-12-002"
    },
    {
      id: 3,
      organizationName: "みどり訪問看護ステーション",
      plan: "スタンダード",
      amount: 30000,
      status: "pending",
      billingDate: "2025-12-01",
      invoiceNumber: "INV-2025-12-003"
    },
    {
      id: 4,
      organizationName: "つばさ介護ステーション",
      plan: "プレミアム",
      amount: 50000,
      status: "overdue",
      billingDate: "2025-11-01",
      invoiceNumber: "INV-2025-11-005"
    },
    {
      id: 5,
      organizationName: "あおぞら福祉サービス",
      plan: "ベーシック (トライアル)",
      amount: 0,
      status: "cancelled",
      billingDate: "2025-12-01",
      invoiceNumber: "INV-2025-12-004"
    }
  ]

  const filteredRecords = billingRecords.filter(record => {
    if (filterStatus === "all") return true
    return record.status === filterStatus
  })

  const totalRevenue = filteredRecords
    .filter(r => r.status === "paid")
    .reduce((sum, r) => sum + r.amount, 0)

  const pendingAmount = filteredRecords
    .filter(r => r.status === "pending")
    .reduce((sum, r) => sum + r.amount, 0)

  const overdueAmount = filteredRecords
    .filter(r => r.status === "overdue")
    .reduce((sum, r) => sum + r.amount, 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-500 text-white"
      case "pending": return "bg-yellow-500 text-gray-900"
      case "overdue": return "bg-red-500 text-white"
      case "cancelled": return "bg-gray-500 text-white"
      default: return "bg-gray-500 text-white"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid": return "支払済"
      case "pending": return "請求中"
      case "overdue": return "延滞"
      case "cancelled": return "キャンセル"
      default: return status
    }
  }

  return (
    <RouteGuard>
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">課金管理</h1>
          <p className="text-gray-400">請求・支払い状況の管理</p>
        </div>

        {/* 統計サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">今月の売上</h3>
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-green-400">¥{totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-400 mt-1">
              {filteredRecords.filter(r => r.status === "paid").length}件の支払い
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">請求中</h3>
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-yellow-400">¥{pendingAmount.toLocaleString()}</p>
            <p className="text-sm text-gray-400 mt-1">
              {filteredRecords.filter(r => r.status === "pending").length}件
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">延滞</h3>
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-red-400">¥{overdueAmount.toLocaleString()}</p>
            <p className="text-sm text-gray-400 mt-1">
              {filteredRecords.filter(r => r.status === "overdue").length}件
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">支払い率</h3>
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-blue-400">
              {filteredRecords.length > 0
                ? Math.round((filteredRecords.filter(r => r.status === "paid").length / filteredRecords.length) * 100)
                : 0}%
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {filteredRecords.filter(r => r.status === "paid").length} / {filteredRecords.length}件
            </p>
          </div>
        </div>

        {/* フィルターとアクション */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <div>
                <label className="block text-sm text-gray-400 mb-2">請求月</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">ステータス</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">すべて</option>
                  <option value="paid">支払済</option>
                  <option value="pending">請求中</option>
                  <option value="overdue">延滞</option>
                  <option value="cancelled">キャンセル</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                請求書一括発行
              </button>
              <button className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                CSVエクスポート
              </button>
            </div>
          </div>
        </div>

        {/* 請求一覧テーブル */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    請求番号
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    事業所名
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    プラン
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    金額
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    請求日
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    支払日
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-400">
                      {record.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {record.organizationName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {record.plan}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                      ¥{record.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {record.billingDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {record.paidDate || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded ${getStatusColor(record.status)}`}>
                        {getStatusText(record.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button className="text-blue-400 hover:text-blue-300">
                          詳細
                        </button>
                        <button className="text-green-400 hover:text-green-300">
                          請求書
                        </button>
                        {record.status === "overdue" && (
                          <button className="text-red-400 hover:text-red-300">
                            催促
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>該当する請求記録が見つかりませんでした。</p>
          </div>
        )}
      </div>
    </div>
    </RouteGuard>
  )
}
