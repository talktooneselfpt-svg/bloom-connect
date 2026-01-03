/**
 * コミュニティ投稿データの型定義
 */

import { Timestamp } from "firebase/firestore"

/**
 * 投稿のカテゴリ
 */
export type PostCategory =
  | 'general'       // 一般
  | 'qa'            // 質問・回答
  | 'tips'          // ノウハウ・Tips
  | 'news'          // ニュース
  | 'event'         // イベント
  | 'discussion'    // 議論・相談

/**
 * コミュニティ投稿
 */
export interface Post {
  // 基本情報
  id: string
  title: string
  content: string
  category: PostCategory

  // 作成者情報
  authorId: string
  authorName: string
  organizationId: string
  organizationName?: string

  // 画像
  images?: string[]  // Firebase Storage URL

  // エンゲージメント
  likesCount: number
  likedBy: string[]  // ユーザーIDの配列
  commentsCount: number

  // 表示制御
  isPinned: boolean  // ピン留め
  isArchived: boolean  // アーカイブ

  // メタ情報
  createdAt: Timestamp
  updatedAt: Timestamp
  viewsCount: number
}

/**
 * コメント
 */
export interface Comment {
  id: string
  postId: string
  content: string

  // 作成者情報
  authorId: string
  authorName: string

  // リアクション
  likesCount: number
  likedBy: string[]

  // メタ情報
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * 投稿作成用のデータ
 */
export interface CreatePostData {
  title: string
  content: string
  category: PostCategory
  authorId: string
  authorName: string
  organizationId: string
  organizationName?: string
  images?: string[]
}

/**
 * 投稿更新用のデータ
 */
export interface UpdatePostData {
  title?: string
  content?: string
  category?: PostCategory
  images?: string[]
}

/**
 * コメント作成用のデータ
 */
export interface CreateCommentData {
  postId: string
  content: string
  authorId: string
  authorName: string
}

/**
 * 投稿フィルター
 */
export interface PostFilter {
  category?: PostCategory
  authorId?: string
  organizationId?: string
  isPinned?: boolean
  isArchived?: boolean
}

/**
 * カテゴリ情報
 */
export const POST_CATEGORIES: Record<PostCategory, { label: string; icon: string; color: string }> = {
  general: {
    label: '一般',
    icon: '💬',
    color: 'bg-gray-100 text-gray-700',
  },
  qa: {
    label: '質問・回答',
    icon: '❓',
    color: 'bg-blue-100 text-blue-700',
  },
  tips: {
    label: 'ノウハウ',
    icon: '💡',
    color: 'bg-yellow-100 text-yellow-700',
  },
  news: {
    label: 'ニュース',
    icon: '📰',
    color: 'bg-purple-100 text-purple-700',
  },
  event: {
    label: 'イベント',
    icon: '📅',
    color: 'bg-green-100 text-green-700',
  },
  discussion: {
    label: '議論・相談',
    icon: '🗣️',
    color: 'bg-orange-100 text-orange-700',
  },
}
