'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PLANS, PlanType } from '@/types/plan'
import { PaymentStatus, Invoice } from '@/types/subscription'

export default function PaymentPage() {
  // サンプルデータ（実際はFirestoreから取得）
  const [currentPlan, setCurrentPlan] = useState<PlanType>('standard')
  const [monthlyFee, setMonthlyFee] = useState(5000)
  const [nextPaymentDate, setNextPaymentDate] = useState<Date>(new Date(2025, 0, 1))
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'bank_transfer' | 'invoice'>('credit_card')

  // 請求履歴（サンプル）
  const [invoices, setInvoices] = useState<Partial<Invoice>[]>([
    {
      id: 'INV-2024-12',
      billingPeriodStart: { toDate: () => new Date(2024, 11, 1) } as any,
      billingPeriodEnd: { toDate: () => new Date(2024, 11, 31) } as any,
      breakdown: {
        deviceFee: 2000,
        productFees: 6000,
        aiFees: 2000,
        subtotal: 10000,
        discount: 0,
        tax: 1000,
        total: 11000,
      },
      paymentStatus: 'paid' as PaymentStatus,
      paidAt: { toDate: () => new Date(2024, 11, 5) } as any,
    },
    {
      id: 'INV-2024-11',
      billingPeriodStart: { toDate: () => new Date(2024, 10, 1) } as any,
      billingPeriodEnd: { toDate: () => new Date(2024, 10, 30) } as any,
      breakdown: {
        deviceFee: 2000,
        productFees: 5000,
        aiFees: 0,
        subtotal: 7000,
        discount: 0,
        tax: 700,
        total: 7700,
      },
      paymentStatus: 'paid' as PaymentStatus,
      paidAt: { toDate: () => new Date(2024, 10, 5) } as any,
    },
  ])

  useEffect(() => {
    // TODO: Firestoreから請求情報を取得
  }, [])

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'credit_card':
        return 'クレジットカード'
      case 'bank_transfer':
        return '銀行振込'
      case 'invoice':
        return '請求書払い'
      default:
        return '未設定'
    }
  }

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">支払済</span>
      case 'pending':
        return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">支払待</span>
      case 'failed':
        return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">失敗</span>
      case 'refunded':
        return <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">返金済</span>
      default:
        return <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">{status}</span>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link href="/my-page" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← マイページに戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">決済情報</h1>
          <p className="text-gray-600 mt-2">請求履歴と支払い方法の管理</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側: メイン情報 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 現在の契約情報サマリー */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">契約情報</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">現在のプラン</div>
                  <div className="text-lg font-bold text-blue-600">
                    {PLANS[currentPlan].displayName}
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">月額料金</div>
                  <div className="text-lg font-bold text-gray-900">
                    ¥{monthlyFee.toLocaleString()}
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">次回支払日</div>
                  <div className="text-lg font-bold text-gray-900">
                    {nextPaymentDate.toLocaleDateString('ja-JP')}
                  </div>
                </div>
              </div>
            </div>

            {/* 支払い方法 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">支払い方法</h2>
                  <p className="text-sm text-gray-600 mt-1">現在の支払い方法を管理します</p>
                </div>
                <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  変更
                </button>
              </div>

              {paymentMethod === 'credit_card' && (
                <div className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">クレジットカード</div>
                      <div className="text-sm text-gray-600">**** **** **** 4242</div>
                      <div className="text-xs text-gray-500">有効期限: 12/25</div>
                    </div>
                  </div>
                  <div className="text-green-600 font-semibold text-sm">有効</div>
                </div>
              )}

              {paymentMethod === 'bank_transfer' && (
                <div className="border rounded-lg p-4">
                  <div className="font-semibold text-gray-900 mb-2">銀行振込</div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>銀行名: ○○銀行</p>
                    <p>支店名: △△支店</p>
                    <p>口座番号: 1234567</p>
                    <p className="text-xs text-gray-500 mt-2">
                      ※ 毎月末日までに翌月分をお振込みください
                    </p>
                  </div>
                </div>
              )}

              {paymentMethod === 'invoice' && (
                <div className="border rounded-lg p-4">
                  <div className="font-semibold text-gray-900 mb-2">請求書払い</div>
                  <div className="text-sm text-gray-600">
                    毎月初旬に請求書を郵送いたします。請求書記載の期日までにお支払いください。
                  </div>
                </div>
              )}
            </div>

            {/* 請求履歴 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">請求履歴</h2>

              {invoices.length === 0 ? (
                <p className="text-gray-500 text-center py-8">請求履歴がありません</p>
              ) : (
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-semibold text-gray-900">{invoice.id}</div>
                          <div className="text-sm text-gray-600">
                            {invoice.billingPeriodStart?.toDate().toLocaleDateString('ja-JP')} 〜{' '}
                            {invoice.billingPeriodEnd?.toDate().toLocaleDateString('ja-JP')}
                          </div>
                        </div>
                        <div className="text-right">
                          {invoice.paymentStatus && getPaymentStatusBadge(invoice.paymentStatus)}
                        </div>
                      </div>

                      {/* 料金明細 */}
                      <div className="bg-gray-50 rounded p-3 mb-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {invoice.breakdown && (
                            <>
                              {invoice.breakdown.deviceFee > 0 && (
                                <>
                                  <span className="text-gray-600">デバイス使用料</span>
                                  <span className="text-right text-gray-900">
                                    ¥{invoice.breakdown.deviceFee.toLocaleString()}
                                  </span>
                                </>
                              )}
                              {invoice.breakdown.productFees > 0 && (
                                <>
                                  <span className="text-gray-600">プロダクト料金</span>
                                  <span className="text-right text-gray-900">
                                    ¥{invoice.breakdown.productFees.toLocaleString()}
                                  </span>
                                </>
                              )}
                              {invoice.breakdown.aiFees > 0 && (
                                <>
                                  <span className="text-gray-600">AI使用料</span>
                                  <span className="text-right text-purple-600">
                                    ¥{invoice.breakdown.aiFees.toLocaleString()}
                                  </span>
                                </>
                              )}
                              <div className="col-span-2 border-t my-1"></div>
                              <span className="text-gray-600">小計</span>
                              <span className="text-right text-gray-900">
                                ¥{invoice.breakdown.subtotal.toLocaleString()}
                              </span>
                              <span className="text-gray-600">消費税 (10%)</span>
                              <span className="text-right text-gray-900">
                                ¥{invoice.breakdown.tax.toLocaleString()}
                              </span>
                              <div className="col-span-2 border-t my-1"></div>
                              <span className="font-semibold text-gray-900">合計</span>
                              <span className="text-right font-bold text-blue-600">
                                ¥{invoice.breakdown.total.toLocaleString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* アクション */}
                      <div className="flex gap-2">
                        <button className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                          請求書をダウンロード
                        </button>
                        {invoice.paymentStatus === 'paid' && (
                          <button className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                            領収書をダウンロード
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右側: サポート情報 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8 space-y-6">
              {/* お支払いガイド */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  お支払いガイド
                </h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>✓ 毎月1日に自動で請求されます</p>
                  <p>✓ クレジットカードは即時決済</p>
                  <p>✓ 銀行振込は前払い制です</p>
                  <p>✓ 請求書払いは末締め翌月払い</p>
                </div>
              </div>

              {/* プラン変更の注意 */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  プラン変更について
                </h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>プラン変更は「マイページ」から行えます。</p>
                  <p className="text-xs text-gray-500">
                    アップグレード: 即時反映、日割り計算<br />
                    ダウングレード: 翌月1日から適用
                  </p>
                </div>
              </div>

              {/* サポート */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">お問い合わせ</h3>
                <p className="text-sm text-gray-600 mb-3">
                  決済に関するご質問やトラブルがございましたら、お気軽にお問い合わせください。
                </p>
                <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium">
                  サポートに連絡
                </button>
              </div>

              {/* キャンセル */}
              <div className="border-t pt-6">
                <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                  サブスクリプションをキャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
