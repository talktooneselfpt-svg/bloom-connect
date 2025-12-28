'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAppsWithSubscription } from '@/lib/firestore/apps'
import type { AppWithSubscription } from '@/types/app'
import { APP_CATEGORY_LABELS } from '@/types/app'

export default function AppsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [apps, setApps] = useState<AppWithSubscription[]>([])
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'purchased' | 'unpurchased'>('all')

  // TODO: 実際のログイン組織IDを取得
  const organizationId = 'test-org-001'

  useEffect(() => {
    loadApps()
  }, [])

  const loadApps = async () => {
    try {
      setLoading(true)
      const appsData = await getAppsWithSubscription(organizationId)
      setApps(appsData)
    } catch (error) {
      console.error('アプリの取得に失敗しました:', error)
      alert('アプリの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const filteredApps = apps.filter((app) => {
    if (filterCategory !== 'all' && app.category !== filterCategory) {
      return false
    }
    if (filterStatus === 'purchased' && !app.isPurchased) {
      return false
    }
    if (filterStatus === 'unpurchased' && app.isPurchased) {
      return false
    }
    return true
  })

  const getIconByName = (iconName: string) => {
    const icons: Record<string, React.ReactElement> = {
      users: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      calendar: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      chart: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      clipboard: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      clock: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      briefcase: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      document: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      chat: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    }

    return icons[iconName] || icons['document']
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-16 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">アプリストア</h1>
          <p className="text-gray-600 mt-2">事業所の業務を効率化するアプリを見つけましょう</p>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* カテゴリフィルター */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              >
                <option value="all">すべて</option>
                {Object.entries(APP_CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* ステータスフィルター */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">ステータス</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterStatus === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  すべて
                </button>
                <button
                  onClick={() => setFilterStatus('purchased')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterStatus === 'purchased'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  購入済み
                </button>
                <button
                  onClick={() => setFilterStatus('unpurchased')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterStatus === 'unpurchased'
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  未購入
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* アプリ一覧 */}
        {filteredApps.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">アプリが見つかりません</h3>
            <p className="text-gray-600">条件に一致するアプリがありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps.map((app) => (
              <button
                key={app.id}
                onClick={() => router.push(`/apps/${app.id}`)}
                className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-left ${
                  !app.isPurchased ? 'opacity-80' : ''
                }`}
              >
                <div className="p-6">
                  {/* ヘッダー */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${app.isPurchased ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                      {getIconByName(app.icon)}
                    </div>
                    {app.isPurchased && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        購入済み
                      </span>
                    )}
                  </div>

                  {/* タイトル */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{app.name}</h3>

                  {/* カテゴリ */}
                  <p className="text-sm text-gray-600 mb-3">{APP_CATEGORY_LABELS[app.category]}</p>

                  {/* 説明 */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{app.description}</p>

                  {/* 価格 */}
                  <div className="flex items-baseline justify-between pt-4 border-t border-gray-200">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">¥{app.monthlyPrice.toLocaleString()}</span>
                      <span className="text-sm text-gray-600 ml-1">/ 月</span>
                    </div>
                    {!app.isPurchased && (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
