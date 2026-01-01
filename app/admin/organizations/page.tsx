"use client"

import { useState, useEffect } from "react"
import { db, getCollectionName } from "@/lib/firebase"
import { collection, getDocs, query, where, orderBy } from "firebase/firestore"
import type { Organization } from "@/types/organization"
import Link from "next/link"

export default function OrganizationsPage() {
  const [loading, setLoading] = useState(true)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([])
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadOrganizations()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filter, searchQuery, organizations])

  const loadOrganizations = async () => {
    try {
      setLoading(true)
      const orgsQuery = query(
        collection(db, getCollectionName('organizations')),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(orgsQuery)
      const orgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Organization[]
      setOrganizations(orgs)
      setFilteredOrgs(orgs)
    } catch (err) {
      console.error("事業所の取得に失敗しました:", err)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = organizations

    // アクティブフィルター
    if (filter === "active") {
      filtered = filtered.filter(org => org.isActive)
    } else if (filter === "inactive") {
      filtered = filtered.filter(org => !org.isActive)
    }

    // 検索フィルター
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const getFullAddress = (org: Organization) => {
        const parts = [org.prefecture, org.city, org.addressLine].filter(Boolean)
        return parts.join(' ')
      }
      filtered = filtered.filter(org =>
        org.name.toLowerCase().includes(query) ||
        org.organizationType.toLowerCase().includes(query) ||
        getFullAddress(org).toLowerCase().includes(query)
      )
    }

    setFilteredOrgs(filtered)
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">事業所管理</h2>
        <p className="text-gray-600">登録されている全事業所の一覧と詳細情報</p>
      </div>

      {/* フィルター・検索 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 検索ボックス */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">検索</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="事業所名、種別、住所で検索..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* ステータスフィルター */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ステータス</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as "all" | "active" | "inactive")}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">すべて</option>
              <option value="active">アクティブのみ</option>
              <option value="inactive">非アクティブのみ</option>
            </select>
          </div>
        </div>

        {/* 統計サマリー */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-6 text-sm">
          <span className="text-gray-700">
            表示中: <span className="font-semibold text-gray-900">{filteredOrgs.length}</span> 件
          </span>
          <span className="text-gray-700">
            総事業所数: <span className="font-semibold text-gray-900">{organizations.length}</span> 件
          </span>
          <span className="text-gray-700">
            アクティブ: <span className="font-semibold text-green-600">{organizations.filter(o => o.isActive).length}</span> 件
          </span>
        </div>
      </div>

      {/* 事業所一覧 */}
      {filteredOrgs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-gray-600 mb-2">該当する事業所が見つかりません</p>
          <p className="text-sm text-gray-500">検索条件やフィルターを変更してください</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredOrgs.map(org => (
            <div
              key={org.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  {/* ステータスインジケーター */}
                  <div className={`w-3 h-3 rounded-full mt-2 ${org.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{org.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {org.organizationType}
                      </span>
                      {org.phone && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {org.phone}
                        </span>
                      )}
                    </div>
                    {(org.prefecture || org.city || org.addressLine) && (
                      <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {[org.prefecture, org.city, org.addressLine].filter(Boolean).join(' ')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    org.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {org.isActive ? 'アクティブ' : '非アクティブ'}
                  </span>
                </div>
              </div>

              {/* 追加情報 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-600">登録日</p>
                  <p className="text-sm font-medium text-gray-900">
                    {org.createdAt && typeof org.createdAt.toDate === 'function'
                      ? new Date(org.createdAt.toDate()).toLocaleDateString('ja-JP')
                      : '不明'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">最終更新</p>
                  <p className="text-sm font-medium text-gray-900">
                    {org.updatedAt && typeof org.updatedAt.toDate === 'function'
                      ? new Date(org.updatedAt.toDate()).toLocaleDateString('ja-JP')
                      : '不明'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">事業所ID</p>
                  <p className="text-sm font-mono text-gray-900">{org.id.substring(0, 8)}...</p>
                </div>
                <div className="flex items-end justify-end">
                  <Link
                    href={`/admin/organizations/${org.id}`}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    詳細を見る
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
