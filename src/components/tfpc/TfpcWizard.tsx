'use client'

import React, { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  GraduationCap, 
  ChevronRight, 
  ChevronLeft, 
  Calculator, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Printer,
  Download
} from 'lucide-react'
import { calculateTfpc, TfpcResult } from '@/lib/tfpc-engine'
import { cn } from '@/lib/utils'

export default function TfpcWizard() {
  const { t } = useI18n()
  const [step, setStep] = useState(1)
  const totalSteps = 3

  const [data, setData] = useState({
    period: {
      year: new Date().getFullYear(),
      semester: 1 // 1 for S1, 2 for S2
    },
    massSalariale: '',
    fraisFormation: '0',
    fraisApprentissage: '0'
  })

  const [result, setResult] = useState<TfpcResult | null>(null)

  useEffect(() => {
    if (data.massSalariale) {
      const res = calculateTfpc({
        masseSalariale: data.massSalariale || 0,
        fraisFormation: data.fraisFormation || 0,
        fraisApprentissage: data.fraisApprentissage || 0
      })
      setResult(res)
    } else {
      setResult(null)
    }
  }, [data])

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('tfpc.title')}</h1>
        <p className="text-muted-foreground">{t('tfpc.subtitle')}</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -z-10" />
        {[1, 2, 3].map((s) => (
          <div 
            key={s}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all",
              step >= s ? "bg-primary border-primary text-primary-foreground" : "bg-background border-muted text-muted-foreground"
            )}
          >
            {step > s ? <CheckCircle2 className="h-6 w-6" /> : s}
          </div>
        ))}
      </div>

      <div className="grid gap-6">
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {t('tfpc.period.title')}
              </CardTitle>
              <CardDescription>{t('tfpc.period.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>{t('tfpc.period.year')}</Label>
                  <Select 
                    value={String(data.period.year)} 
                    onValueChange={(v) => setData({ ...data, period: { ...data.period, year: parseInt(v) }})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(y => (
                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('tfpc.period.title')}</Label>
                  <Select 
                    value={String(data.period.semester)} 
                    onValueChange={(v) => setData({ ...data, period: { ...data.period, semester: parseInt(v) }})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">{t('tfpc.period.s1')}</SelectItem>
                      <SelectItem value="2">{t('tfpc.period.s2')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg flex gap-3 items-start border border-blue-100 dark:border-blue-900">
                <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-bold mb-1">{t('tfpc.period.deadline')}</p>
                  <p>{data.period.semester === 1 ? t('tfpc.period.s1Deadline') : t('tfpc.period.s2Deadline')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                {t('tfpc.calculation.title')}
              </CardTitle>
              <CardDescription>{t('tfpc.calculation.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('tfpc.calculation.mass')}</Label>
                  <Input 
                    type="number"
                    inputMode="decimal"
                    placeholder={t('tfpc.calculation.massPlaceholder')}
                    value={data.massSalariale}
                    onChange={(e) => setData({ ...data, massSalariale: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('tfpc.calculation.trainingCosts')}</Label>
                    <Input 
                      type="number"
                      inputMode="decimal"
                      value={data.fraisFormation}
                      onChange={(e) => setData({ ...data, fraisFormation: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('tfpc.calculation.apprenticeCosts')}</Label>
                    <Input 
                      type="number"
                      inputMode="decimal"
                      value={data.fraisApprentissage}
                      onChange={(e) => setData({ ...data, fraisApprentissage: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {result && (
                <div className="mt-8 p-6 bg-muted/50 rounded-xl space-y-4 border">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{t('tfpc.calculation.tfpcResult')}</span>
                    <span className="font-medium">{result.tfpcBrut.toFixed(2)} DZD</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{t('tfpc.calculation.taResult')}</span>
                    <span className="font-medium">{result.taBrut.toFixed(2)} DZD</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold border-t pt-2">
                    <span className="text-muted-foreground">{t('tfpc.calculation.totalBrut')}</span>
                    <span>{result.tfpcBrut.plus(result.taBrut).toFixed(2)} DZD</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold text-primary border-t-2 border-primary/20 pt-4">
                    <span>{t('tfpc.calculation.netToPay')}</span>
                    <span>{result.totalAPayer.toFixed(2)} DZD</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                {t('tfpc.summary.title')}
              </CardTitle>
              <CardDescription>{t('tfpc.summary.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-center py-10">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold">{t('tfpc.summary.ready')}</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {t('tfpc.summary.readyInfo')}
              </p>

              <div className="flex flex-col md:flex-row gap-3 justify-center mt-8">
                <Button variant="outline" className="gap-2">
                  <Printer className="h-4 w-4" />
                  {t('tfpc.summary.print')}
                </Button>
                <Button className="gap-2">
                  <Download className="h-4 w-4" />
                  {t('wizard.summary.export')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            {t('wizard.back')}
          </Button>
          <Button
            onClick={nextStep}
            disabled={step === totalSteps || (step === 2 && !data.massSalariale)}
            className="gap-2"
          >
            {step === totalSteps ? t('wizard.submit') : t('wizard.next')}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
