'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useI18n } from '@/lib/i18n-context'
import { useAuth } from '@/components/auth/AuthProvider'
import { useAIStore } from '@/lib/ai-store'
import { formatCurrency } from '@/lib/decimal-utils'
import { generateG50PDF } from '@/lib/pdf-utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  FileSpreadsheet,
  Printer,
  Plus,
  Trash2,
  Calculator,
  RotateCcw,
  ArrowDownUp,
  TrendingUp,
  TrendingDown,
  Info,
  Receipt,
  FileText,
  Loader2,
  AlertCircle,
  Globe,
  CheckCircle2
} from 'lucide-react'

// ---- Types ----
interface TransactionRow {
  id: string
  type: 'SALE' | 'PURCHASE'
  date: string
  description: string
  ht_amount: string
  tva_rate: string
  category: string
  invoice_ref: string
}

interface DeclarationResult {
  collectee: string
  deductible: string
  previous_credit: string
  tls_amount: string
  net: string
  total_to_pay: string
  position: 'A PAYER' | 'CREDIT' | 'ZERO'
  sales_count: number
  purchases_count: number
  total_sales_ht: string
  total_purchases_ht: string
  period: { label: string }
  breakdown: Array<{
    id: string
    type: string
    date: string
    description: string
    ht_amount: string
    tva_rate: string
    gross_tva: string
    deductible_cap: string
    deductible_tva: string
    category: string
    invoice_ref: string
    articleRef: string
  }>
}

let nextId = 1
function createEmptyRow(): TransactionRow {
  return {
    id: `new-${nextId++}`,
    type: 'SALE',
    date: new Date().toISOString().slice(0, 10),
    description: '',
    ht_amount: '',
    tva_rate: '0.19',
    category: 'standard',
    invoice_ref: '',
  }
}

