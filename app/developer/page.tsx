'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { FeatureFlag, FeatureStage } from '@/types/feature-flag'
import { FEATURE_STAGE_LABELS, FEATURE_STAGE_COLORS } from '@/types/feature-flag'
import {
  getAllFeatureFlags,
  updateFeatureFlagStage,
  createFeatureFlag,
} from '@/lib/firestore/feature-flags'

export default function DeveloperDashboard() {
  const router = useRouter()
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)

  // フォーム状態
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: '',
    stage: 'development' as FeatureStage,
  })

  // TODO: 実際のユーザー情報を取得
  const currentUserId = 'dev-user-001'
  const currentUserName = '開発者'
  const currentUserRole = 'developer' // admin, staff, developer

  useEffect(() => {
    // 開発者権限チェック
    if (currentUserRole !== 'developer' && currentUserRole !== 'admin') {
      alert('このページにアクセスする権限がありません')
      router.push('/')
      return
    }

    loadFeatureFlags()
  }, [])

  const loadFeatureFlags = async () => {
    try {
      setLoading(true)
      const flags = await getAllFeatureFlags()
      setFeatureFlags(flags)
    } catch (error) {
      console.error('機能フラグの取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStageChange = async (flagId: string, newStage: FeatureStage) => {
    if (!confirm(`ステージを「${FEATURE_STAGE_LABELS[newStage]}」に変更しますか？`)) {
      return
    }

    try {
      await updateFeatureFlagStage(flagId, newStage, currentUserId, currentUserName)
      await loadFeatureFlags()
      alert('ステージを変更しました')
    } catch (error) {
      alert('ステージの変更に失敗しました')
    }
  }

  const handleCreateFeature = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.key || !formData.name || !formData.description) {
      alert('すべての項目を入力してください')
      return
    }

    setCreating(true)
    try {
      await createFeatureFlag(
        {
          key: formData.key,
          name: formData.name,
          description: formData.description,
          stage: formData.stage,
        },
        currentUserId
      )

      // フォームをリセット
      setFormData({
        key: '',
        name: '',
        description: '',
        stage: 'development',
      })

      setShowCreateModal(false)
      await loadFeatureFlags()
      alert('機能フラグを作成しました')
    } catch (error) {
      console.error('機能フラグの作成に失敗しました:', error)
      alert('機能フラグの作成に失敗しました')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← ダッシュボードに戻る
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">開発者ダッシュボード</h1>
              <p className="text-gray-600 mt-2">機能フラグ管理と段階的リリース</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              新規機能フラグを作成
            </button>
          </div>
        </div>

        {/* 説明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">段階的リリースについて</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• <strong>開発中</strong>: 開発者のみがアクセス可能</li>
                <li>• <strong>テスト中</strong>: 開発者と管理者がアクセス可能</li>
                <li>• <strong>本番</strong>: 全ユーザーがアクセス可能</li>
                <li>• <strong>無効</strong>: すべてのユーザーがアクセス不可</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 統計 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">総機能数</div>
            <div className="text-3xl font-bold text-gray-900">{featureFlags.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">開発中</div>
            <div className="text-3xl font-bold text-yellow-600">
              {featureFlags.filter((f) => f.stage === 'development').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">テスト中</div>
            <div className="text-3xl font-bold text-blue-600">
              {featureFlags.filter((f) => f.stage === 'staging').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">本番</div>
            <div className="text-3xl font-bold text-green-600">
              {featureFlags.filter((f) => f.stage === 'production').length}
            </div>
          </div>
        </div>

        {/* 機能フラグ一覧 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">機能フラグ一覧</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">読み込み中...</div>
          ) : featureFlags.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              機能フラグがありません。「新規機能フラグを作成」から追加してください。
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {featureFlags.map((flag) => {
                const stageColors = FEATURE_STAGE_COLORS[flag.stage]

                return (
                  <div key={flag.id} className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{flag.name}</h3>
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${stageColors.bg} ${stageColors.text}`}>
                            {FEATURE_STAGE_LABELS[flag.stage]}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{flag.description}</p>
                        <div className="text-sm text-gray-500">
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded">{flag.key}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <select
                          value={flag.stage}
                          onChange={(e) => handleStageChange(flag.id, e.target.value as FeatureStage)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="development">開発中</option>
                          <option value="staging">テスト中</option>
                          <option value="production">本番</option>
                          <option value="disabled">無効</option>
                        </select>

                        <Link
                          href={`/developer/features/${flag.id}`}
                          className="px-3 py-2 text-center border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
                        >
                          詳細
                        </Link>
                      </div>
                    </div>

                    {/* 有効化設定 */}
                    {(flag.enabledForOrganizations && flag.enabledForOrganizations.length > 0) ||
                    (flag.enabledForUsers && flag.enabledForUsers.length > 0) ? (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                          {flag.enabledForOrganizations && flag.enabledForOrganizations.length > 0 && (
                            <div>
                              特定の事業所のみ有効: {flag.enabledForOrganizations.length}件
                            </div>
                          )}
                          {flag.enabledForUsers && flag.enabledForUsers.length > 0 && (
                            <div>
                              特定のユーザーのみ有効: {flag.enabledForUsers.length}名
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* その他の開発者ツール */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/developer/organizations"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">事業所別統計</h3>
            <p className="text-gray-600 text-sm">
              各事業所の利用状況、デバイス数、職員数などを確認
            </p>
          </Link>

          <Link
            href="/audit-logs"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">監査ログ</h3>
            <p className="text-gray-600 text-sm">
              システム全体の操作履歴を確認
            </p>
          </Link>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">システム情報</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>バージョン: 1.0.0</div>
              <div>環境: 本番</div>
              <div>最終デプロイ: 2025-01-15</div>
            </div>
          </div>
        </div>

        {/* 新規機能フラグ作成モーダル */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">新規機能フラグを作成</h2>
              </div>

              <form onSubmit={handleCreateFeature} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    機能キー <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    placeholder="例: advanced_search"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    英数字とアンダースコアのみ使用可能
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    機能名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例: 高度な検索機能"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    説明 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="機能の詳しい説明を入力してください"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    初期ステージ
                  </label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value as FeatureStage })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="development">開発中</option>
                    <option value="staging">テスト中</option>
                    <option value="production">本番</option>
                    <option value="disabled">無効</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setFormData({
                        key: '',
                        name: '',
                        description: '',
                        stage: 'development',
                      })
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    disabled={creating}
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                    disabled={creating}
                  >
                    {creating ? '作成中...' : '作成'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
