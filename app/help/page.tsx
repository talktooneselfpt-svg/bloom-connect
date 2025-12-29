"use client"

import { useState } from "react"

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState<string>("getting-started")

  const categories = [
    { id: "getting-started", name: "はじめに", icon: "🚀" },
    { id: "staff", name: "スタッフ管理", icon: "👥" },
    { id: "clients", name: "利用者管理", icon: "🧑‍⚕️" },
    { id: "schedule", name: "スケジュール", icon: "📅" },
    { id: "reports", name: "レポート", icon: "📊" },
    { id: "troubleshooting", name: "トラブルシューティング", icon: "🔧" }
  ]

  const faqs: Record<string, Array<{question: string, answer: string}>> = {
    "getting-started": [
      {
        question: "初回ログインの方法を教えてください",
        answer: "管理者から送られたメールに記載されているログインURLとパスワードを使用してログインしてください。"
      },
      {
        question: "パスワードを忘れた場合はどうすればよいですか？",
        answer: "ログイン画面の「パスワードを忘れた方」リンクから、パスワードリセットの手続きを行ってください。"
      }
    ],
    "staff": [
      {
        question: "新しいスタッフを登録するにはどうすればよいですか？",
        answer: "「スタッフ管理」→「新規登録」から、必要な情報を入力してスタッフを登録できます。"
      }
    ],
    "clients": [
      {
        question: "利用者の情報を編集するには？",
        answer: "利用者一覧から対象の利用者を選択し、「編集」ボタンをクリックしてください。"
      }
    ]
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ヘルプ・サポート</h1>
          <p className="text-gray-600">よくある質問とサポート情報</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* カテゴリ一覧 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="font-semibold text-gray-900 mb-3">カテゴリ</h2>
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      activeCategory === category.id
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* サポート連絡先 */}
            <div className="bg-white rounded-lg shadow-md p-4 mt-4">
              <h2 className="font-semibold text-gray-900 mb-3">サポート連絡先</h2>
              <div className="space-y-2 text-sm text-gray-700">
                <p>📧 support@bloom-connect.jp</p>
                <p>📞 0120-XXX-XXX</p>
                <p className="text-xs text-gray-500">平日 9:00-18:00</p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {categories.find(c => c.id === activeCategory)?.name}
              </h2>
              <div className="space-y-4">
                {(faqs[activeCategory] || []).map((faq, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                    <h3 className="font-medium text-gray-900 mb-2">Q. {faq.question}</h3>
                    <p className="text-gray-700 pl-4">A. {faq.answer}</p>
                  </div>
                ))}
                {(!faqs[activeCategory] || faqs[activeCategory].length === 0) && (
                  <p className="text-gray-500 text-center py-8">このカテゴリのFAQは準備中です</p>
                )}
              </div>
            </div>

            {/* チュートリアル動画 */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">チュートリアル動画</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="bg-gray-200 rounded-lg h-32 flex items-center justify-center mb-3">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">基本的な使い方</h3>
                  <p className="text-sm text-gray-600">5:30</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="bg-gray-200 rounded-lg h-32 flex items-center justify-center mb-3">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">スタッフ登録方法</h3>
                  <p className="text-sm text-gray-600">3:15</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
