import { Decimal } from './decimal-utils'

export type TVACategory = 'normal' | 'reduced' | 'exempt'

export interface BracketCondition {
  applies_to: string[]
  article?: string
}

export interface TaxBracketData {
  category: TVACategory
  rate: Decimal
  condition: BracketCondition
}

export interface TaxDeductionData {
  code: string
  descriptionFr: string
  descriptionEn: string
  descriptionAr: string
  calcType: string
  value: number | null
  articleRef: string
}

export interface TaxRuleMetadata {
  law: string
  authority: string
  article_main: string
}

export interface CalculationStep {
  label: string
  base: Decimal
  rate: Decimal
  amount: Decimal
  article: string
  notes: string
}

export interface TVACalculationResult {
  base: Decimal
  rate: Decimal
  taxAmount: Decimal
  totalTTC: Decimal
  category: TVACategory
  exempt: boolean
  exemptReason: string
  article: string
  breakdown: CalculationStep[]
  notes: string
  metadata: TaxRuleMetadata | null
}

interface TaxBracketRow {
  category: string
  rate: number
  condition: string
}

interface TaxDeductionRow {
  code: string
  descriptionFr: string
  descriptionEn: string
  descriptionAr: string
  calcType: string
  value: number | null
  articleRef: string
}

interface TaxRuleRow {
  taxCode: string
  version: string
  effectiveFrom: Date
  metadata: string
  status: string
  brackets: TaxBracketRow[]
  deductions: TaxDeductionRow[]
}

// ---- Pure Functions ----

/**
 * Checks if a tax refund claim is still valid according to the 4-year limitation (Art. 27 LF 2026).
 */
export function isClaimValid(declarationYear: number, currentYear: number): boolean {
  // LF 2026 specifies that the right to claim a refund expires after 4 years
  // following the year the right was acquired.
  return (currentYear - declarationYear) <= 4;
}

/**
 * Get the applicable TVA bracket for a given category
 */
function getApplicableBracket(brackets: TaxBracketData[], category: TVACategory): TaxBracketData | null {
  const normalizedCategory = category.toLowerCase().trim()
  return brackets.find(b => b.category.toLowerCase().trim() === normalizedCategory) ?? null
}

/**
 * Check if auto-exemption applies based on amount and sector
 */
function checkAutoExemption(
  deductions: TaxDeductionData[],
  baseAmount: Decimal,
  sector: string
): { exempt: boolean; reason: string; article: string } {
  const isService = sector === 'services'
  const isCommerce = sector === 'commerce'
  const isExport = sector === 'export'

  // Export is always exempt
  if (isExport) {
    const exportDeduction = deductions.find(d => d.code === 'EXPORT_EXEMPT')
    return {
      exempt: true,
      reason: isService
        ? 'Exonération à l\'exportation — Services'
        : 'Exonération à l\'exportation',
      article: exportDeduction?.articleRef ?? 'Art. 30 - 4° du CID'
    }
  }

  // Check auto-exemption threshold for services
  if (isService) {
    const autoExempt = deductions.find(d => d.code === 'AUTO_EXEMPT_SERVICE')
    if (autoExempt && autoExempt.value && baseAmount.lte(new Decimal(autoExempt.value))) {
      return {
        exempt: true,
        reason: `Franchise de TVA — Prestataires de services (CA ≤ ${autoExempt.value.toLocaleString('fr-FR')} DZD)`,
        article: autoExempt.articleRef
      }
    }
  }

  // Check auto-exemption threshold for commerce
  if (isCommerce) {
    const autoExempt = deductions.find(d => d.code === 'AUTO_EXEMPT_GOODS')
    if (autoExempt && autoExempt.value && baseAmount.lte(new Decimal(autoExempt.value))) {
      return {
        exempt: true,
        reason: `Franchise de TVA — Commerçants (CA ≤ ${autoExempt.value.toLocaleString('fr-FR')} DZD)`,
        article: autoExempt.articleRef
      }
    }
  }

  return { exempt: false, reason: '', article: '' }
}

/**
 * Parse bracket data from database rows
 */
function parseBrackets(rows: TaxBracketRow[]): TaxBracketData[] {
  if (!rows) return []
  return rows.map(row => ({
    category: (row.category?.toLowerCase() || 'normal') as TVACategory,
    rate: new Decimal(String(row.rate)),
    condition: typeof row.condition === 'string' ? JSON.parse(row.condition) : row.condition
  }))
}

/**
 * Parse deduction data from database rows
 */
