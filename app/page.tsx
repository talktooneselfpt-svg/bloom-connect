"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getAllStaff } from "@/lib/firestore/staff"
import { getAllClients } from "@/lib/firestore/clients"
import { getAllOrganizations } from "@/lib/firestore/organizations"

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    staffCount: 0,
    clientCount: 0,
    organizationCount: 0,
    activeStaffCount: 0,
    activeClientCount: 0,
    activeOrganizationCount: 0
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [staff, clients, organizations] = await Promise.all([
        getAllStaff(),
        getAllClients(),
        getAllOrganizations()
      ])

      setStats({
        staffCount: staff.length,
        clientCount: clients.length,
        organizationCount: organizations.length,
        activeStaffCount: staff.filter(s => s.isActive).length,
        activeClientCount: clients.filter(c => c.isActive).length,
        activeOrganizationCount: organizations.filter(o => o.isActive).length
      })
    } catch (err) {
      console.error("データの取得に失敗しました:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ようこそメッセージ */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">ダッシュボード</h2>
          <p className="text-gray-600">システムの概要と主要機能へのアクセス</p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* スタッフ統計 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">スタッフ</h3>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div className="mb-2">
              <p className="text-3xl font-bold text-gray-900">{stats.staffCount}</p>
              <p className="text-sm text-gray-600">総登録数</p>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-600 font-medium">有効: {stats.activeStaffCount}</span>
              <span className="text-gray-400 mx-2">|</span>
              <span className="text-gray-600">無効: {stats.staffCount - stats.activeStaffCount}</span>
            </div>
            <button
              onClick={() => router.push("/staff")}
              className="mt-4 w-full bg-blue-50 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              スタッフ一覧を見る
            </button>
          </div>

          {/* 利用者統計 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">利用者</h3>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="mb-2">
              <p className="text-3xl font-bold text-gray-900">{stats.clientCount}</p>
              <p className="text-sm text-gray-600">総登録数</p>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-600 font-medium">有効: {stats.activeClientCount}</span>
              <span className="text-gray-400 mx-2">|</span>
              <span className="text-gray-600">無効: {stats.clientCount - stats.activeClientCount}</span>
            </div>
            <button
              onClick={() => router.push("/clients")}
              className="mt-4 w-full bg-green-50 text-green-700 px-4 py-2 rounded-md hover:bg-green-100 transition-colors text-sm font-medium"
            >
              利用者一覧を見る
            </button>
          </div>

          {/* 事業所統計 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">事業所</h3>
              <div className="bg-purple-100 rounded-full p-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <div className="mb-2">
              <p className="text-3xl font-bold text-gray-900">{stats.organizationCount}</p>
              <p className="text-sm text-gray-600">総登録数</p>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-600 font-medium">有効: {stats.activeOrganizationCount}</span>
              <span className="text-gray-400 mx-2">|</span>
              <span className="text-gray-600">無効: {stats.organizationCount - stats.activeOrganizationCount}</span>
            </div>
            <button
              onClick={() => router.push("/organizations")}
              className="mt-4 w-full bg-purple-50 text-purple-700 px-4 py-2 rounded-md hover:bg-purple-100 transition-colors text-sm font-medium"
            >
              事業所一覧を見る
            </button>
          </div>
        </div>

        {/* クイックアクション */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">クイックアクション</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push("/staff/new")}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              スタッフを追加
            </button>
            <button
              onClick={() => router.push("/clients/new")}
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              利用者を追加
            </button>
            <button
              onClick={() => router.push("/organizations/new")}
              className="flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              事業所を追加
            </button>
          </div>
        </div>

        {/* 主要機能へのアクセス */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">主要機能</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => router.push("/staff")}
              className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
            >
              <div className="bg-blue-100 rounded-lg p-2 mt-1">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">スタッフ管理</h4>
                <p className="text-sm text-gray-600">スタッフの登録・編集・検索</p>
              </div>
            </button>

            <button
              onClick={() => router.push("/clients")}
              className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left"
            >
              <div className="bg-green-100 rounded-lg p-2 mt-1">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">利用者管理</h4>
                <p className="text-sm text-gray-600">利用者の登録・編集・情報管理</p>
              </div>
            </button>

            <button
              onClick={() => router.push("/organizations")}
              className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
            >
              <div className="bg-purple-100 rounded-lg p-2 mt-1">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">事業所管理</h4>
                <p className="text-sm text-gray-600">事業所の登録・編集・設定</p>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
