"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { getAllOrganizations } from "@/lib/firestore/organizations"
import { Organization, ORGANIZATION_TYPES } from "@/types/organization"

export default function OrganizationsPage() {
  const router = useRouter()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // フィルタ・検索の状態
  const [searchTerm, setSearchTerm] = useState("")
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("active")
  const [filterType, setFilterType] = useState<string>("")

  useEffect(() => {
    loadOrganizations()
  }, [])

  const loadOrganizations = async () => {
    try {
      setLoading(true)
      const data = await getAllOrganizations()
      setOrganizations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "事業所情報の取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  // フィルタリング・検索ロジック
  const filteredOrganizations = useMemo(() => {
    return organizations.filter(org => {
      // 検索語でフィルタリング
      const matchesSearch =
        searchTerm === "" ||
        org.name.includes(searchTerm) ||
        org.nameKana?.includes(searchTerm) ||
        org.organizationCode.includes(searchTerm)

      // アクティブ状態でフィルタリング
      const matchesActive =
        filterActive === "all" ||
        (filterActive === "active" && org.isActive) ||
        (filterActive === "inactive" && !org.isActive)

      // 事業所種別でフィルタリング
      const matchesType =
        filterType === "" || org.organizationType === filterType

      return matchesSearch && matchesActive && matchesType
    })
  }, [organizations, searchTerm, filterActive, filterType])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded max-w-md">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">事業所一覧</h1>
          <button
            onClick={() => router.push("/organizations/new")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            新規登録
          </button>
        </div>

        {/* 検索・フィルタエリア */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 検索 */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                検索
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="事業所名・番号で検索..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>

            {/* アクティブ状態フィルタ */}
            <div>
              <label htmlFor="filterActive" className="block text-sm font-medium text-gray-700 mb-1">
                状態
              </label>
              <select
                id="filterActive"
                value={filterActive}
                onChange={e => setFilterActive(e.target.value as "all" | "active" | "inactive")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              >
                <option value="all">全て</option>
                <option value="active">有効</option>
                <option value="inactive">無効</option>
              </select>
            </div>

            {/* 事業所種別フィルタ */}
            <div>
              <label htmlFor="filterType" className="block text-sm font-medium text-gray-700 mb-1">
                事業所種別
              </label>
              <select
                id="filterType"
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              >
                <option value="">全て</option>
                {ORGANIZATION_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* クリアボタン */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("")
                  setFilterActive("active")
                  setFilterType("")
                }}
                className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                クリア
              </button>
            </div>
          </div>

          <div className="mt-2 text-sm text-gray-600">
            {filteredOrganizations.length}件の事業所が見つかりました
          </div>
        </div>

        {/* 事業所一覧テーブル */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    事業所番号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    事業所名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    種別
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    所在地
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    管理者
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
                {filteredOrganizations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      事業所が見つかりませんでした
                    </td>
                  </tr>
                ) : (
                  filteredOrganizations.map(org => (
                    <tr
                      key={org.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/organizations/${org.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {org.organizationCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{org.name}</div>
                        {org.nameKana && (
                          <div className="text-sm text-gray-500">{org.nameKana}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {org.organizationType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {org.prefecture && org.city ? `${org.prefecture} ${org.city}` : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {org.administratorName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            org.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {org.isActive ? "有効" : "無効"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            router.push(`/organizations/${org.id}/edit`)
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          編集
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            router.push(`/organizations/${org.id}`)
                          }}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          詳細
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
