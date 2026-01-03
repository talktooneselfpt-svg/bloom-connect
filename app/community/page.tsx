"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getPosts } from "@/lib/firestore/community"
import { Post, PostCategory, POST_CATEGORIES } from "@/types/community"
import { DocumentSnapshot } from "firebase/firestore"

export default function CommunityPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | "all">("all")
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    loadPosts()
  }, [selectedCategory])

  async function loadPosts(loadMore = false) {
    try {
      setLoading(true)
      const filter = selectedCategory !== "all" ? { category: selectedCategory } : undefined
      const result = await getPosts(filter, 20, loadMore ? lastVisible || undefined : undefined)

      if (loadMore) {
        setPosts([...posts, ...result.posts])
      } else {
        setPosts(result.posts)
      }

      setLastVisible(result.lastVisible)
      setHasMore(result.lastVisible !== null)
    } catch (error) {
      console.error("投稿の読み込みに失敗しました:", error)
    } finally {
      setLoading(false)
    }
  }

  function handlePostClick(postId: string) {
    router.push(`/community/${postId}`)
  }

  function handleNewPost() {
    router.push("/community/new")
  }

  function formatDate(timestamp: any): string {
    if (!timestamp) return ""
    const date = timestamp.toDate()
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}分前`
    if (hours < 24) return `${hours}時間前`
    if (days < 7) return `${days}日前`
    return date.toLocaleDateString("ja-JP")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              <h1 className="text-2xl font-bold text-gray-900">コミュニティ</h1>
            </div>
            <button
              onClick={handleNewPost}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新規投稿
            </button>
          </div>
        </div>
      </div>

      {/* カテゴリータブ */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-3">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === "all"
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              すべて
            </button>
            {Object.entries(POST_CATEGORIES).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key as PostCategory)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
                  selectedCategory === key
                    ? `${category.bgColor} ${category.textColor} font-medium`
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 投稿一覧 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading && posts.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-500 text-lg">投稿がまだありません</p>
            <p className="text-gray-400 text-sm mt-2">最初の投稿を作成してみましょう</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const category = POST_CATEGORIES[post.category]
              return (
                <div
                  key={post.id}
                  onClick={() => handlePostClick(post.id)}
                  className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                    post.isPinned ? "border-2 border-yellow-400" : ""
                  }`}
                >
                  <div className="p-6">
                    {/* ピン留めバッジ */}
                    {post.isPinned && (
                      <div className="flex items-center gap-1 text-yellow-600 text-sm font-medium mb-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
                        </svg>
                        ピン留め
                      </div>
                    )}

                    {/* ヘッダー */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${category.bgColor} ${category.textColor} flex items-center gap-1`}>
                            <span>{category.icon}</span>
                            {category.label}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h2>
                      </div>
                    </div>

                    {/* コンテンツプレビュー */}
                    <p className="text-gray-600 mb-4 line-clamp-2">{post.content}</p>

                    {/* 画像プレビュー */}
                    {post.images && post.images.length > 0 && (
                      <div className="mb-4 flex gap-2 overflow-x-auto">
                        {post.images.slice(0, 3).map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`投稿画像 ${index + 1}`}
                            className="h-24 w-24 object-cover rounded-lg"
                          />
                        ))}
                        {post.images.length > 3 && (
                          <div className="h-24 w-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-sm">
                            +{post.images.length - 3}
                          </div>
                        )}
                      </div>
                    )}

                    {/* フッター */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {post.authorName}
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatDate(post.createdAt)}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {post.viewsCount}
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {post.likesCount}
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {post.commentsCount}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* もっと読み込むボタン */}
        {hasMore && posts.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => loadPosts(true)}
              disabled={loading}
              className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 border border-gray-300 disabled:opacity-50"
            >
              {loading ? "読み込み中..." : "もっと読み込む"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
