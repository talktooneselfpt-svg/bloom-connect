"use client"

import { useState } from "react"

interface Message {
  id: string
  sender: string
  subject: string
  preview: string
  timestamp: string
  isRead: boolean
}

export default function MessagesPage() {
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null)

  const messages: Message[] = [
    {
      id: "1",
      sender: "山田太郎",
      subject: "明日の訪問スケジュールについて",
      preview: "明日の訪問スケジュールですが、佐藤様の時間を30分早めることは可能でしょうか？",
      timestamp: "10:30",
      isRead: false
    },
    {
      id: "2",
      sender: "佐藤花子",
      subject: "研修資料の共有",
      preview: "先日の研修資料を添付いたします。ご確認ください。",
      timestamp: "昨日",
      isRead: true
    },
    {
      id: "3",
      sender: "システム管理者",
      subject: "システムメンテナンスのお知らせ",
      preview: "2025年1月20日にシステムメンテナンスを実施します。",
      timestamp: "2日前",
      isRead: true
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">メッセージ</h1>
          <p className="text-gray-600">スタッフ間のコミュニケーション</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* メッセージリスト */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b border-gray-200">
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  新規メッセージ
                </button>
              </div>
              <div className="divide-y divide-gray-200">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => setSelectedMessage(message.id)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedMessage === message.id
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    } ${!message.isRead ? "bg-blue-50/30" : ""}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-medium ${!message.isRead ? "text-blue-900" : "text-gray-900"}`}>
                        {message.sender}
                      </h3>
                      <span className="text-xs text-gray-500">{message.timestamp}</span>
                    </div>
                    <p className={`text-sm mb-1 ${!message.isRead ? "font-medium text-gray-900" : "text-gray-700"}`}>
                      {message.subject}
                    </p>
                    <p className="text-xs text-gray-600 truncate">{message.preview}</p>
                    {!message.isRead && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* メッセージ詳細 */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {messages.find(m => m.id === selectedMessage)?.subject}
                  </h2>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>差出人: {messages.find(m => m.id === selectedMessage)?.sender}</span>
                    <span>•</span>
                    <span>{messages.find(m => m.id === selectedMessage)?.timestamp}</span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 mb-6">
                    {messages.find(m => m.id === selectedMessage)?.preview}
                  </p>
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-medium text-gray-900 mb-3">返信</h3>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      rows={4}
                      placeholder="メッセージを入力..."
                    />
                    <div className="flex gap-2 mt-3">
                      <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
                        送信
                      </button>
                      <button className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors">
                        下書き保存
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500">メッセージを選択してください</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
