"use client"

import { useState } from "react"

interface Feature {
  id: string
  name: string
  description: string
  status: "development" | "testing" | "staging" | "production"
  version: string
  enabledOrgs: number
  totalOrgs: number
  lastUpdated: string
}

export default function TestingPage() {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)

  // TODO: 実際のデータはAPIから取得
  const features: Feature[] = [
    {
      id: "feature-1",
      name: "AIケアプラン作成",
      description: "AIを活用した自動ケアプラン作成機能",
      status: "testing",
      version: "v1.2.0",
      enabledOrgs: 2,
      totalOrgs: 12,
      lastUpdated: "2025-12-25"
    },
    {
      id: "feature-2",
      name: "音声入力記録",
      description: "音声認識による記録入力機能",
      status: "development",
      version: "v0.8.0",
      enabledOrgs: 0,
      totalOrgs: 12,
      lastUpdated: "2025-12-20"
    },
    {
      id: "feature-3",
      name: "バイタルデータ連携",
      description: "ウェアラブルデバイスとのバイタルデータ連携",
      status: "staging",
      version: "v1.0.0",
      enabledOrgs: 5,
      totalOrgs: 12,
      lastUpdated: "2025-12-28"
    },
    {
      id: "feature-4",
      name: "家族連絡機能",
      description: "利用者家族との連絡・情報共有機能",
      status: "production",
      version: "v2.1.0",
      enabledOrgs: 12,
      totalOrgs: 12,
      lastUpdated: "2025-11-15"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "development": return "bg-purple-500 text-white"
      case "testing": return "bg-yellow-500 text-gray-900"
      case "staging": return "bg-blue-500 text-white"
      case "production": return "bg-green-500 text-white"
      default: return "bg-gray-500 text-white"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "development": return "開発中"
      case "testing": return "テスト中"
      case "staging": return "ステージング"
      case "production": return "本番稼働"
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">機能テスト環境</h1>
          <p className="text-gray-400">新機能のテストと段階的ロールアウト管理</p>
        </div>

        {/* ステータスサマリー */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4">
            <p className="text-sm text-purple-300 mb-1">開発中</p>
            <p className="text-2xl font-bold text-purple-400">
              {features.filter(f => f.status === "development").length}
            </p>
          </div>
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
            <p className="text-sm text-yellow-300 mb-1">テスト中</p>
            <p className="text-2xl font-bold text-yellow-400">
              {features.filter(f => f.status === "testing").length}
            </p>
          </div>
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
            <p className="text-sm text-blue-300 mb-1">ステージング</p>
            <p className="text-2xl font-bold text-blue-400">
              {features.filter(f => f.status === "staging").length}
            </p>
          </div>
          <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
            <p className="text-sm text-green-300 mb-1">本番稼働</p>
            <p className="text-2xl font-bold text-green-400">
              {features.filter(f => f.status === "production").length}
            </p>
          </div>
        </div>

        {/* 機能一覧 */}
        <div className="space-y-4 mb-8">
          {features.map((feature) => (
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
                  </div>
                  <p className="text-gray-400 mb-3">{feature.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>
                      有効: {feature.enabledOrgs}/{feature.totalOrgs} 事業所
                    </span>
                    <span>•</span>
                    <span>最終更新: {feature.lastUpdated}</span>
                  </div>
                </div>
              </div>

              {/* ロールアウト進捗バー */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-400">ロールアウト進捗</span>
                  <span className="text-white font-semibold">
                    {Math.round((feature.enabledOrgs / feature.totalOrgs) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${(feature.enabledOrgs / feature.totalOrgs) * 100}%` }}
                  />
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex gap-2">
                {feature.status === "development" && (
                  <>
                    <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors text-sm">
                      テスト開始
                    </button>
                    <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm">
                      設定を編集
                    </button>
                  </>
                )}
                {feature.status === "testing" && (
                  <>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm">
                      ステージングへ
                    </button>
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm">
                      開発に戻す
                    </button>
                    <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm">
                      テスト結果を見る
                    </button>
                  </>
                )}
                {feature.status === "staging" && (
                  <>
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm">
                      本番展開
                    </button>
                    <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm">
                      事業所を追加
                    </button>
                    <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm">
                      フィードバックを見る
                    </button>
                  </>
                )}
                {feature.status === "production" && (
                  <>
                    <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm">
                      使用状況を見る
                    </button>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm">
                      アップデート
                    </button>
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm">
                      無効化
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* テスト環境アクセス */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4">テスト環境</h2>
          <p className="text-gray-400 mb-6">
            開発中の機能を実際のデータで試すことができるサンドボックス環境です。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold mb-2">開発環境</h3>
              <p className="text-sm text-gray-400 mb-4">最新の開発ブランチをテスト</p>
              <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm">
                開発環境を開く
              </button>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold mb-2">ステージング環境</h3>
              <p className="text-sm text-gray-400 mb-4">本番リリース前の最終確認</p>
              <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm">
                ステージング環境を開く
              </button>
            </div>
          </div>
        </div>

        {/* 新機能追加 */}
        <div className="mt-6">
          <button className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-semibold">
            + 新しい機能を追加
          </button>
        </div>
      </div>
    </div>
  )
}
