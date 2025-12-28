'use client'



import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import type { FeatureFlag, FeatureFlagHistory } from '@/types/feature-flag'
import { FEATURE_STAGE_LABELS, FEATURE_STAGE_COLORS } from '@/types/feature-flag'
import {
  getFeatureFlagByKey,
  getFeatureFlagHistory,
  deleteFeatureFlag,
} from '@/lib/firestore/feature-flags'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function FeatureFlagDetailPage() {
  const router = useRouter()
  const params = useParams()
  const flagId = params.id as string

  const [flag, setFlag] = useState<FeatureFlag | null>(null)
  const [history, setHistory] = useState<FeatureFlagHistory[]>([])
  const [loading, setLoading] = useState(true)

  // TODO: 実際のユーザー情報を取得
  const currentUserId = 'dev-user-001'
  const currentUserName = '開発者'

  useEffect(() => {
    loadFeatureFlag()
    loadHistory()
  }, [flagId])

  const loadFeatureFlag = async () => {
    try {
      setLoading(true)
      const flagRef = doc(db, 'featureFlags', flagId)
      const flagDoc = await getDoc(flagRef)

      if (flagDoc.exists()) {
        setFlag({
          id: flagDoc.id,
          ...flagDoc.data(),
        } as FeatureFlag)
      } else {
        alert('機能フラグが見つかりません')
        router.push('/developer')
      }
    } catch (error) {
      console.error('機能フラグの取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadHistory = async () => {
    try {
      const historyData = await getFeatureFlagHistory(flagId)
      setHistory(historyData)
    } catch (error) {
      console.error('履歴の取得に失敗しました:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('この機能フラグを削除してもよろしいですか？\nこの操作は元に戻せません。')) {
      return
    }

    try {
      await deleteFeatureFlag(flagId, currentUserId, currentUserName)
      alert('機能フラグを削除しました')
      router.push('/developer')
    } catch (error) {
      console.error('削除に失敗しました:', error)
      alert('削除に失敗しました')
    }
  }

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '-'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleString('ja-JP')
  }

  const getActionLabel = (action: FeatureFlagHistory['action']) => {
    const labels = {
      created: '作成',
      stage_changed: 'ステージ変更',
      enabled_for_organization: '事業所で有効化',
      disabled_for_organization: '事業所で無効化',
      updated: '更新',
      deleted: '削除',
    }
    return labels[action] || action
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12 text-gray-500">読み込み中...</div>
        </div>
      </div>
    )
  }

  if (!flag) {
    return null
  }

  const stageColors = FEATURE_STAGE_COLORS[flag.stage]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link href="/developer" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← 開発者ダッシュボードに戻る
          </Link>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{flag.name}</h1>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${stageColors.bg} ${stageColors.text}`}>
                    {FEATURE_STAGE_LABELS[flag.stage]}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{flag.description}</p>
                <div className="text-sm text-gray-500">
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">{flag.key}</span>
                </div>
              </div>

              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
              >
                削除
              </button>
            </div>

            {/* メタデータ */}
            <div className="border-t border-gray-200 pt-4 mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">作成日時</div>
                <div className="text-gray-900">{formatTimestamp(flag.createdAt)}</div>
              </div>
              <div>
                <div className="text-gray-600">最終更新</div>
                <div className="text-gray-900">{formatTimestamp(flag.updatedAt)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 有効化設定 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">有効化設定</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">特定の事業所のみ有効化</h3>
              {flag.enabledForOrganizations && flag.enabledForOrganizations.length > 0 ? (
                <div className="space-y-2">
                  {flag.enabledForOrganizations.map((orgId, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-gray-900">{orgId}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">すべての事業所で有効</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">特定のユーザーのみ有効化</h3>
              {flag.enabledForUsers && flag.enabledForUsers.length > 0 ? (
                <div className="space-y-2">
                  {flag.enabledForUsers.map((userId, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-gray-900">{userId}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">すべてのユーザーで有効</p>
              )}
            </div>
          </div>
        </div>

        {/* 変更履歴 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">変更履歴</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {history.length === 0 ? (
              <div className="p-6 text-center text-gray-500">履歴がありません</div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-600 rounded-full" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{getActionLabel(item.action)}</span>
                        {item.action === 'stage_changed' && item.previousStage && item.newStage && (
                          <span className="text-sm text-gray-600">
                            {FEATURE_STAGE_LABELS[item.previousStage]} → {FEATURE_STAGE_LABELS[item.newStage]}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.userName} · {formatTimestamp(item.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
