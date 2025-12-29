"use client"

import { useState } from "react"

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date())

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">スケジュール</h1>
          <p className="text-gray-600">訪問スケジュールとシフト管理</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
            </h2>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                今日
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-black">
                前月
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-black">
                翌月
              </button>
            </div>
          </div>

          {/* カレンダーグリッド（簡易版） */}
          <div className="grid grid-cols-7 gap-2">
            {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
              <div key={day} className="text-center font-semibold text-gray-700 py-2">
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square border border-gray-200 rounded-lg p-2 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <div className="text-sm text-gray-700">{(i % 30) + 1}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 今日の予定 */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">今日の予定</h2>
          <div className="space-y-3">
            <div className="border-l-4 border-blue-600 bg-blue-50 p-4 rounded-r-lg">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">訪問: 山田太郎様</h3>
                  <p className="text-sm text-gray-600">10:00 - 11:00</p>
                </div>
                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded h-fit">訪問</span>
              </div>
            </div>
            <div className="border-l-4 border-green-600 bg-green-50 p-4 rounded-r-lg">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">訪問: 佐藤花子様</h3>
                  <p className="text-sm text-gray-600">14:00 - 15:00</p>
                </div>
                <span className="text-xs bg-green-600 text-white px-2 py-1 rounded h-fit">訪問</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