function parseDeductions(rows: TaxDeductionRow[]): TaxDeductionData[] {
  if (!rows) return []
  return rows.map(row => ({
    code: row.code,
    descriptionFr: row.descriptionFr,
    descriptionEn: row.descriptionEn,
    descriptionAr: row.descriptionAr,
    calcType: row.calcType,
    value: row.value,
    articleRef: row.articleRef
  }))
}

/**
 * Main TVA calculation function — pure
 */
export function calculateTVA(params: {
  base: string | number
  category: TVACategory
  sector?: string
  rule?: TaxRuleRow | null
}): TVACalculationResult {
  const { base: baseInput, category, sector = '', rule } = params

  // Parse input with decimal.js
  const base = new Decimal(baseInput || 0)

  // Default metadata
  const defaultMetadata: TaxRuleMetadata = {
    law: 'Loi de Finances 2026',
    authority: 'DGIP',
    article_main: 'Art. 28 CID'
  }

  let metadata: TaxRuleMetadata | null = null
  let brackets: TaxBracketData[] = []
  let deductions: TaxDeductionData[] = []

  // Parse rule data if provided
  if (rule) {
    try {
      metadata = typeof rule.metadata === 'string' ? JSON.parse(rule.metadata) : rule.metadata
    } catch {
      metadata = defaultMetadata
    }
    brackets = parseBrackets(rule.brackets)
    deductions = parseDeductions(rule.deductions)
  } else {
    // Fallback to hardcoded 2026 rules (for demo/thesis without DB)
    brackets = [
      {
        category: 'normal',
        rate: new Decimal('0.19'),
        condition: { applies_to: ['most_goods', 'services'], article: 'Art. 28 - Taux normal 19%' }
      },
      {
        category: 'reduced',
        rate: new Decimal('0.09'),
        condition: { applies_to: ['food', 'pharma', 'transport', 'rehabilitation', 'health_accommodation', 'vocational_training'], article: 'Art. 29 - Taux réduit 9% (étendu par Art. 53 LF 2026)' }
      },
      {
        category: 'exempt',
        rate: new Decimal('0'),
        condition: { applies_to: ['exports', 'basic_education', 'health_services'], article: 'Art. 30 - Exonérations' }
      }
    ]
    deductions = [
      {
        code: 'AUTO_EXEMPT_SERVICE',
        descriptionFr: 'Franchise de TVA - Prestataires de services (CA < 1 000 000 DZD)',
        descriptionEn: 'TVA Exemption - Service providers (Turnover < 1,000,000 DZD)',
        descriptionAr: 'إعفاء من TVA - مقدمو الخدمات (رقم أعمال < 1,000,000 د.ج)',
        calcType: 'exempt',
        value: 1000000,
        articleRef: 'Art. 30 - 1° du CID'
      },
      {
        code: 'AUTO_EXEMPT_GOODS',
        descriptionFr: 'Franchise de TVA - Commerçants (CA < 1 000 000 DZD)',
        descriptionEn: 'TVA Exemption - Merchants (Turnover < 1,000,000 DZD)',
        descriptionAr: 'إعفاء من TVA - التجار (رقم أعمال < 1,000,000 د.ج)',
        calcType: 'exempt',
        value: 1000000,
        articleRef: 'Art. 30 - 1° du CID'
      },
      {
        code: 'EXPORT_EXEMPT',
        descriptionFr: 'Exonération à l\'exportation',
        descriptionEn: 'Export exemption',
        descriptionAr: 'إعفاء التصدير',
        calcType: 'exempt',
        value: 0,
        articleRef: 'Art. 30 - 4° du CID'
      }
    ]
    metadata = defaultMetadata
  }

  const breakdown: CalculationStep[] = []

  // Step 1: Check auto-exemption
  const exemptionCheck = checkAutoExemption(deductions, base, sector)
  if (exemptionCheck.exempt) {
    breakdown.push({
      label: 'Exonération automatique',
      base: base,
      rate: new Decimal(0),
      amount: new Decimal(0),
      article: exemptionCheck.article,
      notes: exemptionCheck.reason
    })

    return {
      base,
      rate: new Decimal(0),
      taxAmount: new Decimal(0),
      totalTTC: base,
      category,
      exempt: true,
      exemptReason: exemptionCheck.reason,
      article: exemptionCheck.article,
      breakdown,
      notes: `Exonération applicable — ${exemptionCheck.reason}`,
      metadata
    }
  }

  // Step 2: Get applicable bracket
  const bracket = getApplicableBracket(brackets, category)
  if (!bracket) {
    return {
      base,
      rate: new Decimal(0),
      taxAmount: new Decimal(0),
      totalTTC: base,
      category,
      exempt: true,
      exemptReason: 'Catégorie non reconnue',
      article: '',
      breakdown: [],
      notes: 'Catégorie TVA non reconnue par le moteur de calcul.',
      metadata
    }
  }

  // Step 3: If exempt category
  if (category === 'exempt') {
    breakdown.push({
      label: 'Exonération (catégorie)',
      base: base,
      rate: new Decimal(0),
      amount: new Decimal(0),
      article: bracket.condition.article ?? 'Art. 30 du CID',
      notes: `Catégorie exonérée par ${bracket.condition.article ?? 'Art. 30 du CID'}`
    })

    return {
      base,
      rate: new Decimal(0),
      taxAmount: new Decimal(0),
      totalTTC: base,
      category,
      exempt: true,
      exemptReason: `Catégorie exonérée — ${bracket.condition.applies_to.join(', ')}`,
      article: bracket.condition.article ?? 'Art. 30 du CID',
      breakdown,
      notes: `Opération exonérée de TVA en vertu de ${bracket.condition.article ?? 'l\'article 30 du CID'}.`,
      metadata
    }
  }

  // Step 4: Calculate TVA
  const taxAmount = base.mul(bracket.rate).toDecimalPlaces(2)
  const totalTTC = base.plus(taxAmount).toDecimalPlaces(2)

  breakdown.push({
    label: `Base imposable × Taux ${bracket.rate.mul(100).toString()}%`,
    base,
    rate: bracket.rate,
    amount: taxAmount,
    article: bracket.condition.article ?? '',
    notes: `Application du taux de TVA de ${bracket.rate.mul(100).toString()}% sur la base imposable de ${base.toFixed(2)} DZD.`
  })

  breakdown.push({
    label: 'Total TTC',
    base,
    rate: bracket.rate,
    amount: totalTTC,
    article: '',
    notes: `Montant hors taxes ${base.toFixed(2)} DZD + TVA ${taxAmount.toFixed(2)} DZD = ${totalTTC.toFixed(2)} DZD`
  })

  return {
    base,
    rate: bracket.rate,
    taxAmount,
    totalTTC,
    category,
    exempt: false,
    exemptReason: '',
    article: bracket.condition.article ?? '',
    breakdown,
    notes: `TVA calculée au taux de ${bracket.rate.mul(100).toString()}% — ${bracket.condition.article ?? ''}`,
    metadata
  }
}

