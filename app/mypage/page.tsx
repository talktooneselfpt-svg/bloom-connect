"use client"

import { useState } from "react"

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'billing' | 'plan'>('overview')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">マイページ</h1>
          <p className="mt-2 text-gray-600">事業所の情報と設定を管理</p>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                概要
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'reports'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                レポート
              </button>
              <button
                onClick={() => setActiveTab('billing')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'billing'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                決済状況
              </button>
              <button
                onClick={() => setActiveTab('plan')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'plan'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                プラン変更
              </button>
            </nav>
          </div>

          {/* タブコンテンツ */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">事業所概要</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">事業所名</p>
                    <p className="text-lg font-medium text-gray-900 mt-1">サンプル事業所</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">契約プラン</p>
                    <p className="text-lg font-medium text-gray-900 mt-1">スタンダードプラン</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">登録スタッフ数</p>
                    <p className="text-lg font-medium text-gray-900 mt-1">15名</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">利用者数</p>
                    <p className="text-lg font-medium text-gray-900 mt-1">42名</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">レポート機能</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <h3 className="font-semibold text-gray-900">月次レポート</h3>
                    </div>
                    <p className="text-sm text-gray-600">月ごとの利用状況とアクティビティをレポート</p>
                  </div>
                  <div className="border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <h3 className="font-semibold text-gray-900">スタッフレポート</h3>
                    </div>
                    <p className="text-sm text-gray-600">スタッフごとの活動状況を確認</p>
                  </div>
                  <div className="border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                      </svg>
                      <h3 className="font-semibold text-gray-900">アプリ利用状況</h3>
                    </div>
                    <p className="text-sm text-gray-600">各アプリの利用頻度と人気度を分析</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">決済状況</h2>

                {/* 現在の請求額 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <p className="text-sm text-blue-600 font-medium">今月の請求額</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">¥12,000</p>
                  <p className="text-sm text-blue-600 mt-1">次回請求日: 2025年2月1日</p>
                </div>

                {/* 請求履歴 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">請求履歴</h3>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">請求日</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">領収書</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2025/01/01</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">¥12,000</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              支払済
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                            ダウンロード
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2024/12/01</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">¥12,000</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              支払済
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                            ダウンロード
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'plan' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">プラン変更</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* ベーシックプラン */}
                  <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors">
                    <h3 className="text-lg font-semibold text-gray-900">ベーシック</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-4">¥5,000<span className="text-sm font-normal text-gray-600">/月</span></p>
                    <ul className="mt-6 space-y-3">
                      <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-gray-600">スタッフ5名まで</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-gray-600">基本アプリ利用</span>
                      </li>
                    </ul>
                    <button className="mt-6 w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                      選択
                    </button>
                  </div>

                  {/* スタンダードプラン（現在のプラン） */}
                  <div className="border-2 border-blue-500 rounded-lg p-6 relative">
                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-3 py-1 rounded-bl-lg rounded-tr-lg">
                      現在のプラン
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">スタンダード</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-4">¥12,000<span className="text-sm font-normal text-gray-600">/月</span></p>
                    <ul className="mt-6 space-y-3">
                      <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-gray-600">スタッフ20名まで</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-gray-600">全アプリ利用可能</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-gray-600">レポート機能</span>
                      </li>
                    </ul>
                    <button className="mt-6 w-full bg-blue-500 text-white py-2 px-4 rounded-lg cursor-not-allowed opacity-50">
                      利用中
                    </button>
                  </div>

                  {/* プレミアムプラン */}
                  <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors">
                    <h3 className="text-lg font-semibold text-gray-900">プレミアム</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-4">¥25,000<span className="text-sm font-normal text-gray-600">/月</span></p>
                    <ul className="mt-6 space-y-3">
                      <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-gray-600">スタッフ無制限</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-gray-600">全機能利用可能</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-gray-600">優先サポート</span>
                      </li>
                    </ul>
                    <button className="mt-6 w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                      選択
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
