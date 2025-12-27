'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<'feed' | 'discussions' | 'resources'>('feed')

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← ダッシュボードに戻る
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">コミュニティ</h1>
              <p className="text-gray-600 mt-2">
                ブルームコネクトユーザー同士で情報を共有し、学び合いましょう
              </p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              新規投稿
            </button>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('feed')}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'feed'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                フィード
              </button>
              <button
                onClick={() => setActiveTab('discussions')}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'discussions'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ディスカッション
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'resources'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                リソース
              </button>
            </nav>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* メインコンテンツエリア */}
          <div className="lg:col-span-2 space-y-6">
            {/* フィードタブ */}
            {activeTab === 'feed' && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    コミュニティフィード（準備中）
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    他のユーザーの投稿や活動を確認できます。近日公開予定です。
                  </p>
                </div>
              </div>
            )}

            {/* ディスカッションタブ */}
            {activeTab === 'discussions' && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    ディスカッション（準備中）
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    テーマ別のディスカッションに参加できます。質問や情報交換の場として活用ください。
                  </p>
                </div>
              </div>
            )}

            {/* リソースタブ */}
            {activeTab === 'resources' && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    リソース（準備中）
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    マニュアル、テンプレート、ベストプラクティスなどの共有リソースを確認できます。
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* サイドバー */}
          <div className="lg:col-span-1 space-y-6">
            {/* コミュニティ統計 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4">コミュニティ統計</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">総メンバー数</span>
                  <span className="font-semibold text-gray-900">-</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">今月の投稿</span>
                  <span className="font-semibold text-gray-900">-</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">アクティブユーザー</span>
                  <span className="font-semibold text-gray-900">-</span>
                </div>
              </div>
            </div>

            {/* 人気のトピック */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4">人気のトピック</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-500 text-center py-4">
                  準備中...
                </p>
              </div>
            </div>

            {/* ガイドライン */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                コミュニティガイドライン
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>✓ 互いに尊重し合いましょう</li>
                <li>✓ 建設的な議論を心がけましょう</li>
                <li>✓ 個人情報の共有は避けましょう</li>
                <li>✓ スパムや宣伝は禁止です</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
