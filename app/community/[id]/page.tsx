"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import {
  getPost,
  toggleLikePost,
  deletePost,
  togglePinPost,
  getComments,
  createComment,
  toggleLikeComment,
  deleteComment,
} from "@/lib/firestore/community"
import { Post, Comment, POST_CATEGORIES } from "@/types/community"

export default function PostDetailPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string
  const { user } = useAuth()

  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentContent, setCommentContent] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadPostAndComments()
  }, [postId])

  async function loadPostAndComments() {
    try {
      setLoading(true)
      const [postData, commentsData] = await Promise.all([
        getPost(postId),
        getComments(postId),
      ])
      setPost(postData)
      setComments(commentsData)
    } catch (error) {
      console.error("投稿の読み込みに失敗しました:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleLike() {
    if (!user || !post) return
    try {
      const result = await toggleLikePost(postId, user.uid)
      setPost({
        ...post,
        likesCount: result.liked ? post.likesCount + 1 : post.likesCount - 1,
        likedBy: result.liked
          ? [...(post.likedBy || []), user.uid]
          : (post.likedBy || []).filter((id) => id !== user.uid),
      })
    } catch (error) {
      console.error("いいねに失敗しました:", error)
    }
  }

  async function handleCommentLike(commentId: string) {
    if (!user) return
    try {
      const result = await toggleLikeComment(commentId, user.uid)
      setComments(
        comments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likesCount: result.liked ? comment.likesCount + 1 : comment.likesCount - 1,
              likedBy: result.liked
                ? [...(comment.likedBy || []), user.uid]
                : (comment.likedBy || []).filter((id) => id !== user.uid),
            }
          }
          return comment
        })
      )
    } catch (error) {
      console.error("いいねに失敗しました:", error)
    }
  }

  async function handleSubmitComment() {
    if (!user || !post || !commentContent.trim()) return

    try {
      setSubmitting(true)
      await createComment({
        postId: post.id,
        content: commentContent.trim(),
        authorId: user.uid,
        authorName: user.displayName || "匿名ユーザー",
        organizationId: post.organizationId,
      })
      setCommentContent("")
      await loadPostAndComments()
    } catch (error) {
      console.error("コメントの投稿に失敗しました:", error)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeletePost() {
    if (!post || !confirm("この投稿を削除してもよろしいですか？")) return

    try {
      await deletePost(post.id)
      router.push("/community")
    } catch (error) {
      console.error("投稿の削除に失敗しました:", error)
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!post || !confirm("このコメントを削除してもよろしいですか？")) return

    try {
      await deleteComment(commentId, post.id)
      await loadPostAndComments()
    } catch (error) {
      console.error("コメントの削除に失敗しました:", error)
    }
  }

  async function handleTogglePin() {
    if (!post) return

    try {
      await togglePinPost(post.id, !post.isPinned)
      setPost({ ...post, isPinned: !post.isPinned })
    } catch (error) {
      console.error("ピン留めに失敗しました:", error)
    }
  }

  function formatDate(timestamp: any): string {
    if (!timestamp) return ""
    const date = timestamp.toDate()
    return date.toLocaleString("ja-JP")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-500 text-lg">投稿が見つかりません</p>
        <button
          onClick={() => router.push("/community")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          コミュニティに戻る
        </button>
      </div>
    )
  }

  const category = POST_CATEGORIES[post.category]
  const isLiked = user && post.likedBy?.includes(user.uid)
  const isAuthor = user && post.authorId === user.uid

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push("/community")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            コミュニティに戻る
          </button>
        </div>
      </div>

      {/* 投稿コンテンツ */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            {/* ピン留めバッジ */}
            {post.isPinned && (
              <div className="flex items-center gap-1 text-yellow-600 text-sm font-medium mb-3">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
                </svg>
                ピン留め
              </div>
            )}

            {/* カテゴリー */}
            <div className="mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${category.bgColor} ${category.textColor} inline-flex items-center gap-1`}>
                <span>{category.icon}</span>
                {category.label}
              </span>
            </div>

            {/* タイトル */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

            {/* メタ情報 */}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">{post.authorName}</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDate(post.createdAt)}
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {post.viewsCount} 閲覧
              </div>
            </div>

            {/* 本文 */}
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>
            </div>

            {/* 画像 */}
            {post.images && post.images.length > 0 && (
              <div className="mb-6 grid grid-cols-2 gap-2">
                {post.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`投稿画像 ${index + 1}`}
                    className="w-full h-auto rounded-lg"
                  />
                ))}
              </div>
            )}

            {/* アクション */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isLiked
                      ? "bg-red-100 text-red-600 hover:bg-red-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <svg className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {post.likesCount}
                </button>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {post.commentsCount}
                </div>
              </div>

              {/* 管理アクション */}
              {(isAuthor || user?.customClaims?.role === "admin") && (
                <div className="flex items-center gap-2">
                  {user?.customClaims?.role === "admin" && (
                    <button
                      onClick={handleTogglePin}
                      className={`px-3 py-2 rounded-lg text-sm ${
                        post.isPinned
                          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {post.isPinned ? "ピン解除" : "ピン留め"}
                    </button>
                  )}
                  {isAuthor && (
                    <button
                      onClick={handleDeletePost}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm"
                    >
                      削除
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* コメントセクション */}
        <div className="mt-6 bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">コメント ({comments.length})</h2>

            {/* コメント入力 */}
            {user && (
              <div className="mb-8">
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="コメントを入力..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={handleSubmitComment}
                    disabled={!commentContent.trim() || submitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "投稿中..." : "コメントする"}
                  </button>
                </div>
              </div>
            )}

            {/* コメント一覧 */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">まだコメントがありません</p>
              ) : (
                comments.map((comment) => {
                  const isCommentLiked = user && comment.likedBy?.includes(user.uid)
                  const isCommentAuthor = user && comment.authorId === user.uid

                  return (
                    <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-gray-900">{comment.authorName}</span>
                          <span className="text-gray-500">{formatDate(comment.createdAt)}</span>
                        </div>
                        {isCommentAuthor && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            削除
                          </button>
                        )}
                      </div>
                      <p className="text-gray-700 mb-2">{comment.content}</p>
                      <button
                        onClick={() => handleCommentLike(comment.id)}
                        className={`flex items-center gap-1 text-sm ${
                          isCommentLiked ? "text-red-600" : "text-gray-500 hover:text-red-600"
                        }`}
                      >
                        <svg className={`w-4 h-4 ${isCommentLiked ? "fill-current" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {comment.likesCount}
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
