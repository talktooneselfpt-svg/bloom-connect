'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { getAppById, getSubscriptionByAppId, purchaseApp, cancelSubscription } from '@/lib/firestore/apps'
import type { App, AppSubscription } from '@/types/app'
import { APP_CATEGORY_LABELS, SUBSCRIPTION_STATUS_LABELS, SUBSCRIPTION_STATUS_COLORS } from '@/types/app'

export default function AppDetailPage() {
  const router = useRouter()
  const params = useParams()
  const appId = params.id as string

  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [app, setApp] = useState<App | null>(null)
  const [subscription, setSubscription] = useState<AppSubscription | null>(null)

  // TODO: 実際のログイン組織ID・ユーザーIDを取得
  const organizationId = 'test-org-001'
  const currentUserId = 'test-user-001'

  useEffect(() => {
    loadData()
  }, [appId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [appData, subscriptionData] = await Promise.all([
        getAppById(appId),
        getSubscriptionByAppId(organizationId, appId),
      ])
      setApp(appData)
      setSubscription(subscriptionData)
    } catch (error) {
      console.error('データの取得に失敗しました:', error)
      alert('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (isTrial: boolean) => {
    if (!app) return

    const confirmMessage = isTrial
      ? `「${app.name}」の14日間無料トライアルを開始しますか？`
      : `「${app.name}」を購入しますか？（月額${app.monthlyPrice.toLocaleString()}円）`

    if (!confirm(confirmMessage)) return

    try {
      setPurchasing(true)
      await purchaseApp(organizationId, appId, currentUserId, isTrial)
      alert(isTrial ? 'トライアルを開始しました' : '購入が完了しました')
      await loadData()
    } catch (error) {
      console.error('購入に失敗しました:', error)
      alert('購入に失敗しました')
    } finally {
      setPurchasing(false)
    }
  }

  const handleCancel = async () => {
    if (!subscription) return

    if (!confirm('サブスクリプションをキャンセルしますか？')) return

    try {
      await cancelSubscription(subscription.id)
      alert('サブスクリプションをキャンセルしました')
      await loadData()
    } catch (error) {
      console.error('キャンセルに失敗しました:', error)
      alert('キャンセルに失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 mb-4">アプリが見つかりませんでした</p>
            <Link href="/apps" className="text-blue-600 hover:text-blue-800">
              アプリ一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isPurchased = !!subscription

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-6">
          <Link href="/apps" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← アプリ一覧に戻る
          </Link>
        </div>

        {/* アプリ詳細カード */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{app.name}</h1>
                  {isPurchased && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        SUBSCRIPTION_STATUS_COLORS[subscription!.status].bg
                      } ${SUBSCRIPTION_STATUS_COLORS[subscription!.status].text}`}
                    >
                      {SUBSCRIPTION_STATUS_LABELS[subscription!.status]}
                    </span>
                  )}
                </div>
                <p className="text-blue-100">{APP_CATEGORY_LABELS[app.category]}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">¥{app.monthlyPrice.toLocaleString()}</div>
                <div className="text-sm text-blue-100">月額</div>
              </div>
            </div>
          </div>

          {/* 本文 */}
          <div className="p-8">
            {/* 説明 */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">アプリについて</h2>
              <p className="text-gray-600">{app.description}</p>
            </div>

            {/* 機能一覧 */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">主な機能</h2>
              <ul className="space-y-2">
                {app.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-green-500 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* サブスクリプション情報（購入済みの場合） */}
            {isPurchased && subscription && (
              <div className="mb-8 bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">サブスクリプション情報</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">開始日:</span>{' '}
                    <span className="text-gray-900 font-medium">
                      {subscription.startedAt.toDate().toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  {subscription.expiresAt && (
                    <div>
                      <span className="text-gray-600">有効期限:</span>{' '}
                      <span className="text-gray-900 font-medium">
                        {subscription.expiresAt.toDate().toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">月額料金:</span>{' '}
                    <span className="text-gray-900 font-medium">¥{subscription.monthlyPrice.toLocaleString()}</span>
                  </div>
                  {subscription.nextPaymentAt && (
                    <div>
                      <span className="text-gray-600">次回支払日:</span>{' '}
                      <span className="text-gray-900 font-medium">
                        {subscription.nextPaymentAt.toDate().toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* アクション */}
            <div className="flex gap-4">
              {isPurchased ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    サブスクリプションをキャンセル
                  </button>
                  <button
                    onClick={() => router.push('/apps')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    一覧に戻る
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handlePurchase(true)}
                    disabled={purchasing}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {purchasing ? '処理中...' : '14日間無料トライアルを開始'}
                  </button>
                  <button
                    onClick={() => handlePurchase(false)}
                    disabled={purchasing}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {purchasing ? '処理中...' : '今すぐ購入'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
