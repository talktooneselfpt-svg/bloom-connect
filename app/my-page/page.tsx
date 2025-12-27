'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PLANS, PlanType } from '@/types/plan'
import { SAMPLE_PRODUCTS, PRODUCT_IDS } from '@/types/product'
import { calculateMonthlyFee, calculateRequiredDevices, comparePlans, getPricingBreakdownText } from '@/lib/utils/pricing'

export default function MyPage() {
  const router = useRouter()

  // サンプルデータ（実際はFirestoreから取得）
  const [currentPlan, setCurrentPlan] = useState<PlanType>('free')
  const [staffCount, setStaffCount] = useState(1) // 代表者1名のみ
  const [deviceCount, setDeviceCount] = useState(0)
  const [activeProductIds, setActiveProductIds] = useState<string[]>([])
  const [aiEnabledProductIds, setAiEnabledProductIds] = useState<string[]>([])

  // UI状態
  const [showPlanChange, setShowPlanChange] = useState(false)
  const [showProductManagement, setShowProductManagement] = useState(false)
  const [selectedNewPlan, setSelectedNewPlan] = useState<PlanType>(currentPlan)

  // 料金計算
  const activeProducts = activeProductIds
    .map(id => SAMPLE_PRODUCTS[id])
    .filter(p => p !== undefined)

  const currentPricing = calculateMonthlyFee(
    currentPlan,
    deviceCount,
    activeProducts as any[],
    aiEnabledProductIds,
    1, // 代表者1名
    0,
    0
  )

  useEffect(() => {
    // TODO: Firestoreから組織のサブスクリプション情報を取得
    // 仮のデータをセット
    setCurrentPlan('free')
    setStaffCount(1)
    setDeviceCount(0)
    setActiveProductIds([])
  }, [])

  const handlePlanChange = (newPlan: PlanType) => {
    // TODO: サブスクリプション変更リクエストを作成
    console.log('プラン変更リクエスト:', { from: currentPlan, to: newPlan })
    setCurrentPlan(newPlan)
    setShowPlanChange(false)
    alert(`プランを${PLANS[newPlan].displayName}に変更しました`)
  }

  const handleProductToggle = (productId: string) => {
    setActiveProductIds(prev => {
      if (prev.includes(productId)) {
        // 削除
        return prev.filter(id => id !== productId)
      } else {
        // 追加
        return [...prev, productId]
      }
    })
  }

  const handleAIToggle = (productId: string) => {
    setAiEnabledProductIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId)
      } else {
        return [...prev, productId]
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← ダッシュボードに戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">マイページ</h1>
          <p className="text-gray-600 mt-2">プランの変更・プロダクトの管理</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側: 現在の契約情報 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 現在のプラン */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">現在のプラン</h2>
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold text-lg">
                    {PLANS[currentPlan].displayName}
                  </div>
                </div>
                <button
                  onClick={() => setShowPlanChange(!showPlanChange)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  プラン変更
                </button>
              </div>

              <p className="text-gray-600 mb-4">{PLANS[currentPlan].description}</p>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">利用可能な機能</h3>
                <ul className="space-y-2">
                  {PLANS[currentPlan].features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* プラン変更パネル */}
            {showPlanChange && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">プランを選択</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(Object.keys(PLANS) as PlanType[]).map(planKey => {
                    const plan = PLANS[planKey]
                    const isCurrent = planKey === currentPlan
                    const comparison = comparePlans(currentPlan, planKey)

                    return (
                      <div
                        key={planKey}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          isCurrent
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => !isCurrent && handlePlanChange(planKey)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900">{plan.displayName}</h4>
                          {isCurrent && (
                            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">現在</span>
                          )}
                          {!isCurrent && comparison === 'upgrade' && (
                            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">↑</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                        <div className="text-lg font-bold text-gray-900">
                          {plan.devicePrice === 0 ? (
                            '無料'
                          ) : (
                            <>¥{plan.devicePrice.toLocaleString()}<span className="text-sm font-normal text-gray-600">/端末/月</span></>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* プロダクト管理 */}
            {currentPlan !== 'demo' && currentPlan !== 'free' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">プロダクト管理</h2>
                    <p className="text-sm text-gray-600">利用するプロダクトを選択してください</p>
                  </div>
                  <button
                    onClick={() => setShowProductManagement(!showProductManagement)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    {showProductManagement ? '完了' : '編集'}
                  </button>
                </div>

                {/* アクティブなプロダクト一覧 */}
                {!showProductManagement && activeProductIds.length === 0 && (
                  <p className="text-gray-500 text-center py-8">まだプロダクトを追加していません</p>
                )}

                {!showProductManagement && activeProductIds.length > 0 && (
                  <div className="space-y-3">
                    {activeProductIds.map(productId => {
                      const product = SAMPLE_PRODUCTS[productId]
                      if (!product) return null
                      const aiEnabled = aiEnabledProductIds.includes(productId)

                      return (
                        <div key={productId} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-gray-900">{product.displayName}</h4>
                              <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">
                                ¥{product.pricing.standard.toLocaleString()}
                                {aiEnabled && product.pricing.ai && (
                                  <span className="text-purple-600"> +¥{product.pricing.ai.toLocaleString()}</span>
                                )}
                                <span className="text-sm font-normal text-gray-600">/月</span>
                              </div>
                              {aiEnabled && <span className="text-xs text-purple-600">AI機能ON</span>}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* プロダクト選択パネル */}
                {showProductManagement && (
                  <div className="space-y-3 mt-4">
                    {Object.values(SAMPLE_PRODUCTS).map(product => {
                      if (!product) return null
                      const isActive = activeProductIds.includes(product.id)
                      const aiEnabled = aiEnabledProductIds.includes(product.id)
                      const canUseAI = currentPlan === 'ai' && product.type === 'ai'

                      return (
                        <div
                          key={product.id}
                          className={`border-2 rounded-lg p-4 ${
                            isActive ? 'border-green-500 bg-green-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <input
                                  type="checkbox"
                                  checked={isActive}
                                  onChange={() => handleProductToggle(product.id)}
                                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                                />
                                <div>
                                  <h4 className="font-semibold text-gray-900">{product.displayName}</h4>
                                  <p className="text-sm text-gray-600">{product.description}</p>
                                </div>
                              </div>

                              {/* AI機能トグル */}
                              {isActive && canUseAI && product.pricing.ai && (
                                <div className="ml-8 mt-3 p-3 bg-purple-50 border border-purple-200 rounded">
                                  <label className="flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={aiEnabled}
                                      onChange={() => handleAIToggle(product.id)}
                                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                    />
                                    <span className="ml-2 text-sm font-medium text-purple-900">
                                      AI機能を有効にする (+¥{product.pricing.ai.toLocaleString()}/月)
                                    </span>
                                  </label>
                                  {product.aiFeatures && (
                                    <p className="text-xs text-purple-700 mt-1 ml-6">
                                      {product.aiFeatures.description}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="text-right ml-4">
                              <div className="font-semibold text-gray-900">
                                ¥{product.pricing.standard.toLocaleString()}
                                <span className="text-sm font-normal text-gray-600">/月</span>
                              </div>
                              {product.pricing.ai && (
                                <div className="text-xs text-purple-600 mt-1">
                                  AI: +¥{product.pricing.ai.toLocaleString()}/月
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* デバイス・職員情報 */}
            {currentPlan !== 'demo' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">デバイス・職員情報</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">総職員数</div>
                    <div className="text-2xl font-bold text-gray-900">{staffCount}名</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">契約デバイス数</div>
                    <div className="text-2xl font-bold text-gray-900">{deviceCount}台</div>
                  </div>
                </div>
                {currentPlan === 'free' && (
                  <p className="text-sm text-gray-600 mt-4">
                    ※ 無料プランは代表者1名のみご利用いただけます。職員を追加する場合はスタンダードプラン以上にアップグレードしてください。
                  </p>
                )}
                {(currentPlan === 'standard' || currentPlan === 'ai') && (
                  <p className="text-sm text-gray-600 mt-4">
                    ※ 1デバイスあたり最大3名まで登録可能です。代表者1名は無料です。
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 右側: 料金サマリー */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">今月の料金</h2>

              {/* 料金明細 */}
              <div className="space-y-3 mb-6">
                {currentPricing.deviceFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">デバイス使用料</span>
                    <span className="font-semibold text-gray-900">
                      ¥{currentPricing.deviceFee.toLocaleString()}
                    </span>
                  </div>
                )}

                {currentPricing.productDetails.length > 0 && (
                  <>
                    <div className="text-sm font-semibold text-gray-700 pt-2 border-t">プロダクト料金</div>
                    {currentPricing.productDetails.map((detail, index) => (
                      <div key={index} className="flex justify-between text-sm pl-3">
                        <span className="text-gray-600">
                          {detail.productName}
                          {detail.aiEnabled && <span className="text-purple-600 text-xs ml-1">(AI)</span>}
                        </span>
                        <span className="font-semibold text-gray-900">
                          ¥{detail.subtotal.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </>
                )}

                {currentPricing.subtotal > 0 && (
                  <div className="flex justify-between text-sm pt-2 border-t">
                    <span className="text-gray-600">小計</span>
                    <span className="font-semibold text-gray-900">
                      ¥{currentPricing.subtotal.toLocaleString()}
                    </span>
                  </div>
                )}

                {currentPricing.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">消費税 (10%)</span>
                    <span className="font-semibold text-gray-900">
                      ¥{currentPricing.tax.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* 合計 */}
              <div className="border-t-2 pt-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-semibold text-gray-900">合計（月額）</span>
                  <span className="text-3xl font-bold text-blue-600">
                    ¥{currentPricing.total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 無料の注記 */}
              {currentPricing.representativeFree && (
                <p className="text-xs text-green-600 mt-3 bg-green-50 p-2 rounded">
                  ✓ 代表者{currentPricing.freeStaffCount}名は無料です
                </p>
              )}

              {currentPlan === 'free' && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 font-semibold mb-2">無料プランをご利用中</p>
                  <p className="text-xs text-blue-700">
                    職員を追加したい場合は、スタンダードプラン以上にアップグレードしてください。
                  </p>
                </div>
              )}

              {/* 決済ページへのリンク */}
              {currentPlan !== 'demo' && currentPlan !== 'free' && (
                <Link
                  href="/payment"
                  className="block w-full mt-6 px-4 py-3 bg-green-600 text-white text-center rounded-md hover:bg-green-700 transition-colors font-semibold"
                >
                  決済情報を確認
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
