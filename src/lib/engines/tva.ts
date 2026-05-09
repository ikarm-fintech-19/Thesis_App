import { Decimal } from '../decimal-utils';
import { BaseTransaction, TVAResult, TVALineItem } from './types';

export type TVACategory = 'normal' | 'reduced' | 'exempt';

export interface TVACalculationResult {
  base: Decimal;
  rate: Decimal;
  taxAmount: Decimal;
  totalTTC: Decimal;
  category: TVACategory;
  exempt: boolean;
  exemptReason: string;
  article: string;
  breakdown: any[];
  notes: string;
  metadata: any;
}

/**
 * Algerian VAT Deductibility Rules (Art. 30 CTCA / Art. 33 CID)
 */
export function getDeductibilityRate(category: string): number {
  switch (category.toLowerCase()) {
    case 'vehicle':
    case 'tourism_vehicle':
    case 'hospitality':
    case 'reception':
      return 0.00;
    case 'real_estate':
      return 1.00;
    case 'standard':
    default:
      return 1.00;
  }
}

/**
 * Algerian Tax Code Reference Mapper
 */
export function getArticleReference(category: string, type: 'SALE' | 'PURCHASE'): string {
  if (type === 'SALE') return 'Art. 28 CID';
  
  switch (category.toLowerCase()) {
    case 'vehicle': return 'Art. 30-1 CTCA';
    case 'hospitality': return 'Art. 30-2 CTCA';
    default: return 'Art. 33 CID';
  }
}

/**
 * Main TVA calculation for a single operation (Simple/Expert Calculator)
 */
export function calculateSingleTVA(params: {
  base: string | number | Decimal;
  category: TVACategory;
  sector?: string;
  rule?: any;
}): TVACalculationResult {
  const base = new Decimal(String(params.base || 0));
  const { category, sector = '' } = params;
  
  // Default Brackets (LF 2026)
  const brackets = {
    normal: new Decimal('0.19'),
    reduced: new Decimal('0.09'),
    exempt: new Decimal('0')
  };

  // Exemption Logic
  const isExport = sector === 'export';
  if (isExport) {
    return {
      base,
      rate: new Decimal(0),
      taxAmount: new Decimal(0),
      totalTTC: base,
      category,
      exempt: true,
      exemptReason: 'Exonération à l\'exportation (Art. 30-4° CID)',
      article: 'Art. 30-4° CID',
      breakdown: [],
      notes: 'Opération exonérée car destinée à l\'exportation.',
      metadata: null
    };
  }

  // Threshold Checks (Auto-exemption for Small Businesses)
  const isService = sector === 'services';
  const threshold = new Decimal(1000000); // 1M DZD threshold
  if (isService && base.lte(threshold)) {
    return {
      base,
      rate: new Decimal(0),
      taxAmount: new Decimal(0),
      totalTTC: base,
      category,
      exempt: true,
      exemptReason: `Franchise de TVA — Services (CA ≤ 1M DZD)`,
      article: 'Art. 30 CID',
      breakdown: [],
      notes: 'Bénéficie de la franchise de TVA selon l\'Art. 30 du CID.',
      metadata: null
    };
  }

  const rate = brackets[category] || brackets.normal;
  const taxAmount = base.mul(rate).toDecimalPlaces(2);
  const totalTTC = base.add(taxAmount);

  return {
    base,
    rate,
    taxAmount,
    totalTTC,
    category,
    exempt: category === 'exempt',
    exemptReason: category === 'exempt' ? 'Catégorie exonérée' : '',
    article: category === 'reduced' ? 'Art. 29 CID' : 'Art. 28 CID',
    breakdown: [
      { label: 'HT', amount: base },
      { label: `TVA (${rate.mul(100)}%)`, amount: taxAmount },
      { label: 'TTC', amount: totalTTC }
    ],
    notes: `Calcul au taux ${rate.mul(100)}%.`,
    metadata: { law: 'LF 2026', authority: 'DGIP' }
  };
}

/**
 * Full Declaration Calculation (G50)
 */
export function calculateDeclarationTVA(
  transactions: BaseTransaction[],
  previousCredit: number | string | Decimal = 0,
  tlsRate: number | string | Decimal = 0.015
): TVAResult {
  const credit = new Decimal(String(previousCredit));
  const tlsVal = new Decimal(String(tlsRate));
  
  let collectee = new Decimal(0);
  let totalSalesHT = new Decimal(0);
  let totalPurchasesHT = new Decimal(0);
  let salesCount = 0;
  let purchasesCount = 0;
  
  const breakdown: TVALineItem[] = transactions.map((tx, idx) => {
    const ht = new Decimal(String(tx.ht_amount));
    const rate = new Decimal(String(tx.tva_rate));
    const grossTva = ht.mul(rate).toDecimalPlaces(2);
    
    let deductibleTva = new Decimal(0);
    let cap = new Decimal(1.0);

    if (tx.type === 'SALE') {
      collectee = collectee.add(grossTva);
      totalSalesHT = totalSalesHT.add(ht);
      salesCount++;
    } else {
      cap = new Decimal(getDeductibilityRate(tx.category || 'standard'));
      deductibleTva = grossTva.mul(cap).toDecimalPlaces(2);
      totalPurchasesHT = totalPurchasesHT.add(ht);
      purchasesCount++;
    }

    return {
      id: tx.id || `tx-${idx}`,
      type: tx.type,
      date: tx.date,
      description: tx.description,
      ht_amount: ht,
      tva_rate: rate,
      gross_tva: grossTva,
      deductible_cap: cap,
      deductible_tva: deductibleTva,
      category: tx.category || 'standard',
      invoice_ref: tx.invoice_ref || '',
      articleRef: getArticleReference(tx.category || 'standard', tx.type)
    };
  });

  const totalDeductible = breakdown
    .filter(it => it.type === 'PURCHASE')
    .reduce((acc, it) => acc.add(it.deductible_tva), new Decimal(0));

  const tlsAmount = totalSalesHT.mul(tlsVal).toDecimalPlaces(2);
  const netTva = collectee.sub(totalDeductible).sub(credit);
  
  let position: 'A PAYER' | 'CREDIT' | 'ZERO' = 'ZERO';
  let finalNet = new Decimal(0);

  if (netTva.gt(0)) {
    position = 'A PAYER';
    finalNet = netTva;
  } else if (netTva.lt(0)) {
    position = 'CREDIT';
    finalNet = netTva.abs();
  }

  const totalToPay = position === 'A PAYER' ? finalNet.add(tlsAmount) : tlsAmount;

  return {
    collectee,
    deductible: totalDeductible,
    previous_credit: credit,
    tls_amount: tlsAmount,
    net: finalNet,
    total_to_pay: totalToPay,
    position,
    sales_count: salesCount,
    purchases_count: purchasesCount,
    total_sales_ht: totalSalesHT,
    total_purchases_ht: totalPurchasesHT,
    breakdown
  };
}

/**
 * Art. 27 LF 2026: 4-year refund claim limit
 */
export function isClaimValid(declarationYear: number, currentYear: number): boolean {
  return (currentYear - declarationYear) <= 4;
}
