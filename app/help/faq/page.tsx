'use client'

import { useState } from 'react'
import Link from 'next/link'

interface FAQItem {
  id: string
  category: string
  question: string
  answer: string
}

const FAQ_DATA: FAQItem[] = [
  {
    id: '1',
    category: '基本操作',
    question: 'ブルームコネクトとは何ですか？',
    answer: 'ブルームコネクトは、介護事業所向けの総合管理システムです。スタッフ管理、利用者管理、デバイス管理、通知機能など、事業所運営に必要な機能を一元管理できます。',
  },
  {
    id: '2',
    category: '基本操作',
    question: 'ログイン方法を教えてください',
    answer: 'ログインページでメールアドレスとパスワードを入力してください。パスワードを忘れた場合は「パスワードをお忘れの方」からリセットできます。',
  },
  {
    id: '3',
    category: 'スタッフ管理',
    question: '新しいスタッフを登録するには？',
    answer: 'スタッフ管理ページから「新規登録」ボタンをクリックし、必要な情報（氏名、メールアドレス、職種、役割など）を入力してください。登録後、スタッフには自動でログイン情報が送信されます。',
  },
  {
    id: '4',
    category: 'スタッフ管理',
    question: 'スタッフ情報をエクスポートできますか？',
    answer: 'はい、可能です。スタッフ一覧ページの「CSV エクスポート」「HTML エクスポート」または「印刷」ボタンから出力できます。フィルターや検索条件を適用した状態でエクスポートすることも可能です。',
  },
  {
    id: '5',
    category: '利用者管理',
    question: '利用者情報を一括で登録できますか？',
    answer: 'はい、CSV インポート機能を使用して一括登録が可能です。利用者管理ページから「CSV インポート」を選択し、テンプレートをダウンロードしてデータを入力後、アップロードしてください。',
  },
  {
    id: '6',
    category: 'デバイス管理',
    question: '1つのデバイスに何名まで職員を割り当てられますか？',
    answer: '1つのデバイスには最大3名まで職員を割り当てることができます。料金は1デバイスあたり月額1,000円（税別）です。',
  },
  {
    id: '7',
    category: '料金・プラン',
    question: 'プランの変更方法を教えてください',
    answer: 'マイページから「プラン変更」ボタンをクリックし、希望するプランを選択してください。プラン変更は即時反映されます。',
  },
  {
    id: '8',
    category: '料金・プラン',
    question: '無料プランでできることは何ですか？',
    answer: '無料プランでは代表者1名のみがご利用いただけます。基本的なスタッフ管理・利用者管理機能が使用できますが、デバイス登録や複数職員の追加はできません。',
  },
  {
    id: '9',
    category: '通知機能',
    question: '通知の設定を変更するには？',
    answer: '通知ページから「設定」ボタンをクリックし、受け取りたい通知のカテゴリーをオン/オフできます。事業所からの通知と運営からの通知を個別に設定可能です。',
  },
  {
    id: '10',
    category: '通知機能',
    question: '通知を特定の職員だけに送信できますか？',
    answer: 'はい、可能です。通知作成ページで「個別に選択」を選び、送信したい職員を選択してください。また、役割（管理者、一般職員など）で絞り込むこともできます。',
  },
  {
    id: '11',
    category: 'セキュリティ',
    question: 'パスワードを変更するには？',
    answer: 'プロフィールページから「セキュリティ設定」に進み、現在のパスワードと新しいパスワードを入力してください。パスワードは8文字以上で、大文字・小文字・数字を含む必要があります。',
  },
  {
    id: '12',
    category: 'セキュリティ',
    question: 'データは安全に保管されていますか？',
    answer: 'はい、すべてのデータはGoogle Firebase上で暗号化されて保管されています。また、監査ログ機能により、すべての操作履歴が記録されます。',
  },
  {
    id: '13',
    category: 'トラブルシューティング',
    question: 'ログインできません',
    answer: 'メールアドレスとパスワードが正しいか確認してください。パスワードを忘れた場合は「パスワードをお忘れの方」からリセットしてください。それでも解決しない場合はお問い合わせください。',
  },
  {
    id: '14',
    category: 'トラブルシューティング',
    question: 'データがエクスポートできません',
    answer: 'ブラウザのポップアップブロック機能が有効になっている可能性があります。ブラウザの設定でポップアップを許可してください。',
  },
  {
    id: '15',
    category: 'その他',
    question: '複数の事業所を管理できますか？',
    answer: 'はい、可能です。事業所管理ページから複数の事業所を登録・管理できます。各事業所ごとに職員や利用者を管理できます。',
  },
]

const CATEGORIES = ['すべて', '基本操作', 'スタッフ管理', '利用者管理', 'デバイス管理', '料金・プラン', '通知機能', 'セキュリティ', 'トラブルシューティング', 'その他']

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('すべて')
  const [expandedIds, setExpandedIds] = useState<string[]>([])

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((expandedId) => expandedId !== id) : [...prev, id]
    )
  }

  const filteredFAQs = FAQ_DATA.filter((faq) => {
    const matchesCategory = selectedCategory === 'すべて' || faq.category === selectedCategory
    const matchesSearch =
      searchTerm === '' ||
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← ダッシュボードに戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">よくある質問（FAQ）</h1>
          <p className="text-gray-600">ブルームコネクトの使い方についてよくある質問をまとめました</p>
        </div>

        {/* クイックリンク */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">お探しの情報が見つかりませんか？</h3>
              <Link href="/help/contact" className="text-blue-600 hover:text-blue-800 font-medium">
                お問い合わせフォームはこちら →
              </Link>
            </div>
          </div>
        </div>

        {/* 検索とフィルター */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="space-y-4">
            {/* 検索 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">キーワード検索</label>
              <input
                type="text"
                placeholder="質問や回答を検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* カテゴリー */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリー</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ一覧 */}
        <div className="space-y-3">
          {filteredFAQs.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              該当する質問が見つかりませんでした
            </div>
          ) : (
            filteredFAQs.map((faq) => {
              const isExpanded = expandedIds.includes(faq.id)

              return (
                <div key={faq.id} className="bg-white rounded-lg shadow">
                  <button
                    onClick={() => toggleExpand(faq.id)}
                    className="w-full p-4 text-left flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {faq.category}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0">
                      <div className="border-t pt-3">
                        <p className="text-gray-700">{faq.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* 結果表示 */}
        {filteredFAQs.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            {filteredFAQs.length}件の質問を表示中
          </div>
        )}
      </div>
    </div>
  )
}
