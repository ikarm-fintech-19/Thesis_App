import { Decimal } from '../decimal-utils';
import { calculateSingleTVA, calculateDeclarationTVA } from './tva';

export interface ThesisTestCase {
  id: string
  base: number
  category: 'normal' | 'reduced' | 'exempt'
  sector: string
  expectedTVA: number
  description: string
}

export const THESIS_TEST_CASES: ThesisTestCase[] = [
  {
    id: 'TC-01',
    base: 1000000,
    category: 'normal',
    sector: 'production',
    expectedTVA: 190000,
    description: 'Production — Taux normal 19%'
  },
  {
    id: 'TC-02',
    base: 2000000,
    category: 'reduced',
    sector: 'production',
    expectedTVA: 180000,
    description: 'Production — Taux réduit 9% (produits alimentaires)'
  },
  {
    id: 'TC-03',
    base: 2000000,
    category: 'exempt',
    sector: 'export',
    expectedTVA: 0,
    description: 'Export — Exonéré'
  },
  {
    id: 'TC-04',
    base: 750000,
    category: 'normal',
    sector: 'services',
    expectedTVA: 0,
    description: 'Services < 1M DZD — Franchise auto-exempt'
  },
  {
    id: 'TC-05',
    base: 3000000,
    category: 'normal',
    sector: 'services',
    expectedTVA: 570000,
    description: 'Services > 1M DZD — Taux normal 19%'
  }
];

export interface DeclarationTestCase {
  id: string
  transactions: Array<{
    type: 'SALE' | 'PURCHASE'
    ht_amount: number
    tva_rate: number
    category: string
  }>
  expectedCollectee: number
  expectedDeductible: number
  expectedNet: number
  expectedPosition: 'A PAYER' | 'CREDIT' | 'ZERO'
  description: string
  articleRef: string
}

export const DECLARATION_TEST_CASES: DeclarationTestCase[] = [
  {
    id: 'TC-06',
    transactions: [
      { type: 'SALE', ht_amount: 2000000, tva_rate: 0.19, category: 'standard' },
      { type: 'PURCHASE', ht_amount: 1000000, tva_rate: 0.19, category: 'standard' }
    ],
    expectedCollectee: 380000,
    expectedDeductible: 190000,
    expectedNet: 190000,
    expectedPosition: 'A PAYER',
    description: 'Ventes 2M (19%) + Achats 1M (19%, standard) → Net 190,000 DZD',
    articleRef: 'Art. 28 + Art. 33-1° CID'
  },
  {
    id: 'TC-07',
    transactions: [
      { type: 'SALE', ht_amount: 2000000, tva_rate: 0.19, category: 'standard' },
      { type: 'PURCHASE', ht_amount: 1000000, tva_rate: 0.19, category: 'standard' },
      { type: 'PURCHASE', ht_amount: 500000, tva_rate: 0.19, category: 'vehicle' }
    ],
    expectedCollectee: 380000,
    expectedDeductible: 190000,
    expectedNet: 190000,
    expectedPosition: 'A PAYER',
    description: 'Ventes 2M (19%) + Achats 1M standard + 500k véhicule (0% déductible) → Net 190,000 DZD',
    articleRef: 'Art. 28 + Art. 30 CTCA'
  },
  {
    id: 'TC-08',
    transactions: [
      { type: 'SALE', ht_amount: 0, tva_rate: 0.00, category: 'standard' },
      { type: 'PURCHASE', ht_amount: 1000000, tva_rate: 0.19, category: 'standard' }
    ],
    expectedCollectee: 0,
    expectedDeductible: 190000,
    expectedNet: -190000,
    expectedPosition: 'CREDIT',
    description: 'Export (0%) + Achats 1M (19%, standard) → Crédit -190,000 DZD',
    articleRef: 'Art. 30-4° + Art. 28 CTCA'
  }
];

export function runThesisValidation(rule?: any) {
  return THESIS_TEST_CASES.map(tc => {
    const result = calculateSingleTVA({
      base: tc.base,
      category: tc.category as any,
      sector: tc.sector,
      rule
    });
    const expected = new Decimal(tc.expectedTVA);
    const calculated = result.taxAmount;
    const variance = expected.minus(calculated).abs().toDecimalPlaces(2);
    return {
      testCase: tc,
      result,
      variance,
      pass: variance.isZero()
    };
  });
}
