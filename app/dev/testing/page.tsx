"use client"
import RouteGuard from "@/components/RouteGuard"

import { useState, useEffect } from "react"
import {
  getFeatureFlags,
  updateFeatureStatus,
  enableFeatureForOrg,
  disableFeatureForOrg,
  enableFeatureForAll,
  disableFeatureForAll,
  type FeatureFlag
} from "@/lib/featureFlags"

export default function TestingPage() {
  const [features, setFeatures] = useState<Record<string, FeatureFlag>>({})
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)
  const [newOrgId, setNewOrgId] = useState("")

  useEffect(() => {
    loadFeatures()
  }, [])

  const loadFeatures = () => {
    setFeatures(getFeatureFlags())
  }

  const handleStatusChange = (featureId: string, status: FeatureFlag['status']) => {
    updateFeatureStatus(featureId, status)
    loadFeatures()
  }

  const handleEnableForOrg = (featureId: string) => {
    if (newOrgId.trim()) {
      enableFeatureForOrg(featureId, newOrgId.trim())
      setNewOrgId("")
      loadFeatures()
    }
  }

  const handleDisableForOrg = (featureId: string, orgId: string) => {
    disableFeatureForOrg(featureId, orgId)
    loadFeatures()
  }

  const handleEnableForAll = (featureId: string) => {
    if (confirm('この機能を全事業所に公開しますか？')) {
      enableFeatureForAll(featureId)
      loadFeatures()
    }
  }

  const handleDisableForAll = (featureId: string) => {
    if (confirm('この機能を全事業所から無効化しますか？')) {
      disableFeatureForAll(featureId)
      loadFeatures()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "development": return "bg-purple-500 text-white"
      case "testing": return "bg-yellow-500 text-gray-900"
      case "staging": return "bg-blue-500 text-white"
      case "production": return "bg-green-500 text-white"
      case "disabled": return "bg-gray-500 text-white"
      default: return "bg-gray-500 text-white"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "development": return "開発中"
      case "testing": return "テスト中"
      case "staging": return "ステージング"
      case "production": return "本番稼働"
      case "disabled": return "無効"
      default: return status
    }
  }

  const featureList = Object.values(features)

  return (
    <RouteGuard>
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">機能フラグ管理</h1>
          <p className="text-gray-400">新機能のテストと段階的ロールアウト管理</p>
        </div>

        {/* ステータスサマリー */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4">
            <p className="text-sm text-purple-300 mb-1">開発中</p>
            <p className="text-2xl font-bold text-purple-400">
              {featureList.filter(f => f.status === "development").length}
            </p>
          </div>
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
            <p className="text-sm text-yellow-300 mb-1">テスト中</p>
            <p className="text-2xl font-bold text-yellow-400">
              {featureList.filter(f => f.status === "testing").length}
            </p>
          </div>
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
            <p className="text-sm text-blue-300 mb-1">ステージング</p>
            <p className="text-2xl font-bold text-blue-400">
              {featureList.filter(f => f.status === "staging").length}
            </p>
          </div>
          <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
            <p className="text-sm text-green-300 mb-1">本番稼働</p>
            <p className="text-2xl font-bold text-green-400">
              {featureList.filter(f => f.status === "production").length}
            </p>
          </div>
          <div className="bg-gray-900/30 border border-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-300 mb-1">無効</p>
            <p className="text-2xl font-bold text-gray-400">
              {featureList.filter(f => f.status === "disabled").length}
            </p>
          </div>
        </div>

        {/* 機能一覧 */}
        <div className="space-y-4 mb-8">
          {featureList.map((feature) => (
            <div
              key={feature.id}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{feature.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(feature.status)}`}>
                      {getStatusText(feature.status)}
                    </span>
                    <span className="text-sm text-gray-400 font-mono">{feature.version}</span>
                    {feature.enabledForAll && (
                      <span className="text-xs px-2 py-1 rounded bg-green-500 text-white">
                        全公開
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 mb-3">{feature.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>
                      有効事業所: {feature.enabledForAll ? '全て' : feature.enabledForOrgs.length}
                    </span>
                    <span>•</span>
                    <span>最終更新: {feature.updatedAt}</span>
                  </div>
                </div>
              </div>

              {/* ステータス変更ボタン */}
              <div className="mb-4 flex gap-2 flex-wrap">
                <button
                  onClick={() => handleStatusChange(feature.id, 'development')}
                  disabled={feature.status === 'development'}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded text-sm transition-colors"
                >
                  開発中へ
                </button>
                <button
                  onClick={() => handleStatusChange(feature.id, 'testing')}
                  disabled={feature.status === 'testing'}
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded text-sm transition-colors"
                >
                  テスト中へ
                </button>
                <button
                  onClick={() => handleStatusChange(feature.id, 'staging')}
                  disabled={feature.status === 'staging'}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded text-sm transition-colors"
                >
                  ステージングへ
                </button>
                <button
                  onClick={() => handleStatusChange(feature.id, 'production')}
                  disabled={feature.status === 'production'}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded text-sm transition-colors"
                >
                  本番稼働へ
                </button>
                <button
                  onClick={() => handleStatusChange(feature.id, 'disabled')}
                  disabled={feature.status === 'disabled'}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed rounded text-sm transition-colors"
                >
                  無効化
                </button>
              </div>

              {/* 事業所管理 */}
              {selectedFeature === feature.id ? (
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <h4 className="font-semibold mb-3">有効な事業所</h4>

                  {/* 現在有効な事業所一覧 */}
                  {feature.enabledForOrgs.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {feature.enabledForOrgs.map((orgId) => (
                        <div key={orgId} className="flex items-center gap-2 bg-gray-700 rounded px-3 py-1">
                          <span className="text-sm">{orgId}</span>
                          <button
                            onClick={() => handleDisableForOrg(feature.id, orgId)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 新しい事業所を追加 */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newOrgId}
                      onChange={(e) => setNewOrgId(e.target.value)}
                      placeholder="事業所ID (例: org-001)"
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleEnableForOrg(feature.id)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                    >
                      追加
                    </button>
                  </div>

                  {/* 全事業所への公開/無効化 */}
                  <div className="flex gap-2">
                    {!feature.enabledForAll ? (
                      <button
                        onClick={() => handleEnableForAll(feature.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors"
                      >
                        全事業所に公開
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDisableForAll(feature.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
                      >
                        全事業所から無効化
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedFeature(null)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                    >
                      閉じる
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedFeature(feature.id)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-sm"
                >
                  事業所を管理
                </button>
              )}
            </div>
          ))}
        </div>

        {/* 説明 */}
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            機能フラグの使い方
          </h3>
          <ul className="text-sm text-gray-300 space-y-1 ml-7">
            <li>• <strong>開発中</strong>: 開発者のみがアクセス可能</li>
            <li>• <strong>テスト中</strong>: 特定の事業所で動作テスト</li>
            <li>• <strong>ステージング</strong>: 複数の事業所で最終確認</li>
            <li>• <strong>本番稼働</strong>: 有効化された事業所で利用可能</li>
            <li>• <strong>全事業所に公開</strong>: すべてのエンドユーザーが利用可能</li>
          </ul>
        </div>
      </div>
    </div>
    </RouteGuard>
  )
}
