"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getOrganization } from "@/lib/firestore/organizations"
import { getStaffByOrganization } from "@/lib/firestore/staff"
import { getClientsByOrganization } from "@/lib/firestore/clients"
import type { Organization } from "@/types/organization"
import type { Staff } from "@/types/staff"
import type { Client } from "@/types/client"

export default function OrganizationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const organizationId = params.id as string

  const [loading, setLoading] = useState(true)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [staff, setStaff] = useState<Staff[]>([])
  const [clients, setClients] = useState<Client[]>([])

  useEffect(() => {
    loadOrganizationDetails()
  }, [organizationId])

  const loadOrganizationDetails = async () => {
    try {
      setLoading(true)

      const [orgData, staffData, clientData] = await Promise.all([
        getOrganization(organizationId),
        getStaffByOrganization(organizationId),
        getClientsByOrganization(organizationId)
      ])

      setOrganization(orgData)
      setStaff(staffData)
      setClients(clientData)
    } catch (err) {
      console.error("データの取得に失敗しました:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

  if (!organization) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">事業所が見つかりません</h3>
          <p className="text-gray-600 mb-4">指定された事業所は存在しないか、削除されています。</p>
          <button
            onClick={() => router.push('/admin/organizations')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            事業所一覧に戻る
          </button>
        </div>
      </div>
    )
  }

  const activeStaff = staff.filter(s => s.isActive)
  const activeClients = clients.filter(c => c.isActive)

  return (
    <div className="p-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/admin/organizations')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          事業所一覧に戻る
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-gray-900">{organization.name}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                organization.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {organization.isActive ? 'アクティブ' : '非アクティブ'}
              </span>
            </div>
            <p className="text-gray-600">{organization.organizationType}</p>
          </div>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">スタッフ数</h3>
          <p className="text-4xl font-bold text-gray-900 mb-2">{staff.length}</p>
          <div className="text-sm text-gray-600">
            <span className="text-green-600 font-medium">アクティブ: {activeStaff.length}</span>
            <span className="text-gray-400 mx-2">|</span>
            <span>非アクティブ: {staff.length - activeStaff.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">利用者数</h3>
          <p className="text-4xl font-bold text-gray-900 mb-2">{clients.length}</p>
          <div className="text-sm text-gray-600">
            <span className="text-green-600 font-medium">アクティブ: {activeClients.length}</span>
            <span className="text-gray-400 mx-2">|</span>
            <span>非アクティブ: {clients.length - activeClients.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">登録日</h3>
          <p className="text-lg font-medium text-gray-900">
            {organization.createdAt && typeof organization.createdAt.toDate === 'function'
              ? new Date(organization.createdAt.toDate()).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              : '不明'}
          </p>
          <p className="text-sm text-gray-600 mt-1">事業所コード: {organization.organizationCode}</p>
        </div>
      </div>

      {/* 詳細情報 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 基本情報 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">基本情報</h3>
          <dl className="space-y-3">
            <div className="flex items-start">
              <dt className="w-32 text-sm font-medium text-gray-600">事業所名</dt>
              <dd className="flex-1 text-sm text-gray-900">{organization.name}</dd>
            </div>
            {organization.nameKana && (
              <div className="flex items-start">
                <dt className="w-32 text-sm font-medium text-gray-600">かな</dt>
                <dd className="flex-1 text-sm text-gray-900">{organization.nameKana}</dd>
              </div>
            )}
            <div className="flex items-start">
              <dt className="w-32 text-sm font-medium text-gray-600">種別</dt>
              <dd className="flex-1 text-sm text-gray-900">{organization.organizationType}</dd>
            </div>
            <div className="flex items-start">
              <dt className="w-32 text-sm font-medium text-gray-600">管理者</dt>
              <dd className="flex-1 text-sm text-gray-900">{organization.administratorName}</dd>
            </div>
            {organization.administratorEmail && (
              <div className="flex items-start">
                <dt className="w-32 text-sm font-medium text-gray-600">管理者メール</dt>
                <dd className="flex-1 text-sm text-gray-900">{organization.administratorEmail}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* 連絡先情報 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">連絡先情報</h3>
          <dl className="space-y-3">
            <div className="flex items-start">
              <dt className="w-32 text-sm font-medium text-gray-600">電話番号</dt>
              <dd className="flex-1 text-sm text-gray-900">{organization.phone}</dd>
            </div>
            <div className="flex items-start">
              <dt className="w-32 text-sm font-medium text-gray-600">メール</dt>
              <dd className="flex-1 text-sm text-gray-900">{organization.email}</dd>
            </div>
            {(organization.prefecture || organization.city || organization.addressLine) && (
              <>
                <div className="flex items-start">
                  <dt className="w-32 text-sm font-medium text-gray-600">住所</dt>
                  <dd className="flex-1 text-sm text-gray-900">
                    {organization.postalCode && <div>〒{organization.postalCode}</div>}
                    <div>{[organization.prefecture, organization.city, organization.addressLine].filter(Boolean).join(' ')}</div>
                  </dd>
                </div>
              </>
            )}
          </dl>
        </div>
      </div>

      {/* スタッフ一覧 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">スタッフ一覧</h3>
          <span className="text-sm text-gray-600">{staff.length}名</span>
        </div>
        {staff.length === 0 ? (
          <p className="text-gray-500 text-center py-8">登録されているスタッフがいません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">氏名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">職員番号</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">役職</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staff.map((s) => (
                  <tr key={s.uid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.nameKanji}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{s.staffNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{s.position || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        s.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {s.isActive ? '在職中' : '退職'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 利用者一覧 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">利用者一覧</h3>
          <span className="text-sm text-gray-600">{clients.length}名</span>
        </div>
        {clients.length === 0 ? (
          <p className="text-gray-500 text-center py-8">登録されている利用者がいません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">氏名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">年齢</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">要介護度</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.nameKanji}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {c.birthDate ? `${Math.floor((new Date().getTime() - new Date(c.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))}歳` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{c.careLevel || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        c.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {c.isActive ? '利用中' : '退所'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
