"use client"

import { useState } from "react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "notifications" | "privacy" | "security">("general")

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">設定</h1>
          <p className="text-gray-600">システムの設定とカスタマイズ</p>
        </div>

        {/* タブ */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("general")}
                className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === "general"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                一般
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === "notifications"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                通知
              </button>
              <button
                onClick={() => setActiveTab("privacy")}
                className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === "privacy"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                プライバシー
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === "security"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                セキュリティ
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* 一般設定 */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    表示言語
                  </label>
                  <select className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option>日本語</option>
                    <option>English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    タイムゾーン
                  </label>
                  <select className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option>Asia/Tokyo (JST)</option>
                    <option>UTC</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm text-gray-700">ダークモードを有効にする</span>
                  </label>
                </div>
              </div>
            )}

            {/* 通知設定 */}
            {activeTab === "notifications" && (
              <div className="space-y-4">
                <div>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm text-gray-700">メール通知を受け取る</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm text-gray-700">プッシュ通知を受け取る</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-700">週次レポートを受け取る</span>
                  </label>
                </div>
              </div>
            )}

            {/* プライバシー設定 */}
            {activeTab === "privacy" && (
              <div className="space-y-4">
                <div>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm text-gray-700">活動状況をオンラインで表示する</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-700">分析データの収集を許可する</span>
                  </label>
                </div>
              </div>
            )}

            {/* セキュリティ設定 */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">パスワード変更</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        現在のパスワード
                      </label>
                      <input
                        type="password"
                        className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        新しいパスワード
                      </label>
                      <input
                        type="password"
                        className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        新しいパスワード（確認）
                      </label>
                      <input
                        type="password"
                        className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      />
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                      パスワードを更新
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">二段階認証</h3>
                  <p className="text-sm text-gray-600 mb-3">アカウントのセキュリティを強化します</p>
                  <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors">
                    二段階認証を有効にする
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-6">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
              変更を保存
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
