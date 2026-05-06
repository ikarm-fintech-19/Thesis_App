'use client'

import React, { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Globe, 
  ChevronRight, 
  ChevronLeft, 
  Calculator, 
  CheckCircle2, 
  AlertTriangle,
  Download,
  ShieldCheck
} from 'lucide-react'
import { calculateForeignWithholding } from '@/lib/ibs-engine'
import { cn } from '@/lib/utils'

export default function ForeignWithholdingWizard() {
  const { t } = useI18n()
  const [step, setStep] = useState(1)
  const totalSteps = 2

  const [data, setData] = useState({
    grossAmount: '',
    companyName: '',
    serviceType: 'service' as 'service' | 'software' | 'technical'
  })

  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    if (data.grossAmount) {
      setResult(calculateForeignWithholding(data.grossAmount, data.serviceType))
    } else {
      setResult(null)
    }
  }, [data.grossAmount, data.serviceType])

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 rounded text-xs font-bold border bg-orange-100 text-orange-800 border-orange-200">Non-Résident</div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Retenue à la Source (IBS)</h1>
        <p className="text-muted-foreground">Prestataires Étrangers — Art. 14 & 23 LF 2026</p>
      </div>

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
                <Globe className="h-5 w-5" />
                Détails du Prestataire
              </CardTitle>
              <CardDescription>Saisissez les informations sur le prestataire non-résident et le montant brut du contrat.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom de la Société Étrangère</Label>
                  <Input 
                    placeholder="Ex: Google Cloud France"
                    value={data.companyName}
                    onChange={(e) => setData({ ...data, companyName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type de Service</Label>
                    <Select 
                      value={data.serviceType} 
                      onValueChange={(v: any) => setData({ ...data, serviceType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="service">Prestation de Service (30%)</SelectItem>
                        <SelectItem value="software">Logiciels / Redevances (24%)</SelectItem>
                        <SelectItem value="technical">Assistance Technique (20%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Montant Brut du Contrat (DZD)</Label>
                    <Input 
                      type="number"
                      inputMode="decimal"
                      placeholder="Ex: 2000000"
                      value={data.grossAmount}
                      onChange={(e) => setData({ ...data, grossAmount: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {result && (
                <div className="mt-8 p-6 bg-muted/50 rounded-xl space-y-4 border">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground text-orange-600 font-semibold flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" /> Retenue IBS ({(result.rate.toNumber() * 100).toFixed(0)}%)
                    </span>
                    <span className="font-medium text-orange-700">{result.tax.toFixed(2)} DZD</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold text-primary border-t-2 border-primary/20 pt-4">
                    <span>Net à Transférer à l'Étranger</span>
                    <span>{result.net.toFixed(2)} DZD</span>
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
                <ShieldCheck className="h-5 w-5 text-green-500" />
                Conformité LF 2026 Validée
              </CardTitle>
              <CardDescription>La retenue à la source est obligatoire pour les entités sans établissement stable.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-center py-10">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Prêt pour le Transfert</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Téléchargez l'attestation de retenue à la source à remettre à votre banque pour autoriser le transfert des fonds nets.
              </p>

              <div className="flex flex-col md:flex-row gap-3 justify-center mt-8">
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Télécharger Attestation
                </Button>
                <Button className="gap-2">
                  <Download className="h-4 w-4" />
                  Générer G50-Foreign
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
            {step === totalSteps ? 'Valider' : 'Calculer'}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
