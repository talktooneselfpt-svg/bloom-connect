"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { getClient, retireClient, reactivateClient } from "@/lib/firestore/clients"
import { Client } from "@/types/client"
import { calculateAge } from "@/lib/utils/age"

export default function ClientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params.id as string

  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadClient()
  }, [clientId])

  const loadClient = async () => {
    try {
      setLoading(true)
      const data = await getClient(clientId)
      if (!data) {
        setError("利用者が見つかりませんでした")
        return
      }
      setClient(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "利用者情報の取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  const handleRetire = async () => {
    if (!client) return
    if (!confirm("この利用者を退所処理しますか？")) return

    try {
      // TODO: 実際のユーザーIDに置き換え
      await retireClient(clientId, "temp-user-id")
      await loadClient()
    } catch (err) {
      alert(err instanceof Error ? err.message : "退所処理に失敗しました")
    }
  }

  const handleReactivate = async () => {
    if (!client) return
    if (!confirm("この利用者を再アクティブ化しますか？")) return

    try {
      // TODO: 実際のユーザーIDに置き換え
      await reactivateClient(clientId, "temp-user-id")
      await loadClient()
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

  if (error || !client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded max-w-md">
          {error || "利用者が見つかりませんでした"}
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
            <h1 className="text-3xl font-bold text-gray-900">{client.nameKanji}</h1>
            <p className="text-gray-600">{client.nameKana}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/clients/${clientId}/edit`)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              編集
            </button>
            {client.isActive ? (
              <button
                onClick={handleRetire}
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
              >
                退所処理
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
              client.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
            }`}
          >
            {client.isActive ? "利用中" : "退所済み"}
          </span>
        </div>

        {/* 基本情報 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">基本情報</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">生年月日</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {client.birthDate} ({calculateAge(client.birthDate)}歳)
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">性別</dt>
              <dd className="mt-1 text-sm text-gray-900">{client.gender}</dd>
            </div>
            {client.height && (
              <div>
                <dt className="text-sm font-medium text-gray-500">身長</dt>
                <dd className="mt-1 text-sm text-gray-900">{client.height} cm</dd>
              </div>
            )}
            {client.weight && (
              <div>
                <dt className="text-sm font-medium text-gray-500">体重</dt>
                <dd className="mt-1 text-sm text-gray-900">{client.weight} kg</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">居住形態</dt>
              <dd className="mt-1 text-sm text-gray-900">{client.livingArrangement}</dd>
            </div>
          </dl>
        </div>

        {/* 医療・ケア情報 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">医療・ケア情報</h2>
          <dl className="grid grid-cols-2 gap-4">
            {client.primaryDiseases && (
              <div className="col-span-2">
                <dt className="text-sm font-medium text-gray-500">主疾患</dt>
                <dd className="mt-1 text-sm text-gray-900">{client.primaryDiseases}</dd>
              </div>
            )}
            {client.medicalHistory && (
              <div className="col-span-2">
                <dt className="text-sm font-medium text-gray-500">既往歴</dt>
                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{client.medicalHistory}</dd>
              </div>
            )}
            {client.careLevel && (
              <div>
                <dt className="text-sm font-medium text-gray-500">介護度</dt>
                <dd className="mt-1 text-sm text-gray-900">{client.careLevel}</dd>
              </div>
            )}
            {client.adlLevel && (
              <div className="col-span-2">
                <dt className="text-sm font-medium text-gray-500">日常生活自立度</dt>
                <dd className="mt-1 text-sm text-gray-900">{client.adlLevel}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">難病</dt>
              <dd className="mt-1 text-sm text-gray-900">{client.hasDifficultDisease ? "あり" : "なし"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">障害</dt>
              <dd className="mt-1 text-sm text-gray-900">{client.hasDisability ? "あり" : "なし"}</dd>
            </div>
            {client.medications && (
              <div className="col-span-2">
                <dt className="text-sm font-medium text-gray-500">服薬情報</dt>
                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{client.medications}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* リスク管理・特記事項 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">リスク管理・特記事項</h2>
          <dl className="grid grid-cols-2 gap-4">
            {client.allergies && (
              <div className="col-span-2">
                <dt className="text-sm font-medium text-gray-500">アレルギー</dt>
                <dd className="mt-1 text-sm text-red-600 font-semibold">{client.allergies}</dd>
              </div>
            )}
            {client.contraindications && (
              <div className="col-span-2">
                <dt className="text-sm font-medium text-gray-500">禁忌事項</dt>
                <dd className="mt-1 text-sm text-red-600 font-semibold whitespace-pre-wrap">
                  {client.contraindications}
                </dd>
              </div>
            )}
            {client.specialNotes && (
              <div className="col-span-2">
                <dt className="text-sm font-medium text-gray-500">留意事項</dt>
                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{client.specialNotes}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">緊急連絡先</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {client.emergencyContact}
                {client.emergencyContactRelation && ` (${client.emergencyContactRelation})`}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">転倒歴</dt>
              <dd className="mt-1 text-sm text-gray-900">{client.hasFallHistory ? "あり" : "なし"}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-sm font-medium text-gray-500">嚥下状態</dt>
              <dd className="mt-1">
                <span
                  className={`px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                    client.swallowingStatus === "普通"
                      ? "bg-green-100 text-green-800"
                      : client.swallowingStatus === "要注意"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {client.swallowingStatus}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        {/* メタ情報 */}
        <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-600">
          <p>作成日時: {client.createdAt?.toDate().toLocaleString("ja-JP")}</p>
          <p>更新日時: {client.updatedAt?.toDate().toLocaleString("ja-JP")}</p>
          {client.retiredAt && (
            <p className="text-orange-600">退所日時: {client.retiredAt.toDate().toLocaleString("ja-JP")}</p>
          )}
        </div>
      </div>
    </div>
  )
}
