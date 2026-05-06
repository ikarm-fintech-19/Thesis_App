'use client'

import { useI18n } from '@/lib/i18n-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  FileCheck, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Download, 
  Printer, 
  Copy,
  CheckCircle2,
  AlertCircle,
  Building2
} from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import Decimal from 'decimal.js'
import { downloadJSON } from '@/lib/export-utils'

interface SummaryStepProps {
  data: any
  updateData: any
  onPenaltiesChange: any
}

export default function SummaryStep({ data, updateData, onPenaltiesChange }: SummaryStepProps) {
  const { t } = useI18n()
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mockRef] = useState(() => {
    const period = data.period.type === 'monthly' 
      ? `${String(data.period.month).padStart(2, '0')}`
      : `Q${Math.ceil(data.period.month / 3)}`
    return `G50-${data.period.year}-${period}-${Date.now().toString(36).toUpperCase()}`
  })

  const initialized = useRef(false)

  const calculateDeclaration = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const salesTransactions = (data.sales || []).map((s: any) => ({
        type: 'SALE',
        ht_amount: s.ht_amount,
        tva_rate: s.tva_rate,
        description: s.description,
        invoice_ref: s.invoice_ref,
        date: s.date
      }))

      const purchaseTransactions = (data.purchases || []).map((p: any) => ({
        type: 'PURCHASE',
        ht_amount: p.ht_amount,
        tva_rate: p.tva_rate,
        category: p.category,
        description: p.description,
        invoice_ref: p.invoice_ref,
        date: p.date
      }))

      const response = await fetch('/api/declaration/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions: [...salesTransactions, ...purchaseTransactions],
          salaries: data.salaries,
          periodType: data.period.type,
          year: data.period.year,
          month: data.period.month,
          previousCredit: data.previousCredit,
          tlsRate: data.tlsRate
        })
      })

      if (!response.ok) throw new Error('Calculation failed')
      
      const json = await response.json()
      setResult(json.data)
      updateData({ result: json.data })
      
      if (json.data.position === 'A PAYER') {
        onPenaltiesChange([{ type: 'TVA_DUE', message: t('penalties.tvaDue'), severity: 'warning' as const }])
      } else if (json.data.position === 'CREDIT') {
        onPenaltiesChange([{ type: 'TVA_CREDIT', message: t('penalties.tvaCredit'), severity: 'warning' as const }])
      } else {
        onPenaltiesChange([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Declaration calculation error:', err)
    } finally {
      setLoading(false)
    }
  }, [data, onPenaltiesChange, t])

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    calculateDeclaration()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">{t('wizard.summary.calculating')}</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-8 text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
          <p className="text-destructive">{error}</p>
          <Button onClick={calculateDeclaration} className="mt-4">
            {t('wizard.summary.retry')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            {t('wizard.summary.title')}
          </CardTitle>
          <CardDescription>
            {t('wizard.summary.period')}: {data.period.type === 'monthly' ? `Mois ${data.period.month}` : `Trimestre ${Math.ceil(data.period.month / 3)}`} {data.period.year}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-950/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  {t('wizard.summary.collectee')}
                </span>
              </div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {result?.collectee ? new Decimal(result.collectee).toFixed(2) : '0'} DZD
              </p>
              <p className="text-xs text-muted-foreground">
                {result?.sales_count || 0} {t('wizard.summary.sales')}
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {t('wizard.summary.deductible')}
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {result?.deductible ? new Decimal(result.deductible).toFixed(2) : '0'} DZD
              </p>
              <p className="text-xs text-muted-foreground">
                {result?.purchases_count || 0} {t('wizard.summary.purchases')}
              </p>
            </div>

            <div className={`p-4 rounded-lg ${result?.position === 'A PAYER' ? 'bg-red-50 dark:bg-red-950/50' : result?.position === 'CREDIT' ? 'bg-amber-50 dark:bg-amber-950/50' : 'bg-muted'}`}>
              <div className="flex items-center gap-2 mb-2">
                {result?.position === 'A PAYER' ? (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                ) : result?.position === 'CREDIT' ? (
                  <CheckCircle2 className="h-4 w-4 text-amber-600" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">
                  {result?.position === 'A PAYER' ? t('wizard.summary.toPay') : result?.position === 'CREDIT' ? t('wizard.summary.credit') : t('wizard.summary.zero')}
                </span>
              </div>
              <p className="text-2xl font-bold">
                {result?.net ? new Decimal(result.net).toFixed(2) : '0'} DZD
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">{t('wizard.summary.additional')}</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">{t('wizard.summary.previousCredit')}</Label>
                <Input
                  inputMode="decimal"
                  value={data.previousCredit}
                  onChange={(e) => updateData({ previousCredit: e.target.value })}
                  className="font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t('wizard.summary.tlsRate')}</Label>
                <Input
                  inputMode="decimal"
                  value={data.tlsRate}
                  onChange={(e) => updateData({ tlsRate: e.target.value })}
                  className="font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t('wizard.summary.tlsAmount')}</Label>
                <p className="font-mono font-medium">
                  {result?.tls_amount ? new Decimal(result.tls_amount).toFixed(2) : '0'} DZD
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">IRG Salaires</Label>
                <p className="font-mono font-medium text-red-600">
                  {result?.irg_salaires ? new Decimal(result.irg_salaires).toFixed(2) : '0'} DZD
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-primary">{t('wizard.summary.totalToPay')}</Label>
                <p className="font-mono font-bold text-xl text-primary">
                  {result?.total_to_pay ? new Decimal(result.total_to_pay).toFixed(2) : '0'} DZD
                </p>
              </div>
            </div>
          </div>

          {data.salaries.length > 0 && (
            <>
              <Separator />
              <div className="p-4 bg-purple-50 dark:bg-purple-950/50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-800 dark:text-purple-200">
                    {t('wizard.summary.salarySection')}
                  </span>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {data.salaries.length} {data.salaries.length === 1 ? 'salarié' : 'salariés'} déclaré(s)
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('wizard.summary.salaryNote')}
                </p>
              </div>
            </>
          )}

          <Separator />

          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-2 w-full md:w-auto overflow-hidden">
              <span className="text-sm text-muted-foreground whitespace-nowrap">{t('wizard.summary.reference')}:</span>
              <code className="bg-muted px-2 py-1 rounded text-sm font-mono truncate max-w-[150px] sm:max-w-none">{mockRef}</code>
              <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigator.clipboard.writeText(mockRef)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => window.print()}>
                <Printer className="h-4 w-4 me-2" />
                {t('wizard.summary.print')}
              </Button>
              <Button 
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => {
                  const exportData = {
                    metadata: {
                      reference: mockRef,
                      period: data.period,
                      timestamp: new Date().toISOString()
                    },
                    summary: result,
                    details: {
                      sales: data.sales,
                      purchases: data.purchases,
                      salaries: data.salaries
                    }
                  };
                  downloadJSON(exportData, mockRef);
                }}
              >
                <Download className="h-4 w-4 me-2" />
                {t('wizard.summary.export')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardContent className="py-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="font-medium">{t('wizard.summary.ready')}</p>
            <p className="text-sm text-muted-foreground">{t('wizard.summary.readyInfo')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}