/**
 * 料金計算ユーティリティ関数
 */

import { PLANS, PlanType } from '@/types/plan'
import { Product } from '@/types/product'
import { PricingCalculation } from '@/types/subscription'

/**
 * 月額料金を計算
 *
 * @param plan - 契約プラン
 * @param deviceCount - デバイス数
 * @param products - 利用中のプロダクト一覧
 * @param aiEnabledProductIds - AI機能を有効にしているプロダクトIDのリスト
 * @param representativeCount - 代表者数（通常1、無料）
 * @param discountRate - 割引率（0-100）
 * @param discountAmount - 割引額（固定額、円）
 * @returns 料金計算結果
 */
export function calculateMonthlyFee(
  plan: PlanType,
  deviceCount: number,
  products: Product[],
  aiEnabledProductIds: string[] = [],
  representativeCount: number = 1,
  discountRate: number = 0,
  discountAmount: number = 0
): PricingCalculation {
  const planInfo = PLANS[plan]

  // 代表者1名は無料
  const representativeFree = representativeCount >= 1
  const freeStaffCount = representativeFree ? 1 : 0

  // 1. デバイス使用料
  let deviceFee = 0

  // 無料プランの場合、デバイス料金は0（代表者1名のみ）
  if (plan === 'free') {
    deviceFee = 0
  } else if (plan === 'demo') {
    deviceFee = 0
  } else {
    // スタンダード・AIプランの場合、デバイス数 × 単価
    deviceFee = deviceCount * planInfo.devicePrice
  }

  // 2. プロダクト料金
  const productDetails: PricingCalculation['productDetails'] = []
  let productFeesTotal = 0
  let aiFeesTotal = 0

  products.forEach(product => {
    const aiEnabled = aiEnabledProductIds.includes(product.id)

    // スタンダードプラン価格
    let basePrice = product.pricing.standard

    // AI機能を有効にしている場合、AI追加料金
    let aiPrice = 0
    if (aiEnabled && product.pricing.ai) {
      aiPrice = product.pricing.ai
      aiFeesTotal += aiPrice
    }

    const subtotal = basePrice + aiPrice
    productFeesTotal += subtotal

    productDetails.push({
      productId: product.id,
      productName: product.displayName,
      basePrice,
      aiEnabled,
      aiPrice,
      subtotal,
    })
  })

  // 3. 小計
  const subtotal = deviceFee + productFeesTotal

  // 4. 割引計算
  let discount = 0

  // パーセント割引
  if (discountRate > 0) {
    discount += Math.floor(subtotal * (discountRate / 100))
  }

  // 固定額割引
  if (discountAmount > 0) {
    discount += discountAmount
  }

  // 割引は小計を超えない
  discount = Math.min(discount, subtotal)

  // 5. 税計算（消費税10%）
  const taxRate = 0.10
  const afterDiscount = subtotal - discount
  const tax = Math.floor(afterDiscount * taxRate)

  // 6. 合計
  const total = afterDiscount + tax

  return {
    deviceFee,
    productDetails,
    productFeesTotal,
    aiFeesTotal,
    subtotal,
    discount,
    taxRate,
    tax,
    total,
    representativeFree,
    freeStaffCount,
  }
}

/**
 * デバイス数を計算（職員数から）
 *
 * @param staffCount - 職員数
 * @param maxStaffPerDevice - 1デバイスあたりの最大職員数（デフォルト3人）
 * @param representativeCount - 代表者数（無料、デフォルト1）
 * @returns 必要なデバイス数
 */
export function calculateRequiredDevices(
  staffCount: number,
  maxStaffPerDevice: number = 3,
  representativeCount: number = 1
): number {
  // 代表者を除いた職員数
  const paidStaffCount = Math.max(0, staffCount - representativeCount)

  // 必要なデバイス数（切り上げ）
  const deviceCount = Math.ceil(paidStaffCount / maxStaffPerDevice)

  return deviceCount
}

