"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { getClientsByOrganization } from "@/lib/firestore/clients"
import { Client, CARE_LEVELS } from "@/types/client"
import { calculateAge } from "@/lib/utils/age"

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // フィルタ・検索の状態
  const [searchTerm, setSearchTerm] = useState("")
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("active")
  const [filterCareLevel, setFilterCareLevel] = useState<string>("")

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      setLoading(true)
      // TODO: 実際のorganizationIdに置き換え
      const data = await getClientsByOrganization("temp-org-id")
      setClients(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "利用者情報の取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  // フィルタリング・検索ロジック
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      // 検索語でフィルタリング
      const matchesSearch =
        searchTerm === "" ||
        client.nameKanji.includes(searchTerm) ||
        client.nameKana.includes(searchTerm)

      // アクティブ状態でフィルタリング
      const matchesActive =
        filterActive === "all" ||
        (filterActive === "active" && client.isActive) ||
        (filterActive === "inactive" && !client.isActive)

      // 介護度でフィルタリング
      const matchesCareLevel =
        filterCareLevel === "" || client.careLevel === filterCareLevel

      return matchesSearch && matchesActive && matchesCareLevel
    })
  }, [clients, searchTerm, filterActive, filterCareLevel])

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
          <h1 className="text-3xl font-bold text-gray-900">利用者一覧</h1>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/clients/import")}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              CSVインポート
            </button>
            <button
              onClick={() => router.push("/clients/new")}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              新規登録
            </button>
          </div>
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
                placeholder="氏名で検索..."
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
                <option value="active">利用中</option>
                <option value="inactive">退所済み</option>
              </select>
            </div>

            {/* 介護度フィルタ */}
            <div>
              <label htmlFor="filterCareLevel" className="block text-sm font-medium text-gray-700 mb-1">
                介護度
              </label>
              <select
                id="filterCareLevel"
                value={filterCareLevel}
                onChange={e => setFilterCareLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              >
                <option value="">全て</option>
                {CARE_LEVELS.map(level => (
                  <option key={level} value={level}>
                    {level}
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
                  setFilterCareLevel("")
                }}
                className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                クリア
              </button>
            </div>
          </div>

          <div className="mt-2 text-sm text-gray-600">
            {filteredClients.length}件の利用者が見つかりました
          </div>
        </div>

        {/* 利用者一覧テーブル */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    氏名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    年齢
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    性別
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    介護度
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    居住形態
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    嚥下状態
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
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      利用者が見つかりませんでした
                    </td>
                  </tr>
                ) : (
                  filteredClients.map(client => (
                    <tr
                      key={client.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/clients/${client.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{client.nameKanji}</div>
                        <div className="text-sm text-gray-500">{client.nameKana}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {calculateAge(client.birthDate)}歳
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {client.gender}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {client.careLevel || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {client.livingArrangement}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            client.swallowingStatus === "普通"
                              ? "bg-green-100 text-green-800"
                              : client.swallowingStatus === "要注意"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {client.swallowingStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            client.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {client.isActive ? "利用中" : "退所済み"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            router.push(`/clients/${client.id}/edit`)
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          編集
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            router.push(`/clients/${client.id}`)
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
