"use client"

import { useState, useEffect } from "react"
import RouteGuard from "@/components/RouteGuard"
import {
  getAllOrganizations,
  deactivateOrganization,
  reactivateOrganization,
} from "@/lib/firestore/organizations"
import { getStaffByOrganization } from "@/lib/firestore/staff"
import { getClientsByOrganization } from "@/lib/firestore/clients"
import { Organization } from "@/types/organization"
import { useAuth } from "@/lib/hooks/useAuth"

interface OrganizationWithStats extends Organization {
  staffCount: number
  clientCount: number
}

export default function OrganizationsPage() {
  const { uid } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedOrg, setSelectedOrg] = useState<OrganizationWithStats | null>(null)
  const [organizations, setOrganizations] = useState<OrganizationWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadOrganizations()
  }, [])

  const loadOrganizations = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // すべての事業所を取得
      const orgs = await getAllOrganizations()

      // 各事業所のスタッフ数とクライアント数を取得
      const orgsWithStats = await Promise.all(
        orgs.map(async (org) => {
          try {
            const staff = await getStaffByOrganization(org.id)
            const clients = await getClientsByOrganization(org.id)

            return {
              ...org,
              staffCount: staff.length,
              clientCount: clients.length,
            } as OrganizationWithStats
          } catch (err) {
            console.error(`事業所 ${org.id} の統計取得エラー:`, err)
            return {
              ...org,
              staffCount: 0,
              clientCount: 0,
            } as OrganizationWithStats
          }
        })
      )

      setOrganizations(orgsWithStats)
    } catch (err) {
      console.error('事業所データの取得エラー:', err)
      setError('事業所データの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeactivate = async (orgId: string) => {
    if (!uid) {
      alert('ユーザー情報が見つかりません')
      return
    }

    if (!confirm('この事業所を無効化してもよろしいですか？')) {
      return
    }

    try {
      await deactivateOrganization(orgId, uid)
      await loadOrganizations()
      alert('事業所を無効化しました')
    } catch (err) {
      console.error('事業所無効化エラー:', err)
      alert('事業所の無効化に失敗しました')
    }
  }

  const handleReactivate = async (orgId: string) => {
    if (!uid) {
      alert('ユーザー情報が見つかりません')
      return
    }

    if (!confirm('この事業所を再アクティブ化してもよろしいですか？')) {
      return
    }

    try {
      await reactivateOrganization(orgId, uid)
      await loadOrganizations()
      alert('事業所を再アクティブ化しました')
    } catch (err) {
      console.error('事業所再アクティブ化エラー:', err)
      alert('事業所の再アクティブ化に失敗しました')
    }
  }

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" ||
      (filterStatus === "active" && org.isActive) ||
      (filterStatus === "inactive" && !org.isActive)
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-500 text-white" : "bg-gray-500 text-white"
  }

  const getStatusText = (isActive: boolean) => {
    return isActive ? "稼働中" : "停止中"
  }

  if (isLoading) {
    return (
      <RouteGuard>
        <div className="min-h-screen bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">読み込み中...</p>
            </div>
          </div>
        </div>
      </RouteGuard>
    )
  }

  return (
    <RouteGuard>
      <div className="min-h-screen bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">事業所管理</h1>
          <p className="text-gray-400">契約事業所の一覧と利用状況</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* 統計サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-sm text-gray-400 mb-1">総事業所数</p>
            <p className="text-2xl font-bold">{organizations.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-sm text-gray-400 mb-1">稼働中</p>
            <p className="text-2xl font-bold text-green-400">
              {organizations.filter(o => o.isActive).length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-sm text-gray-400 mb-1">停止中</p>
            <p className="text-2xl font-bold text-gray-400">
              {organizations.filter(o => !o.isActive).length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-sm text-gray-400 mb-1">総ユーザー数</p>
            <p className="text-2xl font-bold">
              {organizations.reduce((sum, org) => sum + org.staffCount, 0)}
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
                <option value="inactive">停止中</option>
              </select>
              <button
                onClick={loadOrganizations}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                更新
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
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(org.isActive)}`}>
                      {getStatusText(org.isActive)}
                    </span>
                    <span className="text-sm text-gray-400">{org.organizationType}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>スタッフ: {org.staffCount}</span>
                    <span>•</span>
                    <span>利用者: {org.clientCount}</span>
                    <span>•</span>
                    <span>事業所番号: {org.organizationCode}</span>
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
                  <h4 className="font-semibold mb-3">詳細情報</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h5 className="text-sm text-gray-400 mb-1">住所</h5>
                      <p className="text-sm">
                        〒{org.postalCode || '未設定'}<br />
                        {org.prefecture || ''} {org.city || ''}<br />
                        {org.addressLine || ''}
                      </p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h5 className="text-sm text-gray-400 mb-1">連絡先</h5>
                      <p className="text-sm">
                        電話: {org.phone || '未設定'}<br />
                        Email: {org.email || '未設定'}<br />
                        管理者: {org.administratorName || '未設定'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm">
                      詳細を見る
                    </button>
                    {org.isActive ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeactivate(org.id)
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm"
                      >
                        利用を停止
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleReactivate(org.id)
                        }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm"
                      >
                        利用を再開
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
