"use client"

import { useState, useEffect } from "react"
import { db, getCollectionName } from "@/lib/firebase"
import { collection, query, where, getCountFromServer, getDocs, orderBy, limit } from "firebase/firestore"
import type { Organization } from "@/types"

interface DashboardStats {
  totalOrganizations: number
  activeOrganizations: number
  totalStaff: number
  activeStaff: number
  totalClients: number
  activeClients: number
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalOrganizations: 0,
    activeOrganizations: 0,
    totalStaff: 0,
    activeStaff: 0,
    totalClients: 0,
    activeClients: 0,
  })
  const [recentOrganizations, setRecentOrganizations] = useState<Organization[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // 全事業所の統計を取得
      const [
        orgCount,
        activeOrgCount,
        staffCount,
        activeStaffCount,
        clientCount,
        activeClientCount,
      ] = await Promise.all([
        getCountFromServer(collection(db, getCollectionName('organizations'))),
        getCountFromServer(
          query(collection(db, getCollectionName('organizations')), where('isActive', '==', true))
        ),
        getCountFromServer(collection(db, getCollectionName('staff'))),
        getCountFromServer(
          query(collection(db, getCollectionName('staff')), where('isActive', '==', true))
        ),
        getCountFromServer(collection(db, getCollectionName('clients'))),
        getCountFromServer(
          query(collection(db, getCollectionName('clients')), where('isActive', '==', true))
        ),
      ])

      setStats({
        totalOrganizations: orgCount.data().count,
        activeOrganizations: activeOrgCount.data().count,
        totalStaff: staffCount.data().count,
        activeStaff: activeStaffCount.data().count,
        totalClients: clientCount.data().count,
        activeClients: activeClientCount.data().count,
      })

      // 最近登録された事業所を取得
      const recentOrgsQuery = query(
        collection(db, getCollectionName('organizations')),
        orderBy('createdAt', 'desc'),
        limit(5)
      )
      const recentOrgsSnapshot = await getDocs(recentOrgsQuery)
      const orgs = recentOrgsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Organization[]
      setRecentOrganizations(orgs)
    } catch (err) {
      console.error("データの取得に失敗しました:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-16 mb-2"></div>
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">運営ダッシュボード</h2>
        <p className="text-gray-600">全事業所の統計情報と使用状況を一元管理</p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* 事業所統計 */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-indigo-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">登録事業所数</h3>
            <div className="bg-indigo-100 rounded-full p-3">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <div className="mb-2">
            <p className="text-4xl font-bold text-gray-900">{stats.totalOrganizations}</p>
            <p className="text-sm text-gray-600">総事業所数</p>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-green-600 font-medium">アクティブ: {stats.activeOrganizations}</span>
            <span className="text-gray-400 mx-2">|</span>
            <span className="text-gray-600">非アクティブ: {stats.totalOrganizations - stats.activeOrganizations}</span>
          </div>
        </div>

        {/* スタッフ統計 */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">総スタッフ数</h3>
            <div className="bg-blue-100 rounded-full p-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="mb-2">
            <p className="text-4xl font-bold text-gray-900">{stats.totalStaff}</p>
            <p className="text-sm text-gray-600">全事業所合計</p>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-green-600 font-medium">アクティブ: {stats.activeStaff}</span>
            <span className="text-gray-400 mx-2">|</span>
            <span className="text-gray-600">非アクティブ: {stats.totalStaff - stats.activeStaff}</span>
          </div>
        </div>

        {/* 利用者統計 */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">総利用者数</h3>
            <div className="bg-green-100 rounded-full p-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mb-2">
            <p className="text-4xl font-bold text-gray-900">{stats.totalClients}</p>
            <p className="text-sm text-gray-600">全事業所合計</p>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-green-600 font-medium">アクティブ: {stats.activeClients}</span>
            <span className="text-gray-400 mx-2">|</span>
            <span className="text-gray-600">非アクティブ: {stats.totalClients - stats.activeClients}</span>
          </div>
        </div>
      </div>

      {/* アクティビティ概要 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 最近登録された事業所 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">最近登録された事業所</h3>
            <a href="/admin/organizations" className="text-sm text-indigo-600 hover:text-indigo-800">
              すべて見る →
            </a>
          </div>
          {recentOrganizations.length === 0 ? (
            <p className="text-gray-500 text-sm">登録された事業所がありません</p>
          ) : (
            <div className="space-y-3">
              {recentOrganizations.map(org => (
                <div key={org.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${org.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{org.name}</p>
                      <p className="text-xs text-gray-600">{org.type}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {org.createdAt && typeof org.createdAt.toDate === 'function'
                      ? new Date(org.createdAt.toDate()).toLocaleDateString('ja-JP')
                      : '日付不明'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* システム情報 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">システム情報</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">環境</span>
              <span className="font-medium text-indigo-600">開発環境 (Development)</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">データベース</span>
              <span className="font-medium text-gray-900">dev_* コレクション</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">デプロイURL</span>
              <span className="font-medium text-gray-900 text-sm">bloom-connect-dev.web.app</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">最終更新</span>
              <span className="font-medium text-gray-900">{new Date().toLocaleString('ja-JP')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* クイックアクション */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">クイックアクション</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/admin/organizations"
            className="flex items-center gap-3 p-4 border-2 border-indigo-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all"
          >
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <div>
              <p className="font-medium text-gray-900">事業所管理</p>
              <p className="text-xs text-gray-600">一覧・詳細表示</p>
            </div>
          </a>

          <a
            href="/admin/analytics"
            className="flex items-center gap-3 p-4 border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div>
              <p className="font-medium text-gray-900">使用状況分析</p>
              <p className="text-xs text-gray-600">統計・レポート</p>
            </div>
          </a>

          <a
            href="/admin/releases"
            className="flex items-center gap-3 p-4 border-2 border-green-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
          >
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <div>
              <p className="font-medium text-gray-900">アプリ管理</p>
              <p className="text-xs text-gray-600">リリース・デプロイ</p>
            </div>
          </a>

          <a
            href="/"
            className="flex items-center gap-3 p-4 border-2 border-purple-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
          >
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <div>
              <p className="font-medium text-gray-900">エンドユーザー画面</p>
              <p className="text-xs text-gray-600">プレビュー表示</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
