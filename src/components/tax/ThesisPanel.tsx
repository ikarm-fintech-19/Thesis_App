'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n-context'
import { runThesisValidation, THESIS_TEST_CASES, DECLARATION_TEST_CASES } from '@/lib/engines/thesis-validator'
import { calculateDeclarationTVA } from '@/lib/engines/tva'
import { formatCurrency, calculateVariance } from '@/lib/decimal-utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  FlaskConical,
  Play,
  CheckCircle2,
  XCircle,
  FileDown,
  FileSpreadsheet,
  BookOpen,
  Shield,
  Printer,
  FileText
} from 'lucide-react'
import { Decimal } from '@/lib/decimal-utils'

interface ThesisResult {
  testCase: typeof THESIS_TEST_CASES[number]
  result: TVACalculationResult
  variance: ReturnType<typeof calculateVariance>
  pass: boolean
}

interface DeclarationTestResult {
  testCase: typeof DECLARATION_TEST_CASES[number]
  collectee: Decimal
  deductible: Decimal
  net: Decimal
  position: string
  netVariance: Decimal
  pass: boolean
}

interface TaxRuleRow {
  taxCode: string
  version: string
  effectiveFrom: Date
  metadata: string
  status: string
  brackets: { category: string; rate: number; condition: string }[]
  deductions: {
    code: string
    descriptionFr: string
    descriptionEn: string
    descriptionAr: string
    calcType: string
    value: number | null
    articleRef: string
  }[]
}

