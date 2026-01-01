"use client"

import { useState } from "react"

interface ReleaseInfo {
  version: string
  date: string
  environment: 'development' | 'staging' | 'production'
  status: 'success' | 'failed' | 'pending'
  notes: string
  deployedBy?: string
}

export default function ReleasesPage() {
  // 模擬的なリリース履歴（実際は Firestore から取得）
  const [releases] = useState<ReleaseInfo[]>([
    {
      version: 'v1.0.0',
      date: '2026-01-01',
      environment: 'development',
      status: 'success',
      notes: '初期開発版 - 運営管理システム実装',
      deployedBy: 'System Admin'
    }
  ])

  const [selectedEnv, setSelectedEnv] = useState<'all' | 'development' | 'staging' | 'production'>('all')

  const filteredReleases = selectedEnv === 'all'
    ? releases
    : releases.filter(r => r.environment === selectedEnv)

  return (
    <div className="p-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">アプリリリース管理</h2>
        <p className="text-gray-600">デプロイ履歴とバージョン管理</p>
      </div>

      {/* 環境ステータス */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-700">開発環境</h3>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <p className="text-sm text-gray-600 mb-1">デプロイ先: bloom-connect-dev.web.app</p>
          <p className="text-sm text-gray-600">バージョン: v1.0.0</p>
          <p className="text-xs text-gray-500 mt-2">最終デプロイ: 2026/01/01</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-700">ステージング環境</h3>
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          </div>
          <p className="text-sm text-gray-600 mb-1">未設定</p>
          <p className="text-sm text-gray-600">バージョン: -</p>
          <p className="text-xs text-gray-500 mt-2">最終デプロイ: -</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-700">本番環境</h3>
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          </div>
          <p className="text-sm text-gray-600 mb-1">デプロイ先: bloom-connect-258b0.web.app</p>
          <p className="text-sm text-gray-600">バージョン: -</p>
          <p className="text-xs text-gray-500 mt-2">最終デプロイ: 未実施</p>
        </div>
      </div>

      {/* デプロイアクション */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 mb-8 text-white">
        <h3 className="text-xl font-semibold mb-4">デプロイ管理</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-4 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span className="font-semibold">開発環境へデプロイ</span>
            </div>
            <p className="text-sm opacity-80">GitHub Actions で自動デプロイ</p>
          </button>

          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-4 transition-all opacity-50 cursor-not-allowed">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">ステージングへ昇格</span>
            </div>
            <p className="text-sm opacity-80">テスト完了後に実行</p>
          </button>

          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-4 transition-all opacity-50 cursor-not-allowed">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-semibold">本番環境へリリース</span>
            </div>
            <p className="text-sm opacity-80">承認後に実行可能</p>
          </button>
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">環境フィルター:</label>
          <select
            value={selectedEnv}
            onChange={(e) => setSelectedEnv(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">すべて</option>
            <option value="development">開発環境</option>
            <option value="staging">ステージング環境</option>
            <option value="production">本番環境</option>
          </select>
        </div>
      </div>

      {/* リリース履歴 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">デプロイ履歴</h3>

        {filteredReleases.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600">デプロイ履歴がありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReleases.map((release, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      release.status === 'success' ? 'bg-green-100' :
                      release.status === 'failed' ? 'bg-red-100' :
                      'bg-yellow-100'
                    }`}>
                      {release.status === 'success' ? (
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : release.status === 'failed' ? (
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{release.version}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          release.environment === 'development' ? 'bg-blue-100 text-blue-800' :
                          release.environment === 'staging' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {release.environment === 'development' ? '開発' :
                           release.environment === 'staging' ? 'ステージング' :
                           '本番'}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          release.status === 'success' ? 'bg-green-100 text-green-800' :
                          release.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {release.status === 'success' ? '成功' :
                           release.status === 'failed' ? '失敗' :
                           '処理中'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{release.notes}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>{release.date}</p>
                    {release.deployedBy && <p className="text-xs text-gray-500">by {release.deployedBy}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* リリースノート作成 */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">新規リリースノート作成</h3>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">バージョン</label>
              <input
                type="text"
                placeholder="例: v1.1.0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">デプロイ先</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="development">開発環境</option>
                <option value="staging">ステージング環境</option>
                <option value="production">本番環境</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">リリースノート</label>
            <textarea
              rows={4}
              placeholder="このリリースの変更内容を記入してください..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            ></textarea>
          </div>
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              リリースノートを保存
            </button>
          </div>
        </form>
      </div>

      {/* GitHub Actions 情報 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">GitHub Actions でのデプロイについて</h4>
            <p className="text-sm text-blue-800 mb-2">
              現在、開発環境へのデプロイは GitHub Actions により自動化されています。
            </p>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>コミット・プッシュ時に自動的にビルド・デプロイが実行されます</li>
              <li>デプロイ先: <code className="bg-blue-100 px-2 py-1 rounded">bloom-connect-dev.web.app</code></li>
              <li>Firebase Hosting にデプロイされます</li>
              <li>デプロイ状況は GitHub リポジトリの Actions タブで確認できます</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
