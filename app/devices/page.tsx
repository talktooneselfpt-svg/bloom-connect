'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Device } from '@/types/device'
import { DEVICE_TYPE_LABELS } from '@/types/device'
import { getDevicesByOrganization, deleteDevice, calculateDeviceStats } from '@/lib/firestore/devices'

export default function DevicesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [devices, setDevices] = useState<Device[]>([])
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')
  const [stats, setStats] = useState({
    totalDevices: 0,
    activeDevices: 0,
    totalAssignedStaff: 0,
    averageStaffPerDevice: 0,
    devicesAtCapacity: 0,
    devicesWithSpace: 0,
  })

  // TODO: 実際のログイン組織IDを取得
  const organizationId = 'test-org-001'

  useEffect(() => {
    loadDevices()
  }, [])

  useEffect(() => {
    // フィルタリング処理
    let filtered = devices

    // アクティブフィルター
    if (filterActive === 'active') {
      filtered = filtered.filter((d) => d.isActive)
    } else if (filterActive === 'inactive') {
      filtered = filtered.filter((d) => !d.isActive)
    }

    // 検索フィルター
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((d) =>
        d.deviceName.toLowerCase().includes(query) ||
        d.description?.toLowerCase().includes(query) ||
        d.serialNumber?.toLowerCase().includes(query)
      )
    }

    setFilteredDevices(filtered)
  }, [devices, searchQuery, filterActive])

  const loadDevices = async () => {
    try {
      setLoading(true)
      const [devicesData, statsData] = await Promise.all([
        getDevicesByOrganization(organizationId),
        calculateDeviceStats(organizationId),
      ])
      setDevices(devicesData)
      setFilteredDevices(devicesData)
      setStats(statsData)
    } catch (error) {
      console.error('デバイスの取得に失敗しました:', error)
      alert('デバイスの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (deviceId: string, deviceName: string) => {
    if (!confirm(`デバイス「${deviceName}」を削除してもよろしいですか？`)) {
      return
    }

    try {
      await deleteDevice(deviceId)
      alert('デバイスを削除しました')
      loadDevices()
    } catch (error) {
      console.error('デバイスの削除に失敗しました:', error)
      alert('デバイスの削除に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-4">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
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
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">デバイス管理</h1>
            <p className="text-gray-600 mt-2">登録デバイスの管理と職員の割り当て</p>
          </div>
          <Link
            href="/devices/new"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            デバイスを追加
          </Link>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">総デバイス数</div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalDevices}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">有効デバイス</div>
            <div className="text-2xl font-bold text-green-600">{stats.activeDevices}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">割り当て職員</div>
            <div className="text-2xl font-bold text-blue-600">{stats.totalAssignedStaff}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">平均職員数</div>
            <div className="text-2xl font-bold text-purple-600">{stats.averageStaffPerDevice}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">満員デバイス</div>
            <div className="text-2xl font-bold text-orange-600">{stats.devicesAtCapacity}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">空きあり</div>
            <div className="text-2xl font-bold text-teal-600">{stats.devicesWithSpace}</div>
          </div>
        </div>

        {/* 検索とフィルター */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 検索バー */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="デバイス名、備考、シリアル番号で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>

            {/* ステータスフィルター */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterActive('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterActive === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                すべて
              </button>
              <button
                onClick={() => setFilterActive('active')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterActive === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                有効のみ
              </button>
              <button
                onClick={() => setFilterActive('inactive')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterActive === 'inactive'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                無効のみ
              </button>
            </div>
          </div>
        </div>

        {/* デバイス一覧 */}
        {filteredDevices.length === 0 ? (
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
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">デバイスが見つかりません</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || filterActive !== 'all'
                ? '検索条件に一致するデバイスがありません'
                : 'まだデバイスが登録されていません'}
            </p>
            {!searchQuery && filterActive === 'all' && (
              <Link
                href="/devices/new"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                最初のデバイスを追加
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDevices.map((device) => (
              <div
                key={device.id}
                className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow ${
                  !device.isActive ? 'opacity-60' : ''
                }`}
              >
                <div className="p-6">
                  {/* ヘッダー */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{device.deviceName}</h3>
                      <span className="text-xs text-gray-500">
                        {DEVICE_TYPE_LABELS[device.deviceType || 'other']}
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        device.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {device.isActive ? '有効' : '無効'}
                    </span>
                  </div>

                  {/* 職員割り当て状況 */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">割り当て職員</span>
                      <span
                        className={`text-sm font-semibold ${
                          device.assignedStaffIds.length >= device.maxStaff
                            ? 'text-orange-600'
                            : 'text-blue-600'
                        }`}
                      >
                        {device.assignedStaffIds.length} / {device.maxStaff}名
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          device.assignedStaffIds.length >= device.maxStaff
                            ? 'bg-orange-500'
                            : 'bg-blue-500'
                        }`}
                        style={{
                          width: `${(device.assignedStaffIds.length / device.maxStaff) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* 備考 */}
                  {device.description && (
                    <p className="text-sm text-gray-600 mb-4">{device.description}</p>
                  )}

                  {/* シリアル番号 */}
                  {device.serialNumber && (
                    <p className="text-xs text-gray-500 mb-4">S/N: {device.serialNumber}</p>
                  )}

                  {/* アクション */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/devices/${device.id}/edit`)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(device.id, device.deviceName)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
