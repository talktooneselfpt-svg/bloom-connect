"use client"

import { useState } from "react"
import RouteGuard from "@/components/RouteGuard"

interface Organization {
  id: number
  name: string
  plan: string
  status: "active" | "trial" | "suspended" | "cancelled"
  users: number
  maxUsers: number
  createdAt: string
  lastActive: string
  monthlyFee: number
  apps: {
    name: string
    usage: number
    lastUsed: string
  }[]
}

export default function OrganizationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)

  // TODO: 実際のデータはAPIから取得
  const organizations: Organization[] = [
    {
      id: 1,
      name: "さくら介護センター",
      plan: "プレミアム",
      status: "active",
      users: 25,
      maxUsers: 50,
      createdAt: "2024-01-15",
      lastActive: "2時間前",
      monthlyFee: 50000,
      apps: [
        { name: "記録管理", usage: 1250, lastUsed: "2時間前" },
        { name: "スケジュール", usage: 890, lastUsed: "3時間前" },
        { name: "コミュニティ", usage: 450, lastUsed: "1日前" }
      ]
    },
    {
      id: 2,
      name: "ひまわり訪問介護",
      plan: "スタンダード",
      status: "active",
      users: 15,
      maxUsers: 30,
      createdAt: "2024-02-20",
      lastActive: "5時間前",
      monthlyFee: 30000,
      apps: [
        { name: "記録管理", usage: 780, lastUsed: "5時間前" },
        { name: "スケジュール", usage: 560, lastUsed: "6時間前" },
        { name: "コミュニティ", usage: 120, lastUsed: "2日前" }
      ]
    },
    {
      id: 3,
      name: "あおぞら福祉サービス",
      plan: "ベーシック",
      status: "trial",
      users: 8,
      maxUsers: 15,
      createdAt: "2024-12-01",
      lastActive: "1日前",
      monthlyFee: 0,
      apps: [
        { name: "記録管理", usage: 45, lastUsed: "1日前" },
        { name: "スケジュール", usage: 32, lastUsed: "1日前" },
        { name: "コミュニティ", usage: 8, lastUsed: "3日前" }
      ]
    },
    {
      id: 4,
      name: "みどり訪問看護ステーション",
      plan: "スタンダード",
      status: "active",
      users: 18,
      maxUsers: 30,
      createdAt: "2024-03-10",
      lastActive: "1時間前",
      monthlyFee: 30000,
      apps: [
        { name: "記録管理", usage: 920, lastUsed: "1時間前" },
        { name: "スケジュール", usage: 670, lastUsed: "2時間前" },
        { name: "コミュニティ", usage: 280, lastUsed: "12時間前" }
      ]
    },
    {
      id: 5,
      name: "つばさ介護ステーション",
      plan: "プレミアム",
      status: "suspended",
      users: 22,
      maxUsers: 50,
      createdAt: "2023-11-05",
      lastActive: "7日前",
      monthlyFee: 50000,
      apps: [
        { name: "記録管理", usage: 1100, lastUsed: "7日前" },
        { name: "スケジュール", usage: 800, lastUsed: "7日前" },
        { name: "コミュニティ", usage: 350, lastUsed: "8日前" }
      ]
    }
  ]

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || org.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500 text-white"
      case "trial": return "bg-yellow-500 text-gray-900"
      case "suspended": return "bg-red-500 text-white"
      case "cancelled": return "bg-gray-500 text-white"
      default: return "bg-gray-500 text-white"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "稼働中"
      case "trial": return "トライアル"
      case "suspended": return "停止中"
      case "cancelled": return "解約"
      default: return status
    }
  }

  return (
    <RouteGuard>
      <div className="min-h-screen bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">事業所管理</h1>
          <p className="text-gray-400">契約事業所の一覧とアプリ利用状況</p>
        </div>

        {/* 統計サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-sm text-gray-400 mb-1">総事業所数</p>
            <p className="text-2xl font-bold">{organizations.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-sm text-gray-400 mb-1">稼働中</p>
            <p className="text-2xl font-bold text-green-400">
              {organizations.filter(o => o.status === "active").length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-sm text-gray-400 mb-1">トライアル</p>
            <p className="text-2xl font-bold text-yellow-400">
              {organizations.filter(o => o.status === "trial").length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-sm text-gray-400 mb-1">総ユーザー数</p>
            <p className="text-2xl font-bold">
              {organizations.reduce((sum, org) => sum + org.users, 0)}
            </p>
          </div>
        </div>

        {/* 検索とフィルター */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="事業所名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべて</option>
                <option value="active">稼働中</option>
                <option value="trial">トライアル</option>
                <option value="suspended">停止中</option>
                <option value="cancelled">解約</option>
              </select>
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                新規追加
              </button>
            </div>
          </div>
        </div>

        {/* 事業所リスト */}
        <div className="space-y-4">
          {filteredOrganizations.map((org) => (
            <div
              key={org.id}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
              onClick={() => setSelectedOrg(selectedOrg?.id === org.id ? null : org)}
            >
              {/* 基本情報 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{org.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(org.status)}`}>
                      {getStatusText(org.status)}
                    </span>
                    <span className="text-sm text-gray-400">{org.plan}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>ユーザー: {org.users}/{org.maxUsers}</span>
                    <span>•</span>
                    <span>登録日: {org.createdAt}</span>
                    <span>•</span>
                    <span>最終アクセス: {org.lastActive}</span>
                    <span>•</span>
                    <span className="text-green-400">¥{org.monthlyFee.toLocaleString()}/月</span>
                  </div>
                </div>
                <svg
                  className={`w-6 h-6 text-gray-400 transition-transform ${
                    selectedOrg?.id === org.id ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* 詳細情報（展開時） */}
              {selectedOrg?.id === org.id && (
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <h4 className="font-semibold mb-3">アプリ利用状況</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {org.apps.map((app, index) => (
                      <div key={index} className="bg-gray-700 rounded-lg p-4">
                        <h5 className="font-medium mb-2">{app.name}</h5>
                        <p className="text-2xl font-bold text-blue-400 mb-1">{app.usage}</p>
                        <p className="text-xs text-gray-400">利用回数 / 月</p>
                        <p className="text-xs text-gray-500 mt-2">最終利用: {app.lastUsed}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm">
                      詳細を見る
                    </button>
                    <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm">
                      設定を編集
                    </button>
                    <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors text-sm">
                      サポート連絡
                    </button>
                    {org.status === "suspended" && (
                      <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm">
                        利用を再開
                      </button>
                    )}
                    {org.status === "active" && (
                      <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm">
                        利用を停止
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredOrganizations.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>該当する事業所が見つかりませんでした。</p>
          </div>
        )}
      </div>
    </div>
    </RouteGuard>
  )
}
