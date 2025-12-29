"use client"

import { useState } from "react"

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month")

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">レポート・分析</h1>
          <p className="text-gray-600">業務統計とデータ分析</p>
        </div>

        {/* 期間選択 */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPeriod("week")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedPeriod === "week"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              週間
            </button>
            <button
              onClick={() => setSelectedPeriod("month")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedPeriod === "month"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              月間
            </button>
            <button
              onClick={() => setSelectedPeriod("year")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedPeriod === "year"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              年間
            </button>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm text-gray-600 mb-2">総訪問回数</h3>
            <p className="text-3xl font-bold text-blue-600">142</p>
            <p className="text-xs text-green-600 mt-1">↑ 前月比 +12%</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm text-gray-600 mb-2">稼働スタッフ数</h3>
            <p className="text-3xl font-bold text-green-600">24</p>
            <p className="text-xs text-gray-600 mt-1">変動なし</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm text-gray-600 mb-2">利用者数</h3>
            <p className="text-3xl font-bold text-purple-600">58</p>
            <p className="text-xs text-green-600 mt-1">↑ 前月比 +3%</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm text-gray-600 mb-2">満足度</h3>
            <p className="text-3xl font-bold text-orange-600">4.8</p>
            <p className="text-xs text-green-600 mt-1">↑ 前月比 +0.2</p>
          </div>
        </div>

        {/* グラフエリア */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">訪問回数の推移</h2>
            <div className="h-64 flex items-end justify-around gap-2">
              {[65, 80, 75, 90, 85, 95, 88].map((height, i) => (
                <div key={i} className="flex-1 bg-blue-600 rounded-t" style={{ height: `${height}%` }}></div>
              ))}
            </div>
            <div className="flex justify-around mt-2 text-xs text-gray-600">
              {["月", "火", "水", "木", "金", "土", "日"].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">スタッフ稼働率</h2>
            <div className="space-y-4">
              {[
                { name: "山田太郎", rate: 95 },
                { name: "佐藤花子", rate: 88 },
                { name: "鈴木一郎", rate: 92 },
                { name: "田中美咲", rate: 85 }
              ].map((staff) => (
                <div key={staff.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{staff.name}</span>
                    <span className="text-gray-900 font-medium">{staff.rate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${staff.rate}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* レポート出力 */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">レポート出力</h2>
          <div className="flex gap-3">
            <button className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV出力
            </button>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              PDF出力
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
