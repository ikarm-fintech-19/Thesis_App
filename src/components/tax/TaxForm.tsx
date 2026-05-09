'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n-context'
import { TVACategory } from '@/lib/engines/tva'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Calculator, Loader2 } from 'lucide-react'

interface TaxFormProps {
  mode: 'simple' | 'expert'
  onCalculate: (params: {
    base: string
    category: TVACategory
    sector: string
    invoiceRef?: string
    invoiceDate?: string
  }) => void
  isCalculating?: boolean
}

export function TaxForm({ mode, onCalculate, isCalculating }: TaxFormProps) {
  const { t } = useI18n()
  const [base, setBase] = useState('')
  const [category, setCategory] = useState<TVACategory>('normal')
  const [sector, setSector] = useState('production')
  const [invoiceRef, setInvoiceRef] = useState('')
  const [invoiceDate, setInvoiceDate] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!base.trim()) return
    onCalculate({
      base: base.replace(/\s/g, '').replace(/,/g, '.'),
      category,
      sector,
      ...(mode === 'expert' ? { invoiceRef, invoiceDate } : {})
    })
  }

  return (
    <Card className="border-primary/10 glass-card bg-gradient-to-br from-primary/5 to-transparent no-print card-interactive animate-fade-in-up rounded-2xl shadow-sm overflow-hidden">
      <CardContent className="p-4 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Gross Amount */}
          <div className="space-y-3">
            <Label htmlFor="grossAmount" className="text-sm font-bold text-primary">
              {t('form.grossAmount')}
            </Label>
            <div className="relative group">
              <Input
                id="grossAmount"
                type="text"
                inputMode="decimal"
                placeholder={t('form.grossAmountPlaceholder')}
                value={base}
                onChange={(e) => setBase(e.target.value)}
                className="h-14 text-2xl font-bold pl-4 pr-16 rounded-2xl border-primary/10 bg-background/50 focus:ring-primary/20 transition-all shadow-inner"
                dir="ltr"
                required
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary/5 rounded-lg border border-primary/10">
                <span className="text-sm font-bold text-primary">
                  {t('common.currency')}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div className="space-y-3">
              <Label htmlFor="category" className="text-sm font-bold text-primary">
                {t('form.category')}
              </Label>
              <Select value={category} onValueChange={(v) => setCategory(v as TVACategory)}>
                <SelectTrigger id="category" className="h-12 w-full rounded-xl border-primary/10 bg-background/50 focus:ring-primary/20 transition-all font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card rounded-xl border-primary/10">
                  <SelectItem value="normal" className="focus:bg-primary/5">
                    <span className="flex items-center gap-3">
                      <span className="inline-block w-3 h-3 rounded-full bg-red-500 shadow-sm" />
                      {t('form.categoryNormal')}
                    </span>
                  </SelectItem>
                  <SelectItem value="reduced" className="focus:bg-primary/5">
                    <span className="flex items-center gap-3">
                      <span className="inline-block w-3 h-3 rounded-full bg-amber-500 shadow-sm" />
                      {t('form.categoryReduced')}
                    </span>
                  </SelectItem>
                  <SelectItem value="exempt" className="focus:bg-primary/5">
                    <span className="flex items-center gap-3">
                      <span className="inline-block w-3 h-3 rounded-full bg-green-500 shadow-sm" />
                      {t('form.categoryExempt')}
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sector (always visible) */}
            <div className="space-y-3">
              <Label htmlFor="sector" className="text-sm font-bold text-primary">
                {t('form.sector')}
              </Label>
              <Select value={sector} onValueChange={setSector}>
                <SelectTrigger id="sector" className="h-12 w-full rounded-xl border-primary/10 bg-background/50 focus:ring-primary/20 transition-all font-semibold">
                  <SelectValue placeholder={t('form.sectorPlaceholder')} />
                </SelectTrigger>
                <SelectContent className="glass-card rounded-xl border-primary/10">
                  <SelectItem value="production" className="focus:bg-primary/5">{t('form.sectorProduction')}</SelectItem>
                  <SelectItem value="commerce" className="focus:bg-primary/5">{t('form.sectorCommerce')}</SelectItem>
                  <SelectItem value="services" className="focus:bg-primary/5">{t('form.sectorServices')}</SelectItem>
                  <SelectItem value="import" className="focus:bg-primary/5">{t('form.sectorImport')}</SelectItem>
                  <SelectItem value="export" className="focus:bg-primary/5">{t('form.sectorExport')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Expert-only fields */}
          {mode === 'expert' && (
            <div className="space-y-6 rounded-2xl bg-primary/[0.02] p-6 border border-primary/10 transition-all duration-300 animate-fade-in-up shadow-inner">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  {t('modes.expert')} — {t('legal.cid')}
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="regime" className="text-sm font-bold text-primary">
                  {t('form.regime')}
                </Label>
                <Select defaultValue="real">
                  <SelectTrigger id="regime" className="h-11 w-full rounded-xl border-primary/10 bg-background/50 focus:ring-primary/20 transition-all font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card rounded-xl border-primary/10">
                    <SelectItem value="real">{t('form.regimeReal')}</SelectItem>
                    <SelectItem value="simplified">{t('form.regimeSimplified')}</SelectItem>
                    <SelectItem value="forfait">{t('form.regimeForfait')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="invoiceRef" className="text-sm font-bold text-primary">
                    {t('form.invoiceRef')}
                  </Label>
                  <Input
                    id="invoiceRef"
                    placeholder={t('form.invoiceRefPlaceholder')}
                    value={invoiceRef}
                    onChange={(e) => setInvoiceRef(e.target.value)}
                    className="h-11 rounded-xl border-primary/10 bg-background/50 focus:ring-primary/20 transition-all font-medium"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="invoiceDate" className="text-sm font-bold text-primary">
                    {t('form.invoiceDate')}
                  </Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="h-11 rounded-xl border-primary/10 bg-background/50 focus:ring-primary/20 transition-all font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-14 text-lg font-bold rounded-2xl btn-press shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 group"
            disabled={!base.trim() || isCalculating}
          >
            {isCalculating ? (
              <Loader2 className="h-5 w-5 animate-spin me-3" />
            ) : (
              <Calculator className="h-5 w-5 me-3 group-hover:scale-110 transition-transform" />
            )}
            {isCalculating ? t('form.calculating') : t('form.calculate')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
