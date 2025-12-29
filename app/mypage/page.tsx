"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function MyPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-2">
          <button
            onClick={() => router.push("/")}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            ダッシュボードに戻る
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">マイページ</h1>
          <p className="text-gray-600">プランの変更・プロダクトの管理</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左カラム */}
          <div className="lg:col-span-2 space-y-6">
            {/* 現在のプラン */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-semibold text-gray-900">現在のプラン</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium">
                  プラン変更
                </button>
              </div>

              <div className="mb-6">
                <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium">
                  無料プラン
                </span>
              </div>

              <p className="text-gray-700 mb-6">代表者1名のみ無料で利用可能</p>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">利用可能な機能</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>代表者1名のスタンダードプラン機能</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>コミュニティへの参加</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>事業所情報の登録</span>
                  </div>
                </div>
              </div>
            </div>

            {/* デバイス・職員情報 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">デバイス・職員情報</h2>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm text-gray-600 mb-2">総職員数</h3>
                  <p className="text-3xl font-bold text-gray-900">1名</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-600 mb-2">契約デバイス数</h3>
                  <p className="text-3xl font-bold text-gray-900">0台</p>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                ※ 無料プランは代表者1名のみご利用いただけます。職員を追加する場合はスタンダードプラン以上にアップグレードしてください。
              </p>
            </div>
          </div>

          {/* 右カラム */}
          <div className="space-y-6">
            {/* 今月の料金 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">今月の料金</h2>

              <div className="mb-4">
                <h3 className="text-sm text-gray-600 mb-2">合計（月額）</h3>
                <p className="text-4xl font-bold text-blue-600">¥0</p>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>代表者1名は無料です</span>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">無料プランをご利用中</h4>
                <p className="text-sm text-blue-800">
                  職員を追加したい場合は、スタンダードプラン以上にアップグレードしてください。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
