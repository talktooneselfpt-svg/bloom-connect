"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { getClient, retireClient, reactivateClient } from "@/lib/firestore/clients"
import { Client } from "@/types/client"
import { calculateAge } from "@/lib/utils/age"

// 静的エクスポート用の設定 - クライアントサイドでレンダリング
export async function generateStaticParams() {
  return []
}

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

  // 既往歴を日付順にソート
  const sortedMedicalHistory = client.medicalHistoryRecords
    ? [...client.medicalHistoryRecords].sort((a, b) =>
        new Date(b.diagnosisDate).getTime() - new Date(a.diagnosisDate).getTime()
      )
    : []

  // 緊急連絡先を優先順位でソート
  const sortedFamilyMembers = client.familyMembers
    ? [...client.familyMembers].sort((a, b) => a.priority - b.priority)
    : []

  // 現在服用中の薬をフィルタリング
  const activeMedications = client.medicationList?.filter(med => med.isActive) || []
  const inactiveMedications = client.medicationList?.filter(med => !med.isActive) || []

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

        {/* 家族・キーパーソン情報 */}
        {sortedFamilyMembers.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">家族・緊急連絡先</h2>
            <div className="space-y-4">
              {sortedFamilyMembers.map((member, index) => (
                <div key={member.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-900">{member.name}</span>
                    <span className="text-sm text-gray-600">({member.relation})</span>
                    {member.isEmergencyContact && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                        緊急連絡先 #{member.priority}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>📞 {member.phoneNumber}</p>
                    {member.email && <p>✉️ {member.email}</p>}
                    {member.address && <p>🏠 {member.address}</p>}
                    {member.notes && <p className="text-gray-600 italic">メモ: {member.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 主治医・医療機関情報 */}
        {(client.primaryDoctor || (client.medicalInstitutions && client.medicalInstitutions.length > 0)) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">主治医・医療機関</h2>

            {client.primaryDoctor && (
              <div className="mb-4 pb-4 border-b">
                <h3 className="text-sm font-medium text-gray-500 mb-2">主治医</h3>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="font-medium text-gray-900">{client.primaryDoctor.name}</p>
                  {client.primaryDoctor.specialization && (
                    <p className="text-sm text-gray-600">{client.primaryDoctor.specialization}</p>
                  )}
                  <p className="text-sm text-gray-700 mt-1">
                    📞 {client.primaryDoctor.phoneNumber}
                  </p>
                  <p className="text-sm text-gray-700">
                    🏥 {client.primaryDoctor.medicalInstitution}
                  </p>
                </div>
              </div>
            )}

            {client.medicalInstitutions && client.medicalInstitutions.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">通院中の医療機関</h3>
                <div className="space-y-3">
                  {client.medicalInstitutions.map((institution, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">{institution.name}</p>
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                          {institution.type}
                        </span>
                      </div>
                      {institution.department && (
                        <p className="text-sm text-gray-600">{institution.department}</p>
                      )}
                      <p className="text-sm text-gray-700">📞 {institution.phoneNumber}</p>
                      {institution.address && (
                        <p className="text-sm text-gray-700">🏠 {institution.address}</p>
                      )}
                      {institution.notes && (
                        <p className="text-sm text-gray-600 italic mt-1">{institution.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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
          </dl>
        </div>

        {/* 既往歴タイムライン */}
        {sortedMedicalHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">既往歴</h2>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
              <div className="space-y-4 relative">
                {sortedMedicalHistory.map((record, index) => (
                  <div key={record.id} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold z-10">
                      {index + 1}
                    </div>
                    <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{record.diseaseName}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          record.status === "治療中" ? "bg-yellow-100 text-yellow-800" :
                          record.status === "完治" ? "bg-green-100 text-green-800" :
                          "bg-blue-100 text-blue-800"
                        }`}>
                          {record.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        診断日: {record.diagnosisDate}
                      </p>
                      {record.treatmentPeriod && (
                        <p className="text-sm text-gray-600 mb-1">
                          治療期間: {record.treatmentPeriod}
                        </p>
                      )}
                      {record.notes && (
                        <p className="text-sm text-gray-700 mt-2">{record.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 服薬情報 */}
        {(activeMedications.length > 0 || inactiveMedications.length > 0) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">服薬情報</h2>

            {activeMedications.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3">現在服用中</h3>
                <div className="space-y-3">
                  {activeMedications.map((med) => (
                    <div key={med.id} className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{med.medicationName}</h4>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          服用中
                        </span>
                      </div>
                      <div className="text-sm space-y-1">
                        <p className="text-gray-700"><span className="font-medium">用法用量:</span> {med.dosage}</p>
                        <p className="text-gray-700"><span className="font-medium">頻度:</span> {med.frequency}</p>
                        <p className="text-gray-600">開始日: {med.startDate}</p>
                        {med.purpose && <p className="text-gray-700"><span className="font-medium">目的:</span> {med.purpose}</p>}
                        {med.sideEffects && (
                          <p className="text-red-600"><span className="font-medium">副作用・注意:</span> {med.sideEffects}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {inactiveMedications.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">過去の服薬</h3>
                <div className="space-y-3">
                  {inactiveMedications.map((med) => (
                    <div key={med.id} className="border-l-4 border-gray-300 bg-gray-50 p-4 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-700">{med.medicationName}</h4>
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                          終了
                        </span>
                      </div>
                      <div className="text-sm space-y-1 text-gray-600">
                        <p>{med.dosage} - {med.frequency}</p>
                        <p>期間: {med.startDate} 〜 {med.endDate || "不明"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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
