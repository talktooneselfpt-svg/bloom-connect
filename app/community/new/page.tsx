"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { createPost } from "@/lib/firestore/community"
import { uploadPostImages } from "@/lib/storage"
import { PostCategory, POST_CATEGORIES } from "@/types/community"

export default function NewPostPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState<PostCategory>("general")
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // 合計5枚まで
    const totalImages = imageFiles.length + files.length
    if (totalImages > 5) {
      setError("画像は最大5枚までアップロードできます")
      return
    }

    // ファイルサイズチェック（各5MB）
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setError("各画像のサイズは5MB以下にしてください")
        return
      }
    }

    setError("")

    // プレビュー生成
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })

    setImageFiles((prev) => [...prev, ...files])
  }

  function handleRemoveImage(index: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!user) {
      setError("ログインしてください")
      return
    }

    if (!title.trim() || !content.trim()) {
      setError("タイトルと本文を入力してください")
      return
    }

    try {
      setSubmitting(true)
      setError("")

      // 画像をアップロード
      let imageUrls: string[] = []
      if (imageFiles.length > 0) {
        imageUrls = await uploadPostImages(imageFiles)
      }

      // 投稿を作成
      const postId = await createPost({
        title: title.trim(),
        content: content.trim(),
        category,
        authorId: user.uid,
        authorName: user.displayName || "匿名ユーザー",
        organizationId: user.customClaims?.eid || "",
        images: imageUrls.length > 0 ? imageUrls : undefined,
      })

      router.push(`/community/${postId}`)
    } catch (error) {
      console.error("投稿の作成に失敗しました:", error)
      setError("投稿の作成に失敗しました。もう一度お試しください。")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">新規投稿</h1>
            <button
              onClick={() => router.push("/community")}
              className="text-gray-600 hover:text-gray-900"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>

      {/* フォーム */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          {/* エラーメッセージ */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* カテゴリー選択 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリー
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(POST_CATEGORIES).map(([key, cat]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key as PostCategory)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                    category === key
                      ? `${cat.bgColor} ${cat.textColor} border-current`
                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="font-medium">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* タイトル */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              タイトル
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="投稿のタイトルを入力"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* 本文 */}
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              本文
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="投稿の内容を入力"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={10}
              required
            />
          </div>

          {/* 画像アップロード */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              画像（最大5枚、各5MB以下）
            </label>
            <div className="flex items-center gap-4">
              <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer inline-flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                画像を選択
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={imageFiles.length >= 5}
                />
              </label>
              <span className="text-sm text-gray-500">
                {imageFiles.length}/5 枚
              </span>
            </div>

            {/* 画像プレビュー */}
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`プレビュー ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 送信ボタン */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={submitting || !title.trim() || !content.trim()}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {submitting ? "投稿中..." : "投稿する"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/community")}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
