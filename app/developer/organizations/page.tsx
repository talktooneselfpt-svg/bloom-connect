'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface OrganizationStats {
  id: string
  name: string
  staffCount: number
  clientCount: number
  deviceCount: number
  lastActivityAt?: Date
  createdAt?: Date
  monthlyFee: number
}

export default function OrganizationsStatsPage() {
  const router = useRouter()
  const [organizations, setOrganizations] = useState<OrganizationStats[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'name' | 'staffCount' | 'deviceCount' | 'monthlyFee'>('name')
  const [searchQuery, setSearchQuery] = useState('')

  // TODO: 実際のユーザー情報を取得
  const currentUserRole = 'developer' // admin, staff, developer

  useEffect(() => {
    // 開発者権限チェック
    if (currentUserRole !== 'developer' && currentUserRole !== 'admin') {
      alert('このページにアクセスする権限がありません')
      router.push('/')
      return
    }

    loadOrganizationStats()
  }, [])

  const loadOrganizationStats = async () => {
    try {
      setLoading(true)

      // 事業所一覧を取得
      const orgsSnapshot = await getDocs(collection(db, 'organizations'))
      const orgsData = orgsSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || '未設定',
        createdAt: doc.data().createdAt?.toDate(),
      }))

      // 各事業所の統計を収集
      const statsPromises = orgsData.map(async (org) => {
        // 職員数を取得
        const staffQuery = query(collection(db, 'staff'), where('organizationId', '==', org.id))
        const staffSnapshot = await getDocs(staffQuery)
        const staffCount = staffSnapshot.size

        // 利用者数を取得
        const clientsQuery = query(collection(db, 'clients'), where('organizationId', '==', org.id))
        const clientsSnapshot = await getDocs(clientsQuery)
        const clientCount = clientsSnapshot.size

        // デバイス数を取得
        const devicesQuery = query(collection(db, 'devices'), where('organizationId', '==', org.id))
        const devicesSnapshot = await getDocs(devicesQuery)
        const deviceCount = devicesSnapshot.size

        // 月額料金を計算（デバイス1台あたり1,000円）
        const monthlyFee = deviceCount * 1000

        return {
          id: org.id,
          name: org.name,
          staffCount,
          clientCount,
          deviceCount,
          createdAt: org.createdAt,
          monthlyFee,
        } as OrganizationStats
      })

      const stats = await Promise.all(statsPromises)
      setOrganizations(stats)
    } catch (error) {
      console.error('統計の取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  // ソート処理
  const sortedOrganizations = [...organizations].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'staffCount':
        return b.staffCount - a.staffCount
      case 'deviceCount':
        return b.deviceCount - a.deviceCount
      case 'monthlyFee':
        return b.monthlyFee - a.monthlyFee
      default:
        return 0
    }
  })

  // 検索フィルター
  const filteredOrganizations = sortedOrganizations.filter((org) =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 合計統計
  const totalStats = {
    organizations: organizations.length,
    staff: organizations.reduce((sum, org) => sum + org.staffCount, 0),
    clients: organizations.reduce((sum, org) => sum + org.clientCount, 0),
    devices: organizations.reduce((sum, org) => sum + org.deviceCount, 0),
    revenue: organizations.reduce((sum, org) => sum + org.monthlyFee, 0),
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link href="/developer" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← 開発者ダッシュボードに戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">事業所別統計</h1>
          <p className="text-gray-600 mt-2">各事業所の利用状況と統計情報</p>
        </div>

        {/* 全体統計 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">総事業所数</div>
            <div className="text-3xl font-bold text-gray-900">{totalStats.organizations}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">総職員数</div>
            <div className="text-3xl font-bold text-blue-600">{totalStats.staff}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">総利用者数</div>
            <div className="text-3xl font-bold text-green-600">{totalStats.clients}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">総デバイス数</div>
            <div className="text-3xl font-bold text-purple-600">{totalStats.devices}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">月間総売上</div>
            <div className="text-3xl font-bold text-orange-600">
              ¥{totalStats.revenue.toLocaleString()}
            </div>
          </div>
        </div>

        {/* フィルター・ソート */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="事業所名で検索..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 whitespace-nowrap">並び順:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">名前順</option>
                <option value="staffCount">職員数順</option>
                <option value="deviceCount">デバイス数順</option>
                <option value="monthlyFee">料金順</option>
              </select>
            </div>
          </div>
        </div>

        {/* 事業所一覧 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              事業所一覧 ({filteredOrganizations.length}件)
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">読み込み中...</div>
          ) : filteredOrganizations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery ? '検索結果がありません' : '事業所がありません'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      事業所名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      職員数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      利用者数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      デバイス数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      月額料金
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      登録日
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrganizations.map((org) => (
                    <tr key={org.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{org.name}</div>
                        <div className="text-xs text-gray-500">{org.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{org.staffCount}名</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{org.clientCount}名</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{org.deviceCount}台</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ¥{org.monthlyFee.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {org.createdAt ? org.createdAt.toLocaleDateString('ja-JP') : '-'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 注意事項 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">料金について</h3>
              <p className="text-sm text-gray-700">
                デバイス1台あたり月額1,000円で計算されています。実際の請求額は契約内容により異なる場合があります。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
