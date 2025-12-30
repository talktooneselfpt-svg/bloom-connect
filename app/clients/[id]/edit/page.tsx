"use client"

import { useState, useEffect, FormEvent } from "react"
import { useRouter, useParams } from "next/navigation"
import { getClient, updateClient } from "@/lib/firestore/clients"
import { Client, GENDERS, LIVING_ARRANGEMENTS, CARE_LEVELS, ADL_LEVELS, SWALLOWING_STATUS } from "@/types/client"
import { calculateAge, isValidBirthDate } from "@/lib/utils/age"
import RouteGuard from "@/components/RouteGuard"
export default function EditClientPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params.id as string

  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    nameKanji: "",
    nameKana: "",
    birthDate: "",
    gender: "",
    height: "",
    weight: "",
    livingArrangement: "",
    primaryDiseases: "",
    medicalHistory: "",
    careLevel: "",
    adlLevel: "",
    hasDifficultDisease: false,
    hasDisability: false,
    medications: "",
    allergies: "",
    contraindications: "",
    specialNotes: "",
    emergencyContact: "",
    emergencyContactRelation: "",
    hasFallHistory: false,
    swallowingStatus: ""
  })

  useEffect(() => {
    loadClient()
  }, [clientId])

  const loadClient = async () => {
    try {
      setLoading(true)
      const client = await getClient(clientId)
      if (!client) {
        setError("利用者が見つかりませんでした")
        return
      }

      // フォームデータに既存データをセット
      setFormData({
        nameKanji: client.nameKanji || "",
        nameKana: client.nameKana || "",
        birthDate: client.birthDate || "",
        gender: client.gender || "",
        height: client.height?.toString() || "",
        weight: client.weight?.toString() || "",
        livingArrangement: client.livingArrangement || "",
        primaryDiseases: client.primaryDiseases || "",
        medicalHistory: client.medicalHistory || "",
        careLevel: client.careLevel || "",
        adlLevel: client.adlLevel || "",
        hasDifficultDisease: client.hasDifficultDisease || false,
        hasDisability: client.hasDisability || false,
        medications: client.medications || "",
        allergies: client.allergies || "",
        contraindications: client.contraindications || "",
        specialNotes: client.specialNotes || "",
        emergencyContact: client.emergencyContact || "",
        emergencyContactRelation: client.emergencyContactRelation || "",
        hasFallHistory: client.hasFallHistory || false,
        swallowingStatus: client.swallowingStatus || ""
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "利用者情報の取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // バリデーション
      if (!formData.nameKanji || !formData.nameKana) {
        throw new Error("氏名は必須項目です")
      }
      if (!formData.birthDate) {
        throw new Error("生年月日は必須項目です")
      }
      if (!isValidBirthDate(formData.birthDate)) {
        throw new Error("生年月日が不正です")
      }
      if (!formData.gender) {
        throw new Error("性別は必須項目です")
      }
      if (!formData.livingArrangement) {
        throw new Error("居住形態は必須項目です")
      }
      if (!formData.emergencyContact) {
        throw new Error("緊急連絡先は必須項目です")
      }
      if (!formData.swallowingStatus) {
        throw new Error("嚥下状態は必須項目です")
      }

      // TODO: 実際のユーザーIDに置き換え
      const currentUserId = "temp-user-id"

      // 更新データの準備
      const updates: any = {
        nameKanji: formData.nameKanji,
        nameKana: formData.nameKana,
        birthDate: formData.birthDate,
        gender: formData.gender,
        livingArrangement: formData.livingArrangement,
        hasDifficultDisease: formData.hasDifficultDisease,
        hasDisability: formData.hasDisability,
        emergencyContact: formData.emergencyContact,
        hasFallHistory: formData.hasFallHistory,
        swallowingStatus: formData.swallowingStatus
      }

      // 任意フィールドの処理
      if (formData.height?.trim()) {
        updates.height = parseFloat(formData.height)
      }
      if (formData.weight?.trim()) {
        updates.weight = parseFloat(formData.weight)
      }
      if (formData.primaryDiseases?.trim()) {
        updates.primaryDiseases = formData.primaryDiseases.trim()
      }
      if (formData.medicalHistory?.trim()) {
        updates.medicalHistory = formData.medicalHistory.trim()
      }
      if (formData.careLevel?.trim()) {
        updates.careLevel = formData.careLevel.trim()
      }
      if (formData.adlLevel?.trim()) {
        updates.adlLevel = formData.adlLevel.trim()
      }
      if (formData.medications?.trim()) {
        updates.medications = formData.medications.trim()
      }
      if (formData.allergies?.trim()) {
        updates.allergies = formData.allergies.trim()
      }
      if (formData.contraindications?.trim()) {
        updates.contraindications = formData.contraindications.trim()
      }
      if (formData.specialNotes?.trim()) {
        updates.specialNotes = formData.specialNotes.trim()
      }
      if (formData.emergencyContactRelation?.trim()) {
        updates.emergencyContactRelation = formData.emergencyContactRelation.trim()
      }

      await updateClient(clientId, updates, currentUserId)

      setSuccess(true)

      // 2秒後に詳細ページにリダイレクト
      setTimeout(() => {
        router.push(`/clients/${clientId}`)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "利用者情報の更新に失敗しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  // 年齢表示
  const displayAge = formData.birthDate && isValidBirthDate(formData.birthDate)
    ? `（${calculateAge(formData.birthDate)}歳）`
    : ""

  if (loading) {
    return (
      <RouteGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-600">読み込み中...</div>
        </div>
      </RouteGuard>
    )
  }

  if (error && !formData.nameKanji) {
    return (
      <RouteGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded max-w-md">
            {error}
          </div>
        </div>
      </RouteGuard>
    )
  }

  if (success) {
    return (
      <RouteGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">更新完了</h2>
            <p className="text-gray-600">利用者情報を更新しました。</p>
          </div>
        </div>
      </RouteGuard>
    )
  }

  return (
    <RouteGuard>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">利用者情報編集</h1>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 基本情報セクション */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                基本情報
              </h2>
              <div className="space-y-4">
                {/* 氏名（漢字） */}
                <div>
                  <label htmlFor="nameKanji" className="block text-sm font-medium text-gray-700 mb-1">
                    氏名（漢字） <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="nameKanji"
                    name="nameKanji"
                    value={formData.nameKanji}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="山田 太郎"
                  />
                </div>

                {/* 氏名（ひらがな） */}
                <div>
                  <label htmlFor="nameKana" className="block text-sm font-medium text-gray-700 mb-1">
                    氏名（ひらがな） <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="nameKana"
                    name="nameKana"
                    value={formData.nameKana}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="やまだ たろう"
                  />
                </div>

                {/* 生年月日 */}
                <div>
                  <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                    生年月日 <span className="text-red-500">*</span> {displayAge && <span className="text-blue-600">{displayAge}</span>}
                  </label>
                  <input
                    type="date"
                    id="birthDate"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>

                {/* 性別 */}
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                    性別 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value="">選択してください</option>
                    {GENDERS.map(gender => (
                      <option key={gender} value={gender}>
                        {gender}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 身長・体重 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                      身長（cm）
                    </label>
                    <input
                      type="number"
                      id="height"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="165.0"
                    />
                  </div>
                  <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                      体重（kg）
                    </label>
                    <input
                      type="number"
                      id="weight"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="60.0"
                    />
                  </div>
                </div>

                {/* 居住形態 */}
                <div>
                  <label htmlFor="livingArrangement" className="block text-sm font-medium text-gray-700 mb-1">
                    居住形態 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="livingArrangement"
                    name="livingArrangement"
                    value={formData.livingArrangement}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value="">選択してください</option>
                    {LIVING_ARRANGEMENTS.map(arrangement => (
                      <option key={arrangement} value={arrangement}>
                        {arrangement}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* AI分析・ケア支援用データセクション */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                医療・ケア情報
              </h2>
              <div className="space-y-4">
                {/* 主疾患 */}
                <div>
                  <label htmlFor="primaryDiseases" className="block text-sm font-medium text-gray-700 mb-1">
                    主疾患
                  </label>
                  <input
                    type="text"
                    id="primaryDiseases"
                    name="primaryDiseases"
                    value={formData.primaryDiseases}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="例: 脳梗塞、高血圧"
                  />
                </div>

                {/* 既往歴 */}
                <div>
                  <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700 mb-1">
                    既往歴
                  </label>
                  <textarea
                    id="medicalHistory"
                    name="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="既往歴を入力してください"
                  />
                </div>

                {/* 介護度 */}
                <div>
                  <label htmlFor="careLevel" className="block text-sm font-medium text-gray-700 mb-1">
                    介護度
                  </label>
                  <select
                    id="careLevel"
                    name="careLevel"
                    value={formData.careLevel}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value="">選択してください</option>
                    {CARE_LEVELS.map(level => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 日常生活自立度 */}
                <div>
                  <label htmlFor="adlLevel" className="block text-sm font-medium text-gray-700 mb-1">
                    日常生活自立度
                  </label>
                  <select
                    id="adlLevel"
                    name="adlLevel"
                    value={formData.adlLevel}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value="">選択してください</option>
                    {ADL_LEVELS.map(level => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 難病・障害 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="hasDifficultDisease"
                      name="hasDifficultDisease"
                      checked={formData.hasDifficultDisease}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="hasDifficultDisease" className="ml-2 text-sm text-gray-700">
                      難病あり
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="hasDisability"
                      name="hasDisability"
                      checked={formData.hasDisability}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="hasDisability" className="ml-2 text-sm text-gray-700">
                      障害あり
                    </label>
                  </div>
                </div>

                {/* 服薬情報 */}
                <div>
                  <label htmlFor="medications" className="block text-sm font-medium text-gray-700 mb-1">
                    服薬情報
                  </label>
                  <textarea
                    id="medications"
                    name="medications"
                    value={formData.medications}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="例: 抗凝固薬内服中、インスリン使用"
                  />
                </div>
              </div>
            </section>

            {/* リスク管理・特記事項セクション */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                リスク管理・特記事項
              </h2>
              <div className="space-y-4">
                {/* アレルギー */}
                <div>
                  <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-1">
                    アレルギー
                  </label>
                  <input
                    type="text"
                    id="allergies"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="例: 卵、小麦、ペニシリン"
                  />
                </div>

                {/* 禁忌事項 */}
                <div>
                  <label htmlFor="contraindications" className="block text-sm font-medium text-gray-700 mb-1">
                    禁忌事項
                  </label>
                  <textarea
                    id="contraindications"
                    name="contraindications"
                    value={formData.contraindications}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="禁忌事項を入力してください"
                  />
                </div>

                {/* 留意事項 */}
                <div>
                  <label htmlFor="specialNotes" className="block text-sm font-medium text-gray-700 mb-1">
                    留意事項
                  </label>
                  <textarea
                    id="specialNotes"
                    name="specialNotes"
                    value={formData.specialNotes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="ケア時の留意事項を入力してください"
                  />
                </div>

                {/* 緊急連絡先 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-1">
                      緊急連絡先 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="emergencyContact"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="090-XXXX-XXXX"
                    />
                  </div>
                  <div>
                    <label htmlFor="emergencyContactRelation" className="block text-sm font-medium text-gray-700 mb-1">
                      続柄
                    </label>
                    <input
                      type="text"
                      id="emergencyContactRelation"
                      name="emergencyContactRelation"
                      value={formData.emergencyContactRelation}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="例: 長男"
                    />
                  </div>
                </div>

                {/* 転倒歴 */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hasFallHistory"
                    name="hasFallHistory"
                    checked={formData.hasFallHistory}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hasFallHistory" className="ml-2 text-sm text-gray-700">
                    転倒歴あり
                  </label>
                </div>

                {/* 嚥下状態 */}
                <div>
                  <label htmlFor="swallowingStatus" className="block text-sm font-medium text-gray-700 mb-1">
                    嚥下状態 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="swallowingStatus"
                    name="swallowingStatus"
                    value={formData.swallowingStatus}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value="">選択してください</option>
                    {SWALLOWING_STATUS.map(status => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* 送信ボタン */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "更新中..." : "更新する"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </RouteGuard>
  )
}
