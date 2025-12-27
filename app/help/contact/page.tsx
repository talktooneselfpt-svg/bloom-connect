'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type InquiryCategory = 'technical' | 'billing' | 'feature' | 'bug' | 'other'

export default function ContactPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'technical' as InquiryCategory,
    subject: '',
    message: '',
    attachFile: null as File | null,
  })

  const categories: { value: InquiryCategory; label: string }[] = [
    { value: 'technical', label: '技術的な問題' },
    { value: 'billing', label: '料金・請求について' },
    { value: 'feature', label: '機能の使い方' },
    { value: 'bug', label: 'バグ報告' },
    { value: 'other', label: 'その他' },
  ]

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('ファイルサイズは10MB以下にしてください')
        return
      }
      setFormData((prev) => ({ ...prev, attachFile: file }))
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert('お名前を入力してください')
      return
    }

    if (!formData.email.trim()) {
      alert('メールアドレスを入力してください')
      return
    }

    if (!formData.subject.trim()) {
      alert('件名を入力してください')
      return
    }

    if (!formData.message.trim()) {
      alert('お問い合わせ内容を入力してください')
      return
    }

    try {
      setSubmitting(true)

      // TODO: 実際のお問い合わせ送信処理を実装
      // Firestoreに保存 + メール送信など
      console.log('お問い合わせ内容:', formData)

      await new Promise((resolve) => setTimeout(resolve, 1000)) // 仮の待機

      alert('お問い合わせを送信しました。担当者から2営業日以内にご連絡いたします。')
      router.push('/help/faq')
    } catch (error) {
      console.error('送信に失敗しました:', error)
      alert('送信に失敗しました。時間をおいて再度お試しください。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link href="/help/faq" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← FAQに戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">お問い合わせ</h1>
          <p className="text-gray-600">お困りの点やご質問がありましたら、お気軽にお問い合わせください</p>
        </div>

        {/* 注意事項 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">お問い合わせ前に</h3>
              <p className="text-sm text-gray-700">
                よくある質問で解決できる場合がございます。まずは
                <Link href="/help/faq" className="text-blue-600 hover:text-blue-800 font-medium">
                  FAQページ
                </Link>
                をご確認ください。
              </p>
            </div>
          </div>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* お名前 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              お名前 <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="山田 太郎"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* メールアドレス */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="example@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">返信先のメールアドレスを入力してください</p>
          </div>

          {/* カテゴリー */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              お問い合わせカテゴリー <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value as InquiryCategory)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* 件名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              件名 <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              placeholder="例: ログインできない、デバイス登録方法について"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* お問い合わせ内容 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              お問い合わせ内容 <span className="text-red-600">*</span>
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              placeholder="できるだけ詳しくお書きください。エラーメッセージがある場合は、そのまま記載してください。"
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              スクリーンショットがある場合は下のファイル添付欄からアップロードしてください
            </p>
          </div>

          {/* ファイル添付 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ファイル添付（オプション）
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              画像、PDF、Wordファイル（最大10MB）
            </p>
            {formData.attachFile && (
              <div className="mt-2 text-sm text-gray-700">
                選択ファイル: {formData.attachFile.name} (
                {(formData.attachFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>

          {/* 送信ボタン */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push('/help/faq')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '送信中...' : '送信する'}
            </button>
          </div>
        </form>

        {/* 連絡先情報 */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">その他の連絡方法</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <strong>営業時間:</strong> 平日 9:00-18:00（土日祝日を除く）
            </div>
            <div>
              <strong>回答までの目安:</strong> 2営業日以内にご返信いたします
            </div>
            <div className="pt-3 border-t">
              <p className="text-xs text-gray-500">
                緊急のお問い合わせは、事業所の管理者にご連絡ください。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
