'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import ProfileStep from './ProfileStep'
import ProfitStep from './ProfitStep'
import TaxSummaryStep from './TaxSummaryStep'
import { IBSSector } from '@/lib/ibs-engine'

export interface AnnualTaxData {
  entityType: 'morale' | 'physique' // morale = IBS, physique = IRG
  sector: IBSSector
  year: number
  estimatedRevenue: string
  estimatedExpenses: string
  estimatedSalaries: string
  customProfit: string | null
}

const STORAGE_KEY = 'annual_tax_draft'

const initialData: AnnualTaxData = {
  entityType: 'physique',
  sector: 'services_commerce',
  year: new Date().getFullYear() - 1, // Usually declaring for previous year
  estimatedRevenue: '0',
  estimatedExpenses: '0',
  estimatedSalaries: '0',
  customProfit: null,
}

export default function AnnualTaxWizard() {
  const { t } = useI18n()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<AnnualTaxData>(() => {
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

  const [isSubmitting, setIsSubmitting] = useState(false)

  const steps = [
    { key: 'profile', label: t('annualTax.steps.profile') || 'Profil de l\'entreprise', component: ProfileStep },
    { key: 'profit', label: t('annualTax.steps.profit') || 'Calcul du Bénéfice', component: ProfitStep },
    { key: 'summary', label: t('annualTax.steps.summary') || 'Bilan & Impôts (IBS/IRG)', component: TaxSummaryStep }
  ]

  const CurrentStepComponent = steps[currentStep].component

  const updateData = useCallback((updates: Partial<AnnualTaxData>) => {
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
    // In a real app, send to an API endpoint here
    setTimeout(() => {
      localStorage.removeItem(STORAGE_KEY)
      setIsSubmitting(false)
      router.push('/dashboard')
    }, 1000)
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('annualTax.title') || 'Bilan Annuel (IBS / IRG)'}</h1>
          <p className="text-muted-foreground">{t('annualTax.subtitle') || 'Calculez automatiquement vos impôts annuels basés sur vos déclarations G50'}</p>
        </div>
      </div>

      <Card className="border-primary/10 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <CardTitle>{t('annualTax.stepOf', { current: currentStep + 1, total: steps.length }) || `Étape ${currentStep + 1} sur ${steps.length}`}</CardTitle>
            <span className="text-sm font-medium">{steps[currentStep].label}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <CurrentStepComponent data={data} updateData={updateData} />

          <Separator className="my-6" />

          <div className="flex justify-between">
            <Button variant="outline" onClick={goBack} disabled={currentStep === 0}>
              <ChevronLeft className="h-4 w-4 me-2" />
              {t('annualTax.back') || 'Retour'}
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                <CheckCircle2 className="h-4 w-4 me-2" />
                {isSubmitting ? t('annualTax.validating') || 'Validation...' : t('annualTax.validate') || 'Valider le Bilan'}
              </Button>
            ) : (
              <Button onClick={goNext}>
                {t('annualTax.next') || 'Suivant'}
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
