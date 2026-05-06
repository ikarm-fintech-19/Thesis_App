'use client'

import React, { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  PiggyBank, 
  ChevronRight, 
  ChevronLeft, 
  Calculator, 
  CheckCircle2, 
  Download,
  FileText
} from 'lucide-react'
import { calculateDividends, DividendResult } from '@/lib/dividends-engine'
import { cn } from '@/lib/utils'

export default function DividendWizard() {
  const { t } = useI18n()
  const [step, setStep] = useState(1)
  const totalSteps = 2

  const [data, setData] = useState({
    grossAmount: '',
    shareholderName: '',
    date: new Date().toISOString().split('T')[0]
  })

  const [result, setResult] = useState<DividendResult | null>(null)

  useEffect(() => {
    if (data.grossAmount) {
      setResult(calculateDividends(data.grossAmount))
    } else {
      setResult(null)
    }
  }, [data.grossAmount])

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Distribution de Dividendes</h1>
        <p className="text-muted-foreground">Calcul de la retenue à la source (10%) — Art. 11 LF 2026</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -z-10" />
        {[1, 2].map((s) => (
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
                <PiggyBank className="h-5 w-5" />
                Détails de la Distribution
              </CardTitle>
              <CardDescription>Saisissez le montant brut des dividendes à distribuer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom de l'Actionnaire / Associé</Label>
                  <Input 
                    placeholder="Ex: M. Ahmed"
                    value={data.shareholderName}
                    onChange={(e) => setData({ ...data, shareholderName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Montant Brut des Dividendes (DZD)</Label>
                  <Input 
                    type="number"
                    inputMode="decimal"
                    placeholder="Ex: 500000"
                    value={data.grossAmount}
                    onChange={(e) => setData({ ...data, grossAmount: e.target.value })}
                  />
                </div>
              </div>

              {result && (
                <div className="mt-8 p-6 bg-muted/50 rounded-xl space-y-4 border">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Retenue à la Source (10%)</span>
                    <span className="font-medium text-red-600">-{result.taxAmount.toFixed(2)} DZD</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold text-primary border-t-2 border-primary/20 pt-4">
                    <span>Net à Payer à l'Actionnaire</span>
                    <span>{result.netAmount.toFixed(2)} DZD</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Distribution Prête
              </CardTitle>
              <CardDescription>La retenue à la source a été calculée selon le taux de 10% (LF 2026).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-center py-10">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold">Document de Retenue Prêt</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Vous devez reverser le montant de la retenue ({result?.taxAmount.toFixed(2)} DZD) à l'administration fiscale via votre G50 mensuel.
              </p>

              <div className="flex flex-col md:flex-row gap-3 justify-center mt-8">
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Générer Certificat de Retenue
                </Button>
                <Button className="gap-2">
                  <Download className="h-4 w-4" />
                  Exporter pour G50
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
            Retour
          </Button>
          <Button
            onClick={nextStep}
            disabled={step === totalSteps || (step === 1 && !data.grossAmount)}
            className="gap-2"
          >
            {step === totalSteps ? 'Terminer' : 'Suivant'}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