/**
 * Thesis validation test cases
 */
export interface ThesisTestCase {
  id: string
  base: number
  category: TVACategory
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
]

/**
 * Declaration test cases (TC-06 to TC-08)
 * Tests the full declaration workflow with collectée/déductible/net calculation
 */
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
    expectedDeductible: 190000,  // 190000 (standard) + 0 (vehicle 0% cap)
    expectedNet: 190000,
    expectedPosition: 'A PAYER',
    description: 'Ventes 2M (19%) + Achats 1M standard + 500k véhicule (0% déductible) → Net 190,000 DZD',
    articleRef: 'Art. 28 + Art. 30 CTCA'
  },
  {
    id: 'TC-08',
    transactions: [
      { type: 'SALE', ht_amount: 0, tva_rate: 0.00, category: 'standard' },  // Export: 0% TVA
      { type: 'PURCHASE', ht_amount: 1000000, tva_rate: 0.19, category: 'standard' }
    ],
    expectedCollectee: 0,
    expectedDeductible: 190000,
    expectedNet: -190000,
    expectedPosition: 'CREDIT',
    description: 'Export (0%) + Achats 1M (19%, standard) → Crédit -190,000 DZD',
    articleRef: 'Art. 30-4° + Art. 28 CTCA'
  }
]

/**
 * Run all thesis test cases against the calculation engine
 */
export function runThesisValidation(rule?: TaxRuleRow | null): {
  testCase: ThesisTestCase
  result: TVACalculationResult
  variance: Decimal
  pass: boolean
}[] {
  return THESIS_TEST_CASES.map(tc => {
    const result = calculateTVA({
      base: tc.base,
      category: tc.category,
      sector: tc.sector,
      rule
    })
    const expected = new Decimal(tc.expectedTVA)
    const calculated = result.taxAmount
    const variance = expected.minus(calculated).abs().toDecimalPlaces(2)
    return {
      testCase: tc,
      result,
      variance,
      pass: variance.isZero()
    }
  })
}
