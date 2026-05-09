'use client'

import { useState, useCallback, useEffect } from 'react'
import { I18nProvider, useI18n } from '@/lib/i18n-context'
import { TVACalculationResult, TVACategory } from '@/lib/engines/tva'
import { LocaleSwitcher } from '@/components/tax/LocaleSwitcher'
import { ModeToggle, UIMode } from '@/components/tax/ModeToggle'
import { TaxForm } from '@/components/tax/TaxForm'
import { TaxResult } from '@/components/tax/TaxResult'
import { ThesisPanel } from '@/components/tax/ThesisPanel'
import { DeclarationTab } from '@/components/tax/DeclarationTab'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Landmark, Scale, AlertCircle, Calculator, FileText, CheckCircle2 } from 'lucide-react'



function AppContent() {
  const { t, locale, dir, isRTL } = useI18n()
  const [activeTab, setActiveTab] = useState<string>('calculator')
  const [mode, setMode] = useState<UIMode>('simple')
  const [result, setResult] = useState<TVACalculationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [dbRule, setDbRule] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [tabKey, setTabKey] = useState(0) // for re-triggering animation

  // Load raw tax rule for thesis mode on mount
  useEffect(() => {
    const loadDbRule = async () => {
      try {
        const res = await fetch('/api/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base: '1', category: 'normal', sector: 'production', getRule: true })
        })
        
        if (res.ok) {
          const contentType = res.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const data = await res.json()
            if (data.success && data.rule) {
              setDbRule(data.rule)
            }
          }
        }
      } catch {
        // Thesis will use fallback rules
      }
    }
    loadDbRule()
  }, [])

  const handleCalculate = useCallback(async (params: {
    base: string
    category: TVACategory
    sector: string
    invoiceRef?: string
    invoiceDate?: string
  }) => {
    setIsCalculating(true)
    setError(null)

    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base: params.base,
          category: params.category,
          sector: params.sector
        })
      })

      const contentType = res.headers.get('content-type')
      if (!res.ok) {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await res.json()
          setError(errorData.error || 'Calculation error')
        } else {
          setError(`Server error (${res.status}). Fallback to local engine.`)
          throw new Error('Non-JSON response')
        }
        setResult(null)
        return
      }

      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Received non-JSON response from server')
      }

      const data = await res.json()

      // Convert string results back to proper objects for display
      const Decimal = (await import('decimal.js')).default
      setResult({
        base: new Decimal(data.data.base),
        rate: new Decimal(data.data.rate),
        taxAmount: new Decimal(data.data.taxAmount),
        totalTTC: new Decimal(data.data.totalTTC),
        category: data.data.category,
        exempt: data.data.exempt,
        exemptReason: data.data.exemptReason,
        article: data.data.article,
        breakdown: data.data.breakdown.map((s: any) => ({
          label: s.label,
          base: new Decimal(s.base),
          rate: new Decimal(s.rate),
          amount: new Decimal(s.amount),
          article: s.article,
          notes: s.notes
        })),
        notes: data.data.notes,
        metadata: data.data.metadata
      })
    } catch {
      setError('Network error. Using fallback calculation.')
      // Fallback: calculate client-side
      const { calculateSingleTVA } = await import('@/lib/engines/tva')
      const fallbackResult = calculateSingleTVA({
        base: params.base,
        category: params.category,
        sector: params.sector
      })
      setResult(fallbackResult)
    } finally {
      setIsCalculating(false)
    }
  }, [])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setTabKey(prev => prev + 1) // re-trigger animation
  }

  return (
    <div className="flex flex-col bg-background relative overflow-hidden" dir={dir}>
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent -z-10" />
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] -z-10 animate-pulse" />
      <div className="absolute bottom-[10%] left-[-5%] w-[30%] h-[30%] bg-accent/5 rounded-full blur-[80px] -z-10" />


      
      {/* Main content */}
      <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
        {/* Hero Section (Small) */}
        <div className="text-center space-y-2 sm:space-y-3 py-4 animate-fade-in-up px-2 sm:px-0">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-primary tracking-tight leading-tight">{t('app.title')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-xs sm:text-base font-medium">
            {t('app.subtitle')}
          </p>
        </div>

        {/* Legal banner */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 no-print animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <Alert className="border-primary/20 bg-primary/5 flex-grow glass-card rounded-xl p-3 sm:p-4">
            <Scale className="h-4 w-4 text-primary" />
            <AlertDescription className="text-xs sm:text-sm font-medium">
              {t('legal.disclaimer')}
            </AlertDescription>
          </Alert>
          <div className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-emerald-100/80 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-[10px] sm:text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shadow-sm shadow-emerald-200/50">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="truncate">{locale === 'ar' ? 'محدث: مايو 2026' : 'Mis à jour: Mai 2026'}</span>
          </div>
        </div>

        {/* Main Tabs: Calculator / Declaration */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="flex justify-center mb-6 sm:mb-8 no-print animate-fade-in-up px-2 sm:px-0" style={{ animationDelay: '200ms' }}>
            <TabsList className="grid w-full max-w-md grid-cols-2 h-12 rounded-2xl bg-muted/40 p-1 sm:p-1.5 glass-card shadow-md">
              <TabsTrigger
                value="calculator"
                className="flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl text-xs sm:text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Calculator className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="truncate">{t('tabs.calculator')}</span>
              </TabsTrigger>
              <TabsTrigger
                value="declaration"
                className="flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl text-xs sm:text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300"
              >
                <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="truncate">{t('tabs.declaration')}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Calculator Tab */}
          <TabsContent value="calculator" className="space-y-8 mt-0 tab-content-enter focus-visible:outline-none" key={`calc-${tabKey}`}>
            {/* Mode toggle */}
            <div className="flex justify-center no-print animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <ModeToggle mode={mode} onModeChange={setMode} />
            </div>

            {/* Simple & Expert modes */}
            {(mode === 'simple' || mode === 'expert') && (
              <div className={`grid gap-8 ${mode === 'simple' ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-1 lg:grid-cols-2'}`}>
                <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                  <TaxForm
                    mode={mode}
                    onCalculate={handleCalculate}
                    isCalculating={isCalculating}
                  />
                </div>
                <div className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                  {error && (
                    <div className="flex items-center gap-2 text-sm text-destructive mb-4 px-4 py-3 bg-destructive/5 border border-destructive/20 rounded-xl animate-shake">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  )}
                  <TaxResult result={result} mode={mode} />
                </div>
              </div>
            )}

            {/* Thesis mode */}
            {mode === 'thesis' && (
              <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <ThesisPanel dbRule={dbRule} />
              </div>
            )}

            {/* Law references */}
            <div className="pt-8">
              <Separator className="bg-primary/5" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 no-print animate-stagger">
                <div className="rounded-2xl border bg-card/50 p-4 space-y-2 glass-card card-interactive">
                  <p className="text-xs font-bold text-primary">{t('legal.art28')}</p>
                  <p className="text-sm font-medium text-muted-foreground">{t('common.currency')} — 19%</p>
                </div>
                <div className="rounded-2xl border bg-card/50 p-4 space-y-2 glass-card card-interactive">
                  <p className="text-xs font-bold text-primary">{t('legal.art29')}</p>
                  <p className="text-sm font-medium text-muted-foreground">{t('common.currency')} — 9%</p>
                </div>
                <div className="rounded-2xl border bg-card/50 p-4 space-y-2 glass-card card-interactive">
                  <p className="text-xs font-bold text-primary">{t('legal.art30')}</p>
                  <p className="text-sm font-medium text-muted-foreground">0% — {locale === 'ar' ? 'إعفاءات' : 'Exempt'}</p>
                </div>
                <div className="rounded-2xl border bg-card/50 p-4 space-y-2 glass-card card-interactive">
                  <p className="text-xs font-bold text-primary">{t('legal.art33')}</p>
                  <p className="text-sm font-medium text-muted-foreground">{locale === 'ar' ? 'سقوف الخصم' : 'Deductibility caps'}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Declaration Tab */}
          <TabsContent value="declaration" className="mt-0 tab-content-enter focus-visible:outline-none" key={`decl-${tabKey}`}>
            <DeclarationTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function Home() {
  return <AppContent />
}