export function DeclarationTab() {
  const { t, locale } = useI18n()
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const { lastResult, setLastResult } = useAIStore()
  const [periodType, setPeriodType] = useState<'MONTHLY' | 'QUARTERLY'>('MONTHLY')
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [transactions, setTransactions] = useState<TransactionRow[]>([
    createEmptyRow(),
    createEmptyRow(),
  ])
  const [previousCredit, setPreviousCredit] = useState<string>('0')
  const [tlsRate, setTlsRate] = useState<string>('0.015')
  const [result, setResult] = useState<DeclarationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'add-scan' && lastResult) {
      const resultToProcess = lastResult
      // Use a microtask to avoid synchronous setState warning
      Promise.resolve().then(() => {
        setLastResult(null) // Consume immediately

        const newRow: TransactionRow = {
          id: `scan-${Date.now()}`,
          type: 'PURCHASE',
          date: resultToProcess.date,
          description: resultToProcess.vendorName,
          ht_amount: resultToProcess.baseHT,
          tva_rate: resultToProcess.tvaRate,
          category: (resultToProcess.category === 'Achat de Biens' || resultToProcess.category === 'Prestation de Services') ? 'standard' : 'standard',
          invoice_ref: 'EXTRACTED-IA',
        }
        
        setTransactions(prev => {
          // If all rows are empty, replace them. Otherwise append.
          const isEmpty = prev.every(r => !r.description && !r.ht_amount)
          if (isEmpty) return [newRow]
          return [...prev, newRow]
        })
        
        window.history.replaceState({}, '', window.location.pathname) // Clear query param
      })
    }
  }, [searchParams, lastResult, setLastResult])

  // ---- Transaction handlers ----
  const addRow = () => {
    setTransactions(prev => [...prev, createEmptyRow()])
  }

  const removeRow = (id: string) => {
    setTransactions(prev => {
      if (prev.length <= 1) return prev
      return prev.filter(r => r.id !== id)
    })
  }

  const updateRow = (id: string, field: keyof TransactionRow, value: string) => {
    setTransactions(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  // ---- Calculate ----
  const handleCalculate = useCallback(async () => {
    setIsCalculating(true)
    setError(null)
    setResult(null)

    try {
      const validTxs = transactions.filter(r => {
        const ht = parseFloat(r.ht_amount)
        return r.ht_amount && !isNaN(ht) && ht > 0
      })

      if (validTxs.length === 0) {
        setError(t('declaration.errorNoTransaction'))
        setIsCalculating(false)
        return
      }

      const payload = {
        transactions: validTxs.map(r => ({
          type: r.type,
          date: r.date,
          description: r.description,
          ht_amount: parseFloat(r.ht_amount),
          tva_rate: parseFloat(r.tva_rate),
          category: r.category,
          invoice_ref: r.invoice_ref,
        })),
        periodType,
        year,
        month,
        previousCredit: parseFloat(previousCredit) || 0,
        tlsRate: parseFloat(tlsRate) || 0,
      }

      const res = await fetch('/api/declaration/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const contentType = res.headers.get('content-type')
      if (!res.ok) {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await res.json()
          setError(errorData.error || 'Calculation error')
        } else {
          setError(`Server error (${res.status}). Please check system logs.`)
        }
        return
      }

      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Received non-JSON response from server')
      }

      const data = await res.json()

      setResult(data.data)
    } catch {
      setError(t('common.networkError'))
    } finally {
      setIsCalculating(false)
    }
  }, [transactions, periodType, year, month, locale])

  // ---- Export CSV ----
  const handleExportCsv = async () => {
    try {
      const validTxs = transactions.filter(r => r.ht_amount && parseFloat(r.ht_amount) > 0)
      const res = await fetch('/api/declaration/export/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions: validTxs.map(r => ({
            type: r.type,
            date: r.date,
            description: r.description,
            ht_amount: parseFloat(r.ht_amount),
            tva_rate: parseFloat(r.tva_rate),
            category: r.category,
            invoice_ref: r.invoice_ref,
          })),
          periodType,
          year,
          month,
        }),
      })
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `declaration-tva-${periodType.toLowerCase()}-${year}-${String(month).padStart(2, '0')}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('CSV export error:', err)
    }
  }

  const handleExportExcel = async () => {
    try {
      const validTxs = transactions.filter(r => r.ht_amount && parseFloat(r.ht_amount) > 0)
      const res = await fetch('/api/declaration/export/excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions: validTxs.map(r => ({
            type: r.type,
            date: r.date,
            description: r.description,
            ht_amount: parseFloat(r.ht_amount),
            tva_rate: parseFloat(r.tva_rate),
            category: r.category,
            invoice_ref: r.invoice_ref,
          })),
          periodType,
          year,
          month,
          summary: result ? {
            collectee: formatCurrency(result.collectee, locale),
            deductible: formatCurrency(result.deductible, locale),
            net: formatCurrency(result.net, locale),
            position: result.position
          } : null
        }),
      })
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `declaration-tva-${year}-${month}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Excel export error:', err)
    }
  }

  const handlePrintCa12 = () => {
    if (!result) return
    
    generateG50PDF({
      period: periodType === 'MONTHLY' ? monthNames[month - 1] : t(`declaration.q${Math.ceil(month / 3)}`),
      year,
      userName: user?.name || '',
      companyName: 'Ma Société', // Placeholder for demo
      nif: '0001234567890', // Placeholder for demo
      collectee: result.collectee,
      deductible: result.deductible,
      previous_credit: result.previous_credit,
      tls_amount: result.tls_amount,
      net: result.net,
      total_to_pay: result.total_to_pay,
      position: result.position,
      transactions: result.breakdown
    }, locale)
  }

  const handleReset = () => {
    setTransactions([createEmptyRow(), createEmptyRow()])
    setPreviousCredit('0')
    setResult(null)
    setError(null)
  }

  const monthNames = t('common.months').split(',')

  return (
    <div className="space-y-4">
      {/* Print-only header — CA12 style */}
      <div className="declaration-print-header hidden">
        <h1>{t('declaration.printHeader')}</h1>
        <p>{t('declaration.printSubheader')} {periodType === 'MONTHLY' ? monthNames[month - 1] : t(`declaration.q${Math.ceil(month / 3)}`)} {year}</p>
        <p>Date: {new Date().toLocaleDateString('fr-FR')} | Loi de Finances 2026 | Art. 33 CID</p>
      </div>

      {/* Header card */}
      <Card className="border-primary/10 glass-card bg-gradient-to-br from-primary/5 to-transparent no-print card-interactive animate-fade-in-up rounded-2xl shadow-sm overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Receipt className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold tracking-tight">{t('declaration.title')}</CardTitle>
              <p className="text-sm text-muted-foreground font-medium">{t('declaration.description')}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground bg-primary/5 border border-primary/10 rounded-xl p-3 shadow-inner">
            <Info className="h-4 w-4 text-primary shrink-0" />
            <span className="leading-relaxed">{t('declaration.legalTooltip')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Period selector */}
      <Card className="no-print glass-card rounded-2xl border-primary/10 animate-fade-in-up shadow-sm" style={{ animationDelay: '60ms' }}>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Period type */}
            <div className="space-y-2.5">
              <Label className="text-sm font-bold text-primary">{t('declaration.periodType')}</Label>
              <Select value={periodType} onValueChange={(v) => setPeriodType(v as 'MONTHLY' | 'QUARTERLY')}>
                <SelectTrigger className="h-11 rounded-xl border-primary/10 bg-background/50 focus:ring-primary/20 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card rounded-xl border-primary/10">
                  <SelectItem value="MONTHLY">{t('declaration.monthly')}</SelectItem>
                  <SelectItem value="QUARTERLY">{t('declaration.quarterly')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Year */}
            <div className="space-y-2.5">
              <Label className="text-sm font-bold text-primary">{t('declaration.year')}</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                min={2000}
                max={2100}
                className="h-11 rounded-xl border-primary/10 bg-background/50 focus:ring-primary/20 transition-all font-bold"
              />
            </div>

            {/* Month or Quarter */}
            {periodType === 'MONTHLY' ? (
              <div className="space-y-2.5">
                <Label className="text-sm font-bold text-primary">{t('declaration.month')}</Label>
                <Select value={String(month)} onValueChange={(v) => setMonth(parseInt(v))}>
                  <SelectTrigger className="h-11 rounded-xl border-primary/10 bg-background/50 focus:ring-primary/20 transition-all font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card rounded-xl border-primary/10">
                    {monthNames.map((name, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)} className="font-medium">{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2.5">
                <Label className="text-sm font-bold text-primary">{t('declaration.quarter')}</Label>
                <Select
                  value={String(Math.ceil(month / 3))}
                  onValueChange={(v) => setMonth((parseInt(v) - 1) * 3 + 1)}
                >
                  <SelectTrigger className="h-11 rounded-xl border-primary/10 bg-background/50 focus:ring-primary/20 transition-all font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card rounded-xl border-primary/10">
                    <SelectItem value="1" className="font-medium">{t('declaration.q1')}</SelectItem>
                    <SelectItem value="2" className="font-medium">{t('declaration.q2')}</SelectItem>
                    <SelectItem value="3" className="font-medium">{t('declaration.q3')}</SelectItem>
                    <SelectItem value="4" className="font-medium">{t('declaration.q4')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Previous Credit */}
            <div className="space-y-2.5">
              <Label className="text-sm font-bold text-primary flex items-center gap-1.5">
                <ArrowDownUp className="h-3.5 w-3.5" />
                {t('declaration.previousCredit')}
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  inputMode="decimal"
                  value={previousCredit}
                  onChange={(e) => setPreviousCredit(e.target.value)}
                  placeholder={t('declaration.previousCreditPlaceholder')}
                  className="h-11 rounded-xl border-primary/10 bg-background/50 focus:ring-primary/20 transition-all font-mono pl-4 pr-10"
                  min={0}
                  dir="ltr"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none">
                  {t('common.currency')}
                </div>
              </div>
            </div>

            {/* TLS Rate */}
            <div className="space-y-2.5">
              <Label className="text-sm font-bold text-primary flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                {t('declaration.tlsRate')}
              </Label>
              <Select value={tlsRate} onValueChange={setTlsRate}>
                <SelectTrigger className="h-11 rounded-xl border-primary/10 bg-background/50 focus:ring-primary/20 transition-all font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card rounded-xl border-primary/10">
                  <SelectItem value="0.03" className="font-medium">3% (Standard)</SelectItem>
                  <SelectItem value="0.015" className="font-medium">1.5% (Mining/Transport)</SelectItem>
                  <SelectItem value="0" className="font-medium">0% (Exempt)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction table */}
      <Card className="declaration-card no-print card-interactive animate-fade-in-up" style={{ animationDelay: '120ms' }}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowDownUp className="h-4 w-4 text-primary" />
              {t('declaration.transactions')}
              <Badge variant="secondary" className="text-xs ml-2">{transactions.length}</Badge>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={addRow} className="rounded-lg btn-press">
              <Plus className="h-3.5 w-3.5 me-1.5" />
              {t('declaration.addTransaction')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-10 text-xs font-semibold">#</TableHead>
                  <TableHead className="w-32 text-xs font-semibold">{t('declaration.type')}</TableHead>
                  <TableHead className="w-28 text-xs font-semibold">{t('declaration.date')}</TableHead>
                  <TableHead className="min-w-[130px] text-xs font-semibold">{t('declaration.description')}</TableHead>
                  <TableHead className="w-36 text-xs font-semibold">{t('declaration.htAmount')}</TableHead>
                  <TableHead className="w-32 text-xs font-semibold">{t('declaration.tvaRate')}</TableHead>
                  <TableHead className="w-40 text-xs font-semibold">{t('declaration.category')}</TableHead>
                  <TableHead className="w-28 text-xs font-semibold">{t('declaration.invoiceRef')}</TableHead>
                  <TableHead className="w-10 no-print"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((row, idx) => (
                  <TableRow key={row.id} className="table-row-hover animate-slide-in" style={{ animationDelay: `${idx * 30}ms` }}>
                    <TableCell className="text-xs text-muted-foreground font-mono font-medium">{idx + 1}</TableCell>
                    <TableCell>
                      <Select
                        value={row.type}
                        onValueChange={(v) => updateRow(row.id, 'type', v)}
                      >
                        <SelectTrigger className="h-9 text-xs rounded-md">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SALE">
                            <span className="flex items-center gap-1.5">
                              <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                              {t('declaration.sale')}
                            </span>
                          </SelectItem>
                          <SelectItem value="PURCHASE">
                            <span className="flex items-center gap-1.5">
                              <TrendingDown className="h-3.5 w-3.5 text-blue-600" />
                              {t('declaration.purchase')}
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="date"
                        value={row.date}
                        onChange={(e) => updateRow(row.id, 'date', e.target.value)}
                        className="h-9 text-xs rounded-md"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={row.description}
                        onChange={(e) => updateRow(row.id, 'description', e.target.value)}
                        placeholder={t('declaration.descriptionPlaceholder')}
                        className="h-9 text-xs rounded-md"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        inputMode="decimal"
                        value={row.ht_amount}
                        onChange={(e) => updateRow(row.id, 'ht_amount', e.target.value)}
                        placeholder={t('declaration.htAmountPlaceholder')}
                        className="h-9 text-xs font-mono rounded-md"
                        min={0}
                        dir="ltr"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={row.tva_rate}
                        onValueChange={(v) => updateRow(row.id, 'tva_rate', v)}
                      >
                        <SelectTrigger className="h-9 text-xs rounded-md">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.19">{t('declaration.rate19')}</SelectItem>
                          <SelectItem value="0.09">{t('declaration.rate9')}</SelectItem>
                          <SelectItem value="0.00">{t('declaration.rate0')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {row.type === 'PURCHASE' ? (
                        <Select
                          value={row.category}
                          onValueChange={(v) => updateRow(row.id, 'category', v)}
                        >
                          <SelectTrigger className="h-9 text-xs rounded-md">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">{t('declaration.catStandard')}</SelectItem>
                            <SelectItem value="vehicle">{t('declaration.catVehicle')}</SelectItem>
                            <SelectItem value="hospitality">{t('declaration.catHospitality')}</SelectItem>
                            <SelectItem value="real_estate">{t('declaration.catRealEstate')}</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-xs text-muted-foreground/60 px-2">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        value={row.invoice_ref}
                        onChange={(e) => updateRow(row.id, 'invoice_ref', e.target.value)}
                        placeholder={t('declaration.invoiceRefPlaceholder')}
                        className="h-9 text-xs rounded-md"
                      />
                    </TableCell>
                    <TableCell className="no-print">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 text-muted-foreground/60 hover:text-destructive rounded-md transition-colors duration-150"
                        onClick={() => removeRow(row.id)}
                        disabled={transactions.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 no-print animate-fade-in-up" style={{ animationDelay: '180ms' }}>
        <input
          type="file"
          id="receipt-upload"
          className="hidden"
          accept="image/*,.pdf"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              // Trigger AI scan logic (simulated or real)
              console.log('Scanning file:', file.name)
            }
          }}
        />
        <Button
          variant="outline"
          className="h-11 px-6 rounded-xl text-sm font-semibold border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all btn-press"
          onClick={() => document.getElementById('receipt-upload')?.click()}
        >
          <Receipt className="h-4 w-4 me-2" />
          {t('ai.scan')}
        </Button>

        <Button
          onClick={handleCalculate}
          disabled={isCalculating}
          className="h-11 px-6 rounded-xl text-sm font-semibold btn-press"
        >
          {isCalculating ? (
            <Loader2 className="h-4 w-4 animate-spin me-2" />
          ) : (
            <Calculator className="h-4 w-4 me-2" />
          )}
          {t('declaration.calculateNet')}
        </Button>

        {result && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-11 rounded-xl text-sm btn-press">
                <FileSpreadsheet className="h-4 w-4 me-2" />
                {t('declaration.export')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportExcel}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                {t('declaration.exportExcel') || 'Excel (.xlsx)'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCsv}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                {t('declaration.exportCsv')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrintCa12}>
                <FileText className="mr-2 h-4 w-4" />
                {t('declaration.exportCa12')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button variant="ghost" onClick={handleReset} className="h-11 rounded-xl text-sm btn-press">
          <RotateCcw className="h-4 w-4 me-2" />
          {t('declaration.reset')}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3.5 no-print animate-fade-in-up flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Result summary */}
      {result && (
        <div className="space-y-4 animate-fade-in-up">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 declaration-summary animate-stagger">
            {/* TVA Collectée */}
            <Card className="border-green-200 bg-green-50/60 dark:bg-green-950/10 summary-card rounded-xl">
              <CardContent className="p-4">
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t('declaration.collectee')}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-green-600 font-mono tracking-tighter">
                      {formatCurrency(result.collectee, locale)}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground ml-1">{t('common.currency')}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {result.sales_count} {locale === 'ar' ? 'عملية' : 'vente(s)'} — HT: <span dir="ltr">{formatCurrency(result.total_sales_ht, locale)}</span>
                </p>
              </CardContent>
            </Card>

            {/* TVA Déductible */}
            <Card className="border-blue-200 bg-blue-50/60 dark:bg-blue-950/10 summary-card rounded-xl">
              <CardContent className="p-4">
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t('declaration.deductible')}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-blue-600 font-mono tracking-tighter">
                      {formatCurrency(result.deductible, locale)}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground ml-1">{t('common.currency')}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {result.purchases_count} {locale === 'ar' ? 'عملية' : 'achat(s)'} — HT: <span dir="ltr">{formatCurrency(result.total_purchases_ht, locale)}</span>
                </p>
              </CardContent>
            </Card>

            {/* Net Position */}
            <Card className={
              result.position === 'A PAYER'
                ? 'border-red-200 bg-red-50/60 dark:bg-red-950/10'
                : result.position === 'CREDIT'
                  ? 'border-amber-200 bg-amber-50/60 dark:bg-amber-950/10'
                  : 'border-gray-200 bg-gray-50/60 dark:bg-gray-950/10'
            }>
              <CardContent className="p-4 summary-card rounded-xl">
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground">{t('declaration.netPosition')}</p>
                  {parseFloat(result.previous_credit) > 0 && (
                    <div className="text-[10px] font-bold text-muted-foreground/60 flex items-center gap-1 mt-0.5">
                      -{formatCurrency(result.previous_credit, locale)} {t('common.currency')} (Credit)
                    </div>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={cn(
                    "text-2xl font-black font-mono tracking-tighter",
                    result.position === 'A PAYER' ? "text-primary" : 
                    result.position === 'CREDIT' ? "text-blue-600" : "text-muted-foreground"
                  )}>
                    {formatCurrency(result.net, locale)}
                  </span>
                  <span className="text-xs font-normal text-muted-foreground ml-1">{t('common.currency')}</span>
                </div>
                <div className="flex flex-col gap-1.5 mt-2">
                  <Badge variant={result.position === 'A PAYER' ? "default" : "secondary"} className="rounded-md font-bold uppercase tracking-wider text-[10px] py-0 h-5">
                    {result.position === 'A PAYER' ? t('declaration.toPay') :
                    result.position === 'CREDIT' ? t('declaration.credit') :
                    t('declaration.zero')}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Final Global Total */}
          {result.position === 'A PAYER' && (
            <Card className="border-primary/20 bg-primary/5 rounded-xl shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-primary">{t('declaration.totalToPay')}</h3>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-black text-primary font-mono tracking-tighter">
                        {formatCurrency(result.total_to_pay, locale)}
                      </span>
                      <span className="text-sm font-bold ml-1">{t('common.currency')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed breakdown */}
          <Card className="declaration-card card-interactive rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" />
                <p className="text-[10px] font-medium leading-relaxed opacity-80">
                  {t('declaration.deductibleDetail')}
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40 border-b-2">
                      <TableHead className="w-20 text-xs font-semibold">{t('declaration.type')}</TableHead>
                      <TableHead className="w-24 text-xs font-semibold">{t('declaration.date')}</TableHead>
                      <TableHead className="text-xs font-semibold">{t('declaration.description')}</TableHead>
                      <TableHead className="text-right w-28 text-xs font-semibold">{t('declaration.htAmount')}</TableHead>
                      <TableHead className="text-center w-20 text-xs font-semibold">{t('declaration.tvaRate')}</TableHead>
                      <TableHead className="text-right w-28 text-xs font-semibold">{t('declaration.grossTVA')}</TableHead>
                      {locale !== 'ar' && (
                        <>
                          <TableHead className="text-center w-20 text-xs font-semibold">{t('declaration.capPercent')}</TableHead>
                          <TableHead className="text-right w-28 text-xs font-semibold">{t('declaration.deductibleTVA')}</TableHead>
                        </>
                      )}
                      <TableHead className="w-28 text-xs font-semibold">{t('declaration.category')}</TableHead>
                      <TableHead className="text-xs font-semibold">{t('result.article')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.breakdown.map((b) => (
                      <TableRow key={b.id} className="table-row-hover">
                        <TableCell className="font-bold text-[10px]">
                          {b.type === 'SALE' ? t('declaration.sale').split(' ')[0] : t('declaration.purchase').split(' ')[0]}
                        </TableCell>
                        <TableCell className="text-xs" dir="ltr">{b.date}</TableCell>
                        <TableCell className="text-xs">{b.description || '—'}</TableCell>
                        <TableCell className="font-mono text-xs text-right" dir="ltr">{formatCurrency(b.ht_amount, locale)}</TableCell>
                        <TableCell className="font-mono text-xs text-center" dir="ltr">
                          {(parseFloat(b.tva_rate) * 100).toFixed(0)}%
                        </TableCell>
                        <TableCell className="font-mono text-xs text-right font-medium" dir="ltr">{formatCurrency(b.gross_tva, locale)}</TableCell>
                        {result.breakdown.some(b2 => b2.type === 'PURCHASE') && (
                          <>
                            <TableCell className="font-mono text-xs text-center" dir="ltr">
                              {b.type === 'PURCHASE' ? (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md ${
                                        parseFloat(b.deductible_cap) < 1
                                          ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 font-semibold'
                                          : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                      }`}>
                                        {(parseFloat(b.deductible_cap) * 100).toFixed(0)}%
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent className="text-xs max-w-[220px]">
                                      <p className="font-medium">{b.articleRef}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : (
                                <span className="text-muted-foreground/40">—</span>
                              )}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-right" dir="ltr">
                              {b.type === 'PURCHASE' ? (
                                <span className={parseFloat(b.deductible_tva) < parseFloat(b.gross_tva) ? 'text-orange-600 font-semibold' : 'text-green-700 font-medium'}>
                                  {formatCurrency(b.deductible_tva, locale)}
                                </span>
                              ) : (
                                <span className="text-muted-foreground/40">—</span>
                              )}
                            </TableCell>
                          </>
                        )}
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] rounded-md">{b.category}</Badge>
                        </TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{b.articleRef}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Separator className="my-4" />

              {/* Totals row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-stagger">
                <div className="bg-green-50 dark:bg-green-950/10 rounded-lg p-2.5 border border-green-200/50">
                  <p className="text-muted-foreground font-medium">{t('declaration.collectee')}</p>
                  <p className="font-mono font-bold text-green-700 dark:text-green-400" dir="ltr">
                    {formatCurrency(result.collectee, locale)} {t('common.currency')}
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/10 rounded-lg p-2.5 border border-blue-200/50">
                  <p className="text-muted-foreground font-medium">{t('declaration.deductible')}</p>
                  <p className="font-mono font-bold text-blue-700 dark:text-blue-400" dir="ltr">
                    {formatCurrency(result.deductible, locale)} {t('common.currency')}
                  </p>
                </div>
                <div className={cn(
                  "rounded-lg p-2.5 border",
                  result.position === 'A PAYER'
                    ? 'bg-red-50 dark:bg-red-950/10 border-red-200/50'
                    : result.position === 'CREDIT'
                      ? 'bg-amber-50 dark:bg-amber-950/10 border-amber-200/50'
                      : 'bg-gray-50 dark:bg-gray-950/10 border-gray-200/50'
                )}>
                  <p className="text-muted-foreground font-medium">{t('declaration.netPosition')}</p>
                  <p className={cn(
                    "font-mono font-bold",
                    result.position === 'A PAYER' ? 'text-red-700 dark:text-red-400' :
                    result.position === 'CREDIT' ? 'text-amber-700 dark:text-amber-400' :
                    'text-gray-700'
                  )} dir="ltr">
                    {formatCurrency(result.net, locale)} {t('common.currency')}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2.5 border border-border/50">
                  <p className="text-muted-foreground font-medium">{t('declaration.art33Note')}</p>
                  <p className="font-mono text-xs mt-0.5">
                    {result.sales_count}{t('declaration.salesAbbr') || 'V'} + {result.purchases_count}{t('declaration.purchasesAbbr') || 'A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Print-only footer */}
          <div className="declaration-print-footer hidden">
            <p>{t('declaration.printTitle') || 'DECLARATION TVA — ALGERIE'} | {t('dashboard.period')}: {result.period.label} | {t('wizard.summary.generated') || 'Généré le'} {new Date().toLocaleString(locale)}</p>
            <p>{t('app.subtitle') || 'Version des règles: 2026'} — Art. 33 du CID</p>
            <p className="italic">{t('legal.disclaimer')}</p>
          </div>
        </div>
      )}
    </div>
  )
}
