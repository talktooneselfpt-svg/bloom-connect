"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { getOrganization, deactivateOrganization, reactivateOrganization } from "@/lib/firestore/organizations"
import { Organization } from "@/types/organization"

// 静的エクスポート用の設定 - 動的ルートをクライアントサイドで処理
export const dynamicParams = true

export default function OrganizationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const organizationId = params.id as string

  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadOrganization()
  }, [organizationId])

  const loadOrganization = async () => {
    try {
      setLoading(true)
      const data = await getOrganization(organizationId)
      if (!data) {
        setError("事業所が見つかりませんでした")
        return
      }
      setOrganization(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "事業所情報の取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivate = async () => {
    if (!organization) return
    if (!confirm("この事業所を無効化しますか？")) return

    try {
      // TODO: 実際のユーザーIDに置き換え
      await deactivateOrganization(organizationId, "temp-user-id")
      await loadOrganization()
    } catch (err) {
      alert(err instanceof Error ? err.message : "無効化に失敗しました")
    }
  }

  const handleReactivate = async () => {
    if (!organization) return
    if (!confirm("この事業所を再アクティブ化しますか？")) return

    try {
      // TODO: 実際のユーザーIDに置き換え
      await reactivateOrganization(organizationId, "temp-user-id")
      await loadOrganization()
    } catch (err) {
      alert(err instanceof Error ? err.message : "再アクティブ化に失敗しました")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
  }

  if (error || !organization) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded max-w-md">
          {error || "事業所が見つかりませんでした"}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{organization.name}</h1>
            {organization.nameKana && (
              <p className="text-gray-600">{organization.nameKana}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/organizations/${organizationId}/edit`)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              編集
            </button>
            {organization.isActive ? (
              <button
                onClick={handleDeactivate}
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
              >
                無効化
              </button>
            ) : (
              <button
                onClick={handleReactivate}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
              >
                再アクティブ化
              </button>
            )}
            <button
              onClick={() => router.back()}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              戻る
            </button>
          </div>
        </div>

        {/* 状態バッジ */}
        <div className="mb-6">
          <span
            className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
              organization.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
            }`}
          >
            {organization.isActive ? "有効" : "無効"}
          </span>
        </div>

        {/* ロゴ */}
        {organization.logoUrl && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">ロゴ</h2>
            <img
              src={organization.logoUrl}
              alt={`${organization.name}のロゴ`}
              className="max-w-xs max-h-32 object-contain"
            />
          </div>
        )}

        {/* 基本情報 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">基本情報</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">事業所番号</dt>
              <dd className="mt-1 text-sm text-gray-900 font-medium">{organization.organizationCode}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">事業所種別</dt>
              <dd className="mt-1 text-sm text-gray-900">{organization.organizationType}</dd>
            </div>
            {organization.plan && (
              <div>
                <dt className="text-sm font-medium text-gray-500">プラン</dt>
                <dd className="mt-1 text-sm text-gray-900">{organization.plan}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* 所在地情報 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">所在地</h2>
          <dl className="space-y-2">
            {organization.postalCode && (
              <div>
                <dt className="text-sm font-medium text-gray-500">郵便番号</dt>
                <dd className="mt-1 text-sm text-gray-900">〒{organization.postalCode}</dd>
              </div>
            )}
            {(organization.prefecture || organization.city || organization.addressLine) && (
              <div>
                <dt className="text-sm font-medium text-gray-500">住所</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {organization.prefecture} {organization.city} {organization.addressLine}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* 連絡先情報 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">連絡先</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">電話番号</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <a href={`tel:${organization.phone}`} className="text-blue-600 hover:underline">
                  {organization.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">メールアドレス</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <a href={`mailto:${organization.email}`} className="text-blue-600 hover:underline">
                  {organization.email}
                </a>
              </dd>
            </div>
          </dl>
        </div>

        {/* 管理者情報 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">管理者情報</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">管理者名</dt>
              <dd className="mt-1 text-sm text-gray-900">{organization.administratorName}</dd>
            </div>
            {organization.administratorEmail && (
              <div>
                <dt className="text-sm font-medium text-gray-500">管理者メールアドレス</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <a href={`mailto:${organization.administratorEmail}`} className="text-blue-600 hover:underline">
                    {organization.administratorEmail}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* 規約同意情報 */}
        {organization.termsAgreement && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">規約同意情報</h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">規約バージョン</dt>
                <dd className="mt-1 text-sm text-gray-900">{organization.termsAgreement.version}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">同意日時</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {organization.termsAgreement.agreedAt?.toDate().toLocaleString("ja-JP")}
                </dd>
              </div>
            </dl>
          </div>
        )}

        {/* メタ情報 */}
        <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-600">
          <p>作成日時: {organization.createdAt?.toDate().toLocaleString("ja-JP")}</p>
          <p>更新日時: {organization.updatedAt?.toDate().toLocaleString("ja-JP")}</p>
        </div>
      </div>
    </div>
  )
}
