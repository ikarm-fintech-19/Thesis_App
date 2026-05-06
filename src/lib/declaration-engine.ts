/**
 * Declaration Calculation Engine
 * Computes TVA collectée, TVA déductible, and net position
 * for a given set of transactions using decimal.js for precision.
 */

import { Decimal } from './decimal-utils'
import { getDeductibilityCap, DEDUCTIBILITY_INFO } from './deductibility-rules'

export type TransactionType = 'SALE' | 'PURCHASE'
export type PeriodType = 'MONTHLY' | 'QUARTERLY'

export interface TransactionInput {
  type: TransactionType
  date: string
  description?: string
  ht_amount: number | string
  tva_rate: number | string
  category: string // standard, vehicle, hospitality, real_estate
  invoice_ref?: string
}

export interface TransactionBreakdown {
  id: string
  type: TransactionType
  date: string
  description: string
  ht_amount: Decimal
  tva_rate: Decimal
  gross_tva: Decimal
  deductible_cap: Decimal
  deductible_tva: Decimal
  category: string
  invoice_ref: string
  articleRef: string
}

export interface DeclarationResult {
  collectee: Decimal         // Total TVA collected on sales
  deductible: Decimal        // Total TVA deductible on purchases
  net: Decimal               // collectee - deductible
  position: 'A PAYER' | 'CREDIT' | 'ZERO'
  sales_count: number
  purchases_count: number
  total_sales_ht: Decimal
  total_purchases_ht: Decimal
  breakdown: TransactionBreakdown[]
  period: {
    type: PeriodType
    year: number
    month: number
    label: string
  }
}

/**
 * Format period label for display
 */
function getPeriodLabel(type: PeriodType, year: number, month: number): string {
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]

  if (type === 'MONTHLY') {
    return `${monthNames[month - 1]} ${year}`
  }
  // Quarterly: month maps to Q1(1), Q2(4), Q3(7), Q4(10)
  const quarter = Math.ceil(month / 3)
  return `T${quarter} — ${year}`
}

/**
 * Get the article reference for a deductibility category
 */
function getCategoryArticleRef(category: string): string {
  const info = DEDUCTIBILITY_INFO.find(d => d.category === category)
  return info?.articleRef ?? 'Art. 33 du CID'
}

/**
 * Main declaration calculation — pure function using decimal.js
 */
export function calculateDeclaration(params: {
  transactions: TransactionInput[]
  periodType: PeriodType
  year: number
  month: number
}): DeclarationResult {
  const { transactions, periodType, year, month } = params

  const breakdown: TransactionBreakdown[] = []
  let collectee = new Decimal(0)
  let deductible = new Decimal(0)
  let sales_count = 0
  let purchases_count = 0
  let total_sales_ht = new Decimal(0)
  let total_purchases_ht = new Decimal(0)

  for (let i = 0; i < transactions.length; i++) {
    const tx = transactions[i]

    // Parse inputs with decimal.js
    const ht = new Decimal(tx.ht_amount || 0)
    let rate = new Decimal(tx.tva_rate || 0)
    // Robustness: Handle 19 instead of 0.19
    if (rate.gt(1)) {
      rate = rate.div(100)
    }

    // Validate
    if (ht.isNeg() || ht.isNaN()) continue
    if (rate.isNeg() || rate.isNaN() || rate.gt(1)) continue

    const grossTVA = ht.mul(rate).toDecimalPlaces(2)

    if (tx.type === 'SALE') {
      sales_count++
      total_sales_ht = total_sales_ht.plus(ht)
      collectee = collectee.plus(grossTVA)

      breakdown.push({
        id: `TX-${String(i + 1).padStart(3, '0')}`,
        type: 'SALE',
        date: tx.date,
        description: tx.description || '',
        ht_amount: ht,
        tva_rate: rate,
        gross_tva: grossTVA,
        deductible_cap: new Decimal(0),
        deductible_tva: new Decimal(0),
        category: tx.category,
        invoice_ref: tx.invoice_ref || '',
        articleRef: 'Art. 28-29 du CID'
      })
    } else if (tx.type === 'PURCHASE') {
      purchases_count++
      total_purchases_ht = total_purchases_ht.plus(ht)

      const cap = new Decimal(String(getDeductibilityCap(tx.category)))
      const deductibleTVA = grossTVA.mul(cap).toDecimalPlaces(2)
      deductible = deductible.plus(deductibleTVA)

      breakdown.push({
        id: `TX-${String(i + 1).padStart(3, '0')}`,
        type: 'PURCHASE',
        date: tx.date,
        description: tx.description || '',
        ht_amount: ht,
        tva_rate: rate,
        gross_tva: grossTVA,
        deductible_cap: cap,
        deductible_tva: deductibleTVA,
        category: tx.category,
        invoice_ref: tx.invoice_ref || '',
        articleRef: getCategoryArticleRef(tx.category)
      })
    }
  }

  const net = collectee.minus(deductible).toDecimalPlaces(2)
  const position: 'A PAYER' | 'CREDIT' | 'ZERO' = net.gt(0) ? 'A PAYER' : net.lt(0) ? 'CREDIT' : 'ZERO'

  return {
    collectee: collectee.toDecimalPlaces(2),
    deductible: deductible.toDecimalPlaces(2),
    net,
    position,
    sales_count,
    purchases_count,
    total_sales_ht: total_sales_ht.toDecimalPlaces(2),
    total_purchases_ht: total_purchases_ht.toDecimalPlaces(2),
    breakdown,
    period: {
      type: periodType,
      year,
      month,
      label: getPeriodLabel(periodType, year, month)
    }
  }
}