/**
 * プラン変更時の料金差分を計算
 *
 * @param currentCalculation - 現在の料金計算結果
 * @param newCalculation - 新しい料金計算結果
 * @returns 差分（正の値なら値上げ、負の値なら値下げ）
 */
export function calculatePriceDifference(
  currentCalculation: PricingCalculation,
  newCalculation: PricingCalculation
): number {
  return newCalculation.total - currentCalculation.total
}

/**
 * 料金明細を文字列形式で取得（表示用）
 *
 * @param calculation - 料金計算結果
 * @returns 明細の文字列配列
 */
export function getPricingBreakdownText(calculation: PricingCalculation): string[] {
  const lines: string[] = []

  // デバイス使用料
  if (calculation.deviceFee > 0) {
    lines.push(`デバイス使用料: ¥${calculation.deviceFee.toLocaleString()}`)
  }

  // プロダクト料金
  if (calculation.productDetails.length > 0) {
    lines.push('\nプロダクト料金:')
    calculation.productDetails.forEach(detail => {
      if (detail.aiEnabled && detail.aiPrice > 0) {
        lines.push(
          `  - ${detail.productName}: ¥${detail.basePrice.toLocaleString()} + AI ¥${detail.aiPrice.toLocaleString()} = ¥${detail.subtotal.toLocaleString()}`
        )
      } else {
        lines.push(`  - ${detail.productName}: ¥${detail.subtotal.toLocaleString()}`)
      }
    })
  }

  // 小計
  lines.push(`\n小計: ¥${calculation.subtotal.toLocaleString()}`)

  // 割引
  if (calculation.discount > 0) {
    lines.push(`割引: -¥${calculation.discount.toLocaleString()}`)
  }

  // 消費税
  lines.push(`消費税 (${(calculation.taxRate * 100).toFixed(0)}%): ¥${calculation.tax.toLocaleString()}`)

  // 合計
  lines.push(`\n合計: ¥${calculation.total.toLocaleString()}`)

  // 代表者無料の注記
  if (calculation.representativeFree) {
    lines.push(`\n※ 代表者${calculation.freeStaffCount}名は無料です`)
  }

  return lines
}

/**
 * プラン比較（アップグレード/ダウングレードの判定）
 *
 * @param currentPlan - 現在のプラン
 * @param newPlan - 新しいプラン
 * @returns 'upgrade' | 'downgrade' | 'same'
 */
export function comparePlans(currentPlan: PlanType, newPlan: PlanType): 'upgrade' | 'downgrade' | 'same' {
  if (currentPlan === newPlan) return 'same'

  const planRanking: Record<PlanType, number> = {
    demo: 0,
    free: 1,
    standard: 2,
    ai: 3,
  }

  const currentRank = planRanking[currentPlan]
  const newRank = planRanking[newPlan]

  return newRank > currentRank ? 'upgrade' : 'downgrade'
}

/**
 * 次回請求日を計算
 *
 * @param currentDate - 現在の日付
 * @param billingDay - 請求日（毎月の何日か、1-28）
 * @returns 次回請求日
 */
export function calculateNextBillingDate(currentDate: Date, billingDay: number = 1): Date {
  const nextBilling = new Date(currentDate)

  // 当月の請求日
  nextBilling.setDate(billingDay)

  // もし今日が請求日以降なら、来月の請求日にする
  if (currentDate.getDate() >= billingDay) {
    nextBilling.setMonth(nextBilling.getMonth() + 1)
  }

  return nextBilling
}

/**
 * 日割り計算（月の途中でプラン変更した場合）
 *
 * @param monthlyFee - 月額料金
 * @param startDate - 開始日
 * @param endDate - 終了日
 * @returns 日割り料金
 */
export function calculateProration(monthlyFee: number, startDate: Date, endDate: Date): number {
  // その月の総日数
  const year = startDate.getFullYear()
  const month = startDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // 利用日数
  const usageDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

  // 日割り料金
  const proratedFee = Math.floor((monthlyFee / daysInMonth) * usageDays)

  return proratedFee
}
