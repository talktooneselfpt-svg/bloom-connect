"use client"

import { useState, useEffect, FormEvent } from "react"
import { useRouter, useParams } from "next/navigation"
import { getOrganization, updateOrganization } from "@/lib/firestore/organizations"
import { uploadOrganizationLogo, deleteOrganizationLogo } from "@/lib/storage"
import { ORGANIZATION_TYPES, PREFECTURES, Organization } from "@/types/organization"

export default function EditOrganizationPage() {
  const router = useRouter()
  const params = useParams()
  const organizationId = params.id as string

  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    nameKana: "",
    prefecture: "",
    city: "",
    addressLine: "",
    postalCode: "",
    phone: "",
    email: "",
    organizationType: "",
    administratorName: "",
    administratorEmail: "",
    logoUrl: ""
  })

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>("")

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
      setFormData({
        name: data.name || "",
        nameKana: data.nameKana || "",
        prefecture: data.prefecture || "",
        city: data.city || "",
        addressLine: data.addressLine || "",
        postalCode: data.postalCode || "",
        phone: data.phone || "",
        email: data.email || "",
        organizationType: data.organizationType || "",
        administratorName: data.administratorName || "",
        administratorEmail: data.administratorEmail || "",
        logoUrl: data.logoUrl || ""
      })
      setLogoPreview(data.logoUrl || "")
    } catch (err) {
      setError(err instanceof Error ? err.message : "事業所情報の取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // ファイルタイプの検証
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      alert("画像ファイルはJPEG、PNG、またはWebP形式のみアップロード可能です")
      return
    }

    // ファイルサイズの検証（5MB以下）
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      alert("画像ファイルは5MB以下にしてください")
      return
    }

    setLogoFile(file)

    // プレビュー用のURLを作成
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    setLogoFile(null)
    setLogoPreview("")
    setFormData(prev => ({ ...prev, logoUrl: "" }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // バリデーション
      if (!formData.name) {
        throw new Error("事業所名は必須項目です")
      }
      if (!formData.phone) {
        throw new Error("電話番号は必須項目です")
      }
      if (!formData.email) {
        throw new Error("連絡用メールアドレスは必須項目です")
      }
      if (!formData.organizationType) {
        throw new Error("事業所種別は必須項目です")
      }
      if (!formData.administratorName) {
        throw new Error("管理者名は必須項目です")
      }

      let logoUrl = formData.logoUrl

      // 新しいロゴがアップロードされた場合
      if (logoFile) {
        setIsUploading(true)
        try {
          // 古いロゴを削除（存在する場合）
          if (organization?.logoUrl) {
            await deleteOrganizationLogo(organizationId, organization.logoUrl)
          }

          // 新しいロゴをアップロード
          logoUrl = await uploadOrganizationLogo(organizationId, logoFile)
        } catch (uploadError) {
          throw new Error("ロゴのアップロードに失敗しました")
        } finally {
          setIsUploading(false)
        }
      }

      // TODO: 実際のユーザーIDに置き換え
      const currentUserId = "temp-user-id"

      // 事業所データの準備
      const updateData: any = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        organizationType: formData.organizationType,
        administratorName: formData.administratorName,
        updatedBy: currentUserId
      }

      // 任意フィールドの処理
      if (formData.nameKana?.trim()) {
        updateData.nameKana = formData.nameKana.trim()
      }
      if (formData.prefecture?.trim()) {
        updateData.prefecture = formData.prefecture.trim()
      }
      if (formData.city?.trim()) {
        updateData.city = formData.city.trim()
      }
      if (formData.addressLine?.trim()) {
        updateData.addressLine = formData.addressLine.trim()
      }
      if (formData.postalCode?.trim()) {
        updateData.postalCode = formData.postalCode.trim()
      }
      if (formData.administratorEmail?.trim()) {
        updateData.administratorEmail = formData.administratorEmail.trim()
      }
      if (logoUrl) {
        updateData.logoUrl = logoUrl
      }

      await updateOrganization(organizationId, updateData)

      setSuccess(true)

      // 2秒後に詳細ページにリダイレクト
      setTimeout(() => {
        router.push(`/organizations/${organizationId}`)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "事業所の更新に失敗しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>読み込み中...</span>
        </div>
      </div>
    )
  }

  if (error && !organization) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded max-w-md">
          {error}
        </div>
      </div>
    )
  }

  if (success) {
    return (
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
          <p className="text-gray-600">事業所情報の更新が完了しました。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">事業所情報の編集</h1>
            <p className="text-gray-600 mt-1">{organization?.name}</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ロゴアップロードセクション */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                ブランディング
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ロゴ画像
                  </label>

                  {/* プレビュー表示 */}
                  {logoPreview && (
                    <div className="mb-4 relative inline-block">
                      <img
                        src={logoPreview}
                        alt="ロゴプレビュー"
                        className="max-w-xs max-h-32 object-contain border border-gray-200 rounded-lg p-2"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* ファイル選択ボタン */}
                  <div className="flex items-center gap-4">
                    <label
                      htmlFor="logo-upload"
                      className="cursor-pointer inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors border border-blue-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      {logoPreview ? "ロゴを変更" : "ロゴをアップロード"}
                    </label>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    JPEG、PNG、WebP形式、5MB以下
                  </p>
                </div>
              </div>
            </section>

            {/* 基本情報セクション */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                基本情報
              </h2>
              <div className="space-y-4">
                {/* 事業所番号（読み取り専用） */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    事業所番号
                  </label>
                  <input
                    type="text"
                    value={organization?.organizationCode || ""}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    事業所番号は変更できません
                  </p>
                </div>

                {/* 事業所名 */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    事業所名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="例: 〇〇訪問看護ステーション"
                  />
                </div>

                {/* 事業所名（ひらがな） */}
                <div>
                  <label htmlFor="nameKana" className="block text-sm font-medium text-gray-700 mb-1">
                    事業所名（ひらがな）
                  </label>
                  <input
                    type="text"
                    id="nameKana"
                    name="nameKana"
                    value={formData.nameKana}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="例: まるまるほうもんかんご"
                  />
                </div>

                {/* 事業所種別 */}
                <div>
                  <label htmlFor="organizationType" className="block text-sm font-medium text-gray-700 mb-1">
                    事業所種別 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="organizationType"
                    name="organizationType"
                    value={formData.organizationType}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">選択してください</option>
                    {ORGANIZATION_TYPES.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* 所在地情報セクション */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                所在地情報
              </h2>
              <div className="space-y-4">
                {/* 郵便番号 */}
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                    郵便番号
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="例: 123-4567"
                  />
                </div>

                {/* 都道府県 */}
                <div>
                  <label htmlFor="prefecture" className="block text-sm font-medium text-gray-700 mb-1">
                    都道府県
                  </label>
                  <select
                    id="prefecture"
                    name="prefecture"
                    value={formData.prefecture}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">選択してください</option>
                    {PREFECTURES.map(pref => (
                      <option key={pref} value={pref}>
                        {pref}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 市区町村 */}
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    市区町村
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="例: 渋谷区"
                  />
                </div>

                {/* 詳細住所 */}
                <div>
                  <label htmlFor="addressLine" className="block text-sm font-medium text-gray-700 mb-1">
                    詳細住所
                  </label>
                  <input
                    type="text"
                    id="addressLine"
                    name="addressLine"
                    value={formData.addressLine}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="例: 渋谷1-2-3 〇〇ビル4階"
                  />
                </div>
              </div>
            </section>

            {/* 連絡先情報セクション */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                連絡先情報
              </h2>
              <div className="space-y-4">
                {/* 電話番号 */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    電話番号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="例: 03-1234-5678"
                  />
                </div>

                {/* 連絡用メールアドレス */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    連絡用メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="例: info@example.com"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    重要なお知らせやパスワードリセットの送信先
                  </p>
                </div>
              </div>
            </section>

            {/* 管理者情報セクション */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                管理者情報
              </h2>
              <div className="space-y-4">
                {/* 管理者名 */}
                <div>
                  <label htmlFor="administratorName" className="block text-sm font-medium text-gray-700 mb-1">
                    管理者名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="administratorName"
                    name="administratorName"
                    value={formData.administratorName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="例: 山田 太郎"
                  />
                </div>

                {/* 管理者メールアドレス */}
                <div>
                  <label htmlFor="administratorEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    管理者メールアドレス
                  </label>
                  <input
                    type="email"
                    id="administratorEmail"
                    name="administratorEmail"
                    value={formData.administratorEmail}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="例: admin@example.com"
                  />
                </div>
              </div>
            </section>

            {/* 送信ボタン */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>アップロード中...</span>
                  </>
                ) : isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>更新中...</span>
                  </>
                ) : (
                  "更新する"
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isSubmitting || isUploading}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