export function ThesisPanel({ dbRule }: { dbRule: TaxRuleRow | null }) {
  const { t, locale } = useI18n()
  const [results, setResults] = useState<ThesisResult[] | null>(null)
  const [declResults, setDeclResults] = useState<DeclarationTestResult[] | null>(null)
  const [running, setRunning] = useState(false)

  const handleRunTests = async () => {
    setRunning(true)
    await new Promise(r => setTimeout(r, 600))

    // Run TVA calculation tests (TC-01 to TC-05)
    const validationResults = runThesisValidation(dbRule)
    setResults(validationResults)

    // Run declaration tests (TC-06 to TC-08)
    const declTestResults = DECLARATION_TEST_CASES.map(tc => {
      const result = calculateDeclarationTVA(tc.transactions.map(tx => ({
        ...tx,
        date: '2026-01-15',
        description: tc.id,
      })), 0, 0.015) // Standard TLS rate 1.5%

      const netVariance = new Decimal(tc.expectedNet).minus(result.net).abs().toDecimalPlaces(2)

      return {
        testCase: tc,
        collectee: result.collectee,
        deductible: result.deductible,
        net: result.net,
        position: result.position,
        netVariance,
        pass: netVariance.isZero()
      }
    })
    setDeclResults(declTestResults)
    setRunning(false)
  }

  const handleExportCsv = async () => {
    try {
      const res = await fetch('/api/export-validation')
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tva-validation-matrice-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('CSV export error:', err)
    }
  }

  const handlePrintReport = () => {
    window.print()
  }

  const allCalcPassed = results ? results.every(r => r.pass) : null
  const allDeclPassed = declResults ? declResults.every(r => r.pass) : null
  const calcPassCount = results ? results.filter(r => r.pass).length : 0
  const declPassCount = declResults ? declResults.filter(r => r.pass).length : 0
  const totalTests = (results?.length ?? 0) + (declResults?.length ?? 0)
  const totalPassed = calcPassCount + declPassCount
  const allPassed = results && declResults ? allCalcPassed && allDeclPassed : null
  const ruleVersion = dbRule?.version ?? '2026 (fallback)'

  return (
    <div className="space-y-4">
      {/* Print-only header — visible only when printing */}
      <div className="print-only-header hidden">
        <h1>Calculateur TVA Algerie — Rapport de Validation</h1>
        <p>These Master — Loi de Finances 2026 — Art. 28-30-33 du CID</p>
        <p>Date: {new Date().toLocaleDateString('fr-FR')} | Version regles: {ruleVersion} | Moteur: decimal.js</p>
      </div>

      {/* Thesis header */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent no-print">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{t('thesis.title')}</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{t('thesis.description')}</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleRunTests} disabled={running}>
              {running ? (
                <Play className="h-4 w-4 me-2 animate-pulse" />
              ) : (
                <Play className="h-4 w-4 me-2" />
              )}
              {t('thesis.runTests')}
            </Button>
            {results && (
              <>
                <Button variant="outline" onClick={handleExportCsv}>
                  <FileSpreadsheet className="h-4 w-4 me-2" />
                  Export CSV
                </Button>
                <Button variant="outline" onClick={handlePrintReport}>
                  <Printer className="h-4 w-4 me-2" />
                  {t('wizard.summary.print') || 'Imprimer'}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Architecture info */}
      <Card className="print-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">{t('thesis.architecture')}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4 font-mono text-xs leading-relaxed overflow-x-auto" dir="ltr">
            <pre>{`
┌─────────────────────────────────────────────────────────┐
│            TVA Calculation Engine Architecture          │
│            (decimal.js — 20 decimal precision)          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [User Input]                                          │
│       │  { base, category, sector }                     │
│       ▼                                                 │
│  ┌─────────────────┐                                    │
│  │ 1. Parse Input  │  decimal.js strict mode            │
│  │    (no floats)  │  reject NaN / Infinity / negative   │
│  └────────┬────────┘                                    │
│           ▼                                              │
│  ┌─────────────────┐                                    │
│  │ 2. Load Rules   │  DB: Prisma → TaxRule + Brackets   │
│  │    from Store   │  Fallback: hardcoded 2026 LF       │
│  └────────┬────────┘                                    │
│           ▼                                              │
│  ┌─────────────────┐                                    │
│  │ 3. Auto-Exempt? │  Export   → Exempt (Art. 30-4°)    │
│  │    Check        │  Services < 1M  → Exempt (Art.30)  │
│  │                 │  Commerce < 1M  → Exempt (Art.30)  │
│  └────────┬────────┘                                    │
│           ▼                                              │
│  ┌─────────────────┐                                    │
│  │ 4. Get Bracket  │  normal  → 19% (Art. 28)          │
│  │                 │  reduced →  9% (Art. 29)           │
│  │                 │  exempt  →  0% (Art. 30)           │
│  └────────┬────────┘                                    │
│           ▼                                              │
│  ┌─────────────────┐                                    │
│  │ 5. Calculate    │  tax = base × rate                 │
│  │    (Decimal)    │  ttc = base + tax                  │
│  │                 │  rounding: HALF_UP, 2dp            │
│  └────────┬────────┘                                    │
│           ▼                                              │
│  ┌─────────────────┐                                    │
│  │ 6. Output       │  { base, rate, taxAmount, totalTTC,│
│  │  Structured     │    exempt, article, breakdown,     │
│  │  Breakdown      │    metadata }                       │
│  └─────────────────┘                                    │
│                                                         │
│  ─── Declaration Module ──────────────────────────────  │
│  ┌─────────────────┐                                    │
│  │ 7. Collectee    │  Sum(SALE.tva)                     │
│  │    = Sales TVA  │  Tax on collected revenue          │
│  └────────┬────────┘                                    │
│           ▼                                              │
│  ┌─────────────────┐                                    │
│  │ 8. Deductible   │  Sum(PURCHASE.tva × cap)           │
│  │    = Purchases  │  Caps: std 100%, veh 50%,          │
│  │                 │  hospitality 0%, real_est 100%     │
│  │                 │  (Art. 33 CID)                     │
│  └────────┬────────┘                                    │
│           ▼                                              │
│  ┌─────────────────┐                                    │
│  │ 9. Net Position │  net = collectee - deductible      │
│  │                 │  > 0 → A PAYER                     │
│  │                 │  < 0 → CREDIT DE TVA               │
│  └─────────────────┘                                    │
│                                                         │
│  Scalability: TaxRule.tax_code = "IRG" | "IBS" | ...   │
│  Versioning:   TaxRule.version = "2025" | "2026" | ...  │
│                                                         │
└─────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Results table — TVA Calculation Tests */}
      {results && (
        <Card className={`${allCalcPassed ? 'border-green-300' : 'border-red-300'} print-card`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {t('thesis.testResults')}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {calcPassCount}/{results.length} OK
                </Badge>
                <Badge
                  variant={allCalcPassed ? 'default' : 'destructive'}
                  className={allCalcPassed ? 'bg-green-600' : ''}
                >
                  {allCalcPassed ? (
                    <CheckCircle2 className="h-3.5 w-3.5 me-1" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 me-1" />
                  )}
                  {allCalcPassed ? t('thesis.allPassed') : t('thesis.someFailed')}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">{t('thesis.testId')}</TableHead>
                    <TableHead className="w-28">{t('thesis.category')}</TableHead>
                    <TableHead className="w-24">{t('thesis.input')}</TableHead>
                    <TableHead className="text-right w-28">{t('thesis.expected')}</TableHead>
                    <TableHead className="text-right w-28">{t('thesis.calculated')}</TableHead>
                    <TableHead className="text-right w-24">{t('thesis.variance')}</TableHead>
                    <TableHead className="text-center w-20">{t('thesis.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((r) => (
                    <TableRow key={r.testCase.id} className={!r.pass ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                      <TableCell className="font-mono text-sm font-medium">{r.testCase.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {r.testCase.category}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{r.testCase.sector}</p>
                      </TableCell>
                      <TableCell className="font-mono text-sm" dir="ltr">
                        {formatCurrency(r.testCase.base, locale)}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-right" dir="ltr">
                        {formatCurrency(r.testCase.expectedTVA.toString(), locale)}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-right" dir="ltr">
                        {formatCurrency(r.result.taxAmount, locale)}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-right" dir="ltr">
                        {r.variance.isZero() ? (
                          <span className="text-green-600">0.00</span>
                        ) : (
                          <span className="text-red-600 font-semibold">{formatCurrency(r.variance, locale)}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {r.pass ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Separator className="my-4" />

            {/* Legal citations */}
            <div className="space-y-2 print-avoid-break">
              <p className="text-sm font-semibold flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                {t('thesis.legalCitations')}
              </p>
              {results.map((r) => (
                <div key={r.testCase.id} className="rounded-md bg-muted/50 p-2.5 text-xs space-y-0.5">
                  <p className="font-medium">{r.testCase.id}: {r.testCase.description}</p>
                  <p className="text-muted-foreground">
                    {t('result.article')}: {r.result.article || 'N/A'} — {r.result.notes}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Declaration test results — TC-06 to TC-08 */}
      {declResults && (
        <Card className={`${allDeclPassed ? 'border-green-300' : 'border-red-300'} print-card`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t('thesis.declarationTests')}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {declPassCount}/{declResults.length} OK
                </Badge>
                <Badge
                  variant={allDeclPassed ? 'default' : 'destructive'}
                  className={allDeclPassed ? 'bg-green-600' : ''}
                >
                  {allDeclPassed ? (
                    <CheckCircle2 className="h-3.5 w-3.5 me-1" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 me-1" />
                  )}
                  {allDeclPassed ? 'OK' : 'FAIL'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">{t('thesis.testId')}</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right w-28">{t('declaration.collectee')}</TableHead>
                    <TableHead className="text-right w-28">{t('declaration.deductible')}</TableHead>
                    <TableHead className="text-right w-28">{t('declaration.netPosition')}</TableHead>
                    <TableHead className="text-right w-24">{t('thesis.variance')}</TableHead>
                    <TableHead className="text-center w-24">{t('thesis.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {declResults.map((r) => (
                    <TableRow key={r.testCase.id} className={!r.pass ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                      <TableCell className="font-mono text-sm font-medium">{r.testCase.id}</TableCell>
                      <TableCell className="text-xs max-w-[250px]">
                        <p className="font-medium">{r.testCase.description}</p>
                        <p className="text-muted-foreground">{r.testCase.articleRef}</p>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-right" dir="ltr">
                        {formatCurrency(r.collectee, locale)}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-right" dir="ltr">
                        {formatCurrency(r.deductible, locale)}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-right" dir="ltr">
                        <span className={r.net.isNeg() ? 'text-amber-600' : ''}>
                          {formatCurrency(r.net, locale)}
                        </span>
                        <br />
                        <Badge
                          variant={r.position === 'A PAYER' ? 'destructive' : 'outline'}
                          className={`text-[9px] ${r.position === 'CREDIT' ? 'border-amber-400 text-amber-700' : ''}`}
                        >
                          {r.position}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-right" dir="ltr">
                        {r.netVariance.isZero() ? (
                          <span className="text-green-600">0.00</span>
                        ) : (
                          <span className="text-red-600 font-semibold">{formatCurrency(r.netVariance, locale)}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {r.pass ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Separator className="my-4" />

            {/* Declaration test detail */}
            <div className="space-y-2 print-avoid-break">
              <p className="text-sm font-semibold flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                {t('declaration.art33Note')}
              </p>
              {declResults.map((r) => (
                <div key={r.testCase.id} className="rounded-md bg-muted/50 p-2.5 text-xs space-y-0.5">
                  <p className="font-medium">{r.testCase.id}: {r.testCase.description}</p>
                  <p className="text-muted-foreground">
                    {r.testCase.articleRef} — Collectee: {formatCurrency(r.collectee, locale)} | Deductible: {formatCurrency(r.deductible, locale)} | Net: {formatCurrency(r.net, locale)} ({r.position})
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Global summary stats */}
      {(results || declResults) && (
        <div className="p-3 rounded-lg border bg-muted/30 text-xs print-avoid-break">
          <p className="font-semibold mb-1">{t('declaration.summary') || 'Résumé de la validation'}</p>
          <p>{t('wizard.summary.total') || 'Total des tests'}: {totalTests} | {t('thesis.pass') || 'Valides'}: {totalPassed} | {t('thesis.fail') || 'Échoués'}: {totalTests - totalPassed}</p>
          {results && <p>TVA Calculator: {calcPassCount}/{results.length} | Declaration: {declPassCount}/{declResults?.length ?? 0}</p>}
          <p>{t('app.subtitle') || 'Version des règles: 2026'}</p>
          <p>Moteur de calcul: decimal.js (precision 20 decimales, arrondi HALF_UP)</p>
          <p>Base de données: Prisma ORM ({dbRule ? 'Supabase/PostgreSQL' : 'SQLite fallback'})</p>
          <p className="mt-1 italic text-muted-foreground">
            {t('legal.disclaimer')}
          </p>
        </div>
      )}

      {/* Print-only footer */}
      <div className="print-only-footer hidden">
        <p>Calculateur TVA Algerie — Rapport de Validation These | Genere le {new Date().toLocaleString('fr-FR')}</p>
        <p>Loi de Finances 2026 — Art. 28-30-33 du Code des Impots Directs et Indirects (CID)</p>
      </div>
    </div>
  )
}
