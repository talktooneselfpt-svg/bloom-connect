"use client"

import { useState, useEffect } from "react"
import { db, getCollectionName } from "@/lib/firebase"
import { collection, getDocs, query, where, orderBy } from "firebase/firestore"
import type { Organization } from "@/types/organization"
import type { Staff } from "@/types/staff"
import type { Client } from "@/types/client"

interface OrganizationStats {
  organization: Organization
  staffCount: number
  activeStaffCount: number
  clientCount: number
  activeClientCount: number
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [orgStats, setOrgStats] = useState<OrganizationStats[]>([])
  const [totalStats, setTotalStats] = useState({
    totalOrgs: 0,
    activeOrgs: 0,
    totalStaff: 0,
    activeStaff: 0,
    totalClients: 0,
    activeClients: 0
  })

  useEffect(() => {
    loadAnalyticsData()
  }, [])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)

      // 全事業所を取得
      const orgsSnapshot = await getDocs(
        query(collection(db, getCollectionName('organizations')), orderBy('name', 'asc'))
      )
      const organizations = orgsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Organization[]

      // 全スタッフを取得
      const staffSnapshot = await getDocs(collection(db, getCollectionName('staff')))
      const allStaff = staffSnapshot.docs.map(doc => doc.data()) as Staff[]

      // 全利用者を取得
      const clientsSnapshot = await getDocs(collection(db, getCollectionName('clients')))
      const allClients = clientsSnapshot.docs.map(doc => doc.data()) as Client[]

      // 事業所ごとの統計を計算
      const stats: OrganizationStats[] = organizations.map(org => {
        const orgStaff = allStaff.filter(s => s.organizationId === org.id)
        const orgClients = allClients.filter(c => c.organizationId === org.id)

        return {
          organization: org,
          staffCount: orgStaff.length,
          activeStaffCount: orgStaff.filter(s => s.isActive).length,
          clientCount: orgClients.length,
          activeClientCount: orgClients.filter(c => c.isActive).length
        }
      })

      setOrgStats(stats)

      // 全体統計を計算
      setTotalStats({
        totalOrgs: organizations.length,
        activeOrgs: organizations.filter(o => o.isActive).length,
        totalStaff: allStaff.length,
        activeStaff: allStaff.filter(s => s.isActive).length,
        totalClients: allClients.length,
        activeClients: allClients.filter(c => c.isActive).length
      })
    } catch (err) {
      console.error("分析データの取得に失敗しました:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">使用状況分析</h2>
        <p className="text-gray-600">全事業所の活動状況とアクティビティレポート</p>
      </div>

      {/* 全体統計 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2 opacity-90">総事業所数</h3>
          <p className="text-4xl font-bold mb-2">{totalStats.totalOrgs}</p>
          <p className="text-sm opacity-80">アクティブ: {totalStats.activeOrgs} ({Math.round((totalStats.activeOrgs / totalStats.totalOrgs) * 100)}%)</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2 opacity-90">総スタッフ数</h3>
          <p className="text-4xl font-bold mb-2">{totalStats.totalStaff}</p>
          <p className="text-sm opacity-80">アクティブ: {totalStats.activeStaff} ({totalStats.totalStaff > 0 ? Math.round((totalStats.activeStaff / totalStats.totalStaff) * 100) : 0}%)</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2 opacity-90">総利用者数</h3>
          <p className="text-4xl font-bold mb-2">{totalStats.totalClients}</p>
          <p className="text-sm opacity-80">アクティブ: {totalStats.activeClients} ({totalStats.totalClients > 0 ? Math.round((totalStats.activeClients / totalStats.totalClients) * 100) : 0}%)</p>
        </div>
      </div>

      {/* 事業所別統計 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">事業所別アクティビティ</h3>
        <p className="text-sm text-gray-600 mb-4">各事業所の登録人数とアクティブ率</p>

        {orgStats.length === 0 ? (
          <p className="text-gray-500 text-center py-8">登録されている事業所がありません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">事業所名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">種別</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">スタッフ</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">利用者</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">アクティブ率</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orgStats.map((stat) => {
                  const staffActiveRate = stat.staffCount > 0
                    ? Math.round((stat.activeStaffCount / stat.staffCount) * 100)
                    : 0
                  const clientActiveRate = stat.clientCount > 0
                    ? Math.round((stat.activeClientCount / stat.clientCount) * 100)
                    : 0
                  const overallActiveRate = Math.round((staffActiveRate + clientActiveRate) / 2)

                  return (
                    <tr key={stat.organization.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{stat.organization.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{stat.organization.organizationType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">{stat.staffCount}名</div>
                        <div className="text-xs text-gray-500">({stat.activeStaffCount}名 活動中)</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">{stat.clientCount}名</div>
                        <div className="text-xs text-gray-500">({stat.activeClientCount}名 利用中)</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-full max-w-xs">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    overallActiveRate >= 80 ? 'bg-green-500' :
                                    overallActiveRate >= 50 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${overallActiveRate}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900 w-12 text-right">
                                {overallActiveRate}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          stat.organization.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {stat.organization.isActive ? 'アクティブ' : '非アクティブ'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* インサイト */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* トップパフォーマー */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">利用者数トップ5</h3>
          <div className="space-y-3">
            {orgStats
              .sort((a, b) => b.activeClientCount - a.activeClientCount)
              .slice(0, 5)
              .map((stat, index) => (
                <div key={stat.organization.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-400' :
                      'bg-indigo-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{stat.organization.name}</p>
                      <p className="text-xs text-gray-600">{stat.organization.organizationType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{stat.activeClientCount}名</p>
                    <p className="text-xs text-gray-600">利用中</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* スタッフ数トップ5 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">スタッフ数トップ5</h3>
          <div className="space-y-3">
            {orgStats
              .sort((a, b) => b.activeStaffCount - a.activeStaffCount)
              .slice(0, 5)
              .map((stat, index) => (
                <div key={stat.organization.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-400' :
                      'bg-blue-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{stat.organization.name}</p>
                      <p className="text-xs text-gray-600">{stat.organization.organizationType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{stat.activeStaffCount}名</p>
                    <p className="text-xs text-gray-600">在職中</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
