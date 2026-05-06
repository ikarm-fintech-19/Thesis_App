'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ChevronLeft, ChevronRight, Save, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react'
import PeriodStep from './PeriodStep'
import SalesStep from './SalesStep'
import PurchasesStep from './PurchasesStep'
import SalariesStep from './SalariesStep'
import SummaryStep from './SummaryStep'
import PenaltyWarningBanner from './PenaltyWarningBanner'

export interface G50WizardData {
  period: { month: number; year: number; type: 'monthly' | 'quarterly' }
  sales: Array<{ date: string; description: string; ht_amount: string; tva_rate: string; invoice_ref: string }>
  purchases: Array<{ date: string; description: string; ht_amount: string; tva_rate: string; category: string; invoice_ref: string }>
  salaries: Array<{ employeeName: string; grossSalary: string; familyChildren: number }>
  tlsRate: string
  previousCredit: string
  result?: any
}

const STORAGE_KEY = 'g50_wizard_draft'

const initialData: G50WizardData = {
  period: { month: new Date().getMonth() + 1, year: new Date().getFullYear(), type: 'monthly' },
  sales: [],
  purchases: [],
  salaries: [],
  tlsRate: '0.015',
  previousCredit: '0'
}

export default function G50Wizard() {
  const { t } = useI18n()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<G50WizardData>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return initialData
        }
      }
    }
    return initialData
  })
  const [penalties, setPenalties] = useState<Array<{ type: string; message: string; severity: 'warning' | 'error' }>>([])

  const [isHydrating, setIsHydrating] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Fetch from backend on mount
  useEffect(() => {
    const fetchDraft = async () => {
      try {
        const res = await fetch('/api/declaration/draft')
        if (res.ok) {
          const json = await res.json()
          if (json.data) {
            setData(json.data)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(json.data))
          }
        }
      } catch (err) {
        console.error('Failed to fetch draft:', err)
      } finally {
        setIsHydrating(false)
      }
    }
    fetchDraft()
  }, [])

  // Debounced auto-save
  useEffect(() => {
    if (isHydrating) return

    const handler = setTimeout(async () => {
      setIsSaving(true)
      try {
        const res = await fetch('/api/declaration/draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        if (res.ok) {
          setLastSaved(new Date())
        }
      } catch (err) {
        console.error('Failed to auto-save draft:', err)
      } finally {
        setIsSaving(false)
      }
    }, 2000)

    return () => clearTimeout(handler)
  }, [data, isHydrating])

  const steps = [
    { key: 'period', label: t('wizard.steps.period'), component: PeriodStep },
    { key: 'sales', label: t('wizard.steps.sales'), component: SalesStep },
    { key: 'purchases', label: t('wizard.steps.purchases'), component: PurchasesStep },
    { key: 'salaries', label: t('wizard.steps.salaries'), component: SalariesStep },
    { key: 'summary', label: t('wizard.steps.summary'), component: SummaryStep }
  ]

  const CurrentStepComponent = steps[currentStep].component

  const updateData = useCallback((updates: Partial<G50WizardData>) => {
    setData(prev => {
      const newData = { ...prev, ...updates }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
      return newData
    })
  }, [])

  const goNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const resetDraft = () => {
    localStorage.removeItem(STORAGE_KEY)
    setData(initialData)
    setCurrentStep(0)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/declaration/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, result: data.result })
      })
      if (res.ok) {
        localStorage.removeItem(STORAGE_KEY)
        router.push('/dashboard')
      } else {
        console.error('Submit failed')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('wizard.title')}</h1>
          <p className="text-muted-foreground">{t('wizard.subtitle')}</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-xs text-muted-foreground flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
            {isSaving ? (
              <>{t('wizard.saving')}</>
            ) : lastSaved ? (
              <><Save className="h-3 w-3" /> {t('wizard.savedAt', { time: lastSaved.toLocaleTimeString() })}</>
            ) : <span className="opacity-0">Placeholder</span>}
          </div>
          <Button variant="outline" size="sm" onClick={resetDraft} className="shrink-0">
            <RotateCcw className="h-4 w-4 me-2" />
            {t('wizard.reset')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="space-y-1">
            <CardTitle className="text-xl">{steps[currentStep].label}</CardTitle>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t('wizard.stepOf', { current: currentStep + 1, total: steps.length })}
              </span>
              <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
          <Progress value={progress} className="h-1.5 mt-3" />
        </CardHeader>
        <CardContent className="space-y-4">
          <PenaltyWarningBanner penalties={penalties} />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CurrentStepComponent
                data={data}
                updateData={updateData}
                onPenaltiesChange={setPenalties}
              />
            </motion.div>
          </AnimatePresence>

          <Separator className="my-4" />

          <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 mt-6">
            <Button
              variant="outline"
              onClick={goBack}
              disabled={currentStep === 0}
              className="w-full sm:w-auto"
            >
              <ChevronLeft className="h-4 w-4 me-2" />
              {t('wizard.back')}
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
                <CheckCircle2 className="h-4 w-4 me-2" />
                {isSubmitting ? '...' : t('wizard.submit')}
              </Button>
            ) : (
              <Button onClick={goNext} className="w-full sm:w-auto">
                {t('wizard.next')}
                <ChevronRight className="h-4 w-4 ms-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-2">
        {steps.map((step, idx) => (
          <div
            key={step.key}
            className={`h-2 rounded-full transition-colors ${
              idx <= currentStep ? 'bg-primary' : 'bg-muted'
            }`}
            style={{ width: idx === currentStep ? '24px' : '8px' }}
          />
        ))}
      </div>
    </div>
  )
}