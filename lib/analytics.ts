/**
 * Firebase Analytics ヘルパー関数
 */

import { Analytics, getAnalytics, logEvent as firebaseLogEvent, setUserId, setUserProperties } from 'firebase/analytics'
import { app } from './firebase'

let analytics: Analytics | null = null

// Analyticsの初期化（クライアントサイドのみ）
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  try {
    analytics = getAnalytics(app)
    console.log('Firebase Analytics initialized')
  } catch (error) {
    console.error('Failed to initialize Analytics:', error)
  }
}

/**
 * カスタムイベントをログに記録
 * @param eventName - イベント名
 * @param eventParams - イベントパラメータ
 */
export function logEvent(eventName: string, eventParams?: Record<string, any>) {
  if (analytics && typeof window !== 'undefined') {
    try {
      firebaseLogEvent(analytics, eventName, eventParams)
    } catch (error) {
      console.error('Failed to log event:', error)
    }
  }
}

/**
 * ページビューをログに記録
 * @param pagePath - ページパス
 * @param pageTitle - ページタイトル
 */
export function logPageView(pagePath: string, pageTitle?: string) {
  logEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle || document.title,
  })
}

/**
 * ユーザーIDを設定
 * @param userId - ユーザーID
 */
export function setAnalyticsUserId(userId: string) {
  if (analytics && typeof window !== 'undefined') {
    try {
      setUserId(analytics, userId)
    } catch (error) {
      console.error('Failed to set user ID:', error)
    }
  }
}

/**
 * ユーザープロパティを設定
 * @param properties - ユーザープロパティ
 */
export function setAnalyticsUserProperties(properties: Record<string, any>) {
  if (analytics && typeof window !== 'undefined') {
    try {
      setUserProperties(analytics, properties)
    } catch (error) {
      console.error('Failed to set user properties:', error)
    }
  }
}

/**
 * カスタムイベント: ログイン
 * @param method - ログイン方法
 */
export function logLogin(method: string) {
  logEvent('login', { method })
}

/**
 * カスタムイベント: サインアップ
 * @param method - サインアップ方法
 */
export function logSignUp(method: string) {
  logEvent('sign_up', { method })
}

/**
 * カスタムイベント: 検索
 * @param searchTerm - 検索語
 */
export function logSearch(searchTerm: string) {
  logEvent('search', { search_term: searchTerm })
}

/**
 * カスタムイベント: コンテンツ選択
 * @param contentType - コンテンツタイプ
 * @param contentId - コンテンツID
 */
export function logSelectContent(contentType: string, contentId: string) {
  logEvent('select_content', {
    content_type: contentType,
    content_id: contentId,
  })
}

/**
 * カスタムイベント: 共有
 * @param method - 共有方法
 * @param contentType - コンテンツタイプ
 * @param contentId - コンテンツID
 */
export function logShare(method: string, contentType: string, contentId: string) {
  logEvent('share', {
    method,
    content_type: contentType,
    content_id: contentId,
  })
}
