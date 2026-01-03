/**
 * エラーロギングシステム
 * アプリケーション全体のエラーを収集・記録
 */

import { logEvent } from './analytics'

export interface ErrorLog {
  message: string
  stack?: string
  componentStack?: string
  timestamp: Date
  userAgent?: string
  url?: string
  userId?: string
  context?: Record<string, any>
}

/**
 * エラーをログに記録
 * @param error - エラーオブジェクト
 * @param context - 追加のコンテキスト情報
 */
export function logError(error: Error, context?: Record<string, any>) {
  const errorLog: ErrorLog = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    context,
  }

  // コンソールにエラーを出力
  console.error('Error logged:', errorLog)

  // Firebase Analyticsにエラーイベントを送信
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    logEvent('error', {
      error_message: error.message,
      error_stack: error.stack?.substring(0, 500), // スタックトレースは最初の500文字
      error_name: error.name,
      page_url: window.location.href,
      ...context,
    })
  }

  // 本番環境では外部エラートラッキングサービスに送信することも可能
  // 例: Sentry, LogRocket, Bugsnag など
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, { extra: context })
  // }
}

/**
 * 警告をログに記録
 * @param message - 警告メッセージ
 * @param context - 追加のコンテキスト情報
 */
export function logWarning(message: string, context?: Record<string, any>) {
  console.warn('Warning:', message, context)

  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    logEvent('warning', {
      warning_message: message,
      page_url: window.location.href,
      ...context,
    })
  }
}

/**
 * 情報をログに記録（開発用）
 * @param message - 情報メッセージ
 * @param data - 追加データ
 */
export function logInfo(message: string, data?: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log('Info:', message, data)
  }
}

/**
 * パフォーマンスメトリクスをログに記録
 * @param metricName - メトリクス名
 * @param value - 値
 * @param unit - 単位
 */
export function logPerformance(metricName: string, value: number, unit: string = 'ms') {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    logEvent('performance', {
      metric_name: metricName,
      value,
      unit,
    })
  }

  logInfo(`Performance: ${metricName} = ${value}${unit}`)
}

/**
 * グローバルエラーハンドラーをセットアップ
 */
export function setupGlobalErrorHandlers() {
  if (typeof window === 'undefined') return

  // キャッチされないエラーを処理
  window.addEventListener('error', (event) => {
    logError(new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  })

  // キャッチされないPromise rejectionsを処理
  window.addEventListener('unhandledrejection', (event) => {
    logError(
      event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason)),
      {
        type: 'unhandled_rejection',
      }
    )
  })

  console.log('Global error handlers initialized')
}

/**
 * React Error Boundary用のエラーハンドラー
 * @param error - エラーオブジェクト
 * @param errorInfo - Reactのエラー情報
 */
export function logReactError(error: Error, errorInfo: { componentStack?: string | null }) {
  logError(error, {
    componentStack: errorInfo.componentStack || undefined,
    framework: 'React',
  })
}
