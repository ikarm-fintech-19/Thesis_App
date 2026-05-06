'use client'

import { useEffect } from 'react'
import { AnnualTaxData } from './AnnualTaxWizard'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'
import Decimal from 'decimal.js'
import { useI18n } from '@/lib/i18n-context'

interface ProfitStepProps {
  data: AnnualTaxData
  updateData: (updates: Partial<AnnualTaxData>) => void
}

export default function ProfitStep({ data, updateData }: ProfitStepProps) {
  const { t } = useI18n()
  
  // Simulate auto-fetching from G50 drafts/database
  useEffect(() => {
    if (data.estimatedRevenue === '0') {
      // Dummy aggregation representing 12 months of G50 declarations
      updateData({
        estimatedRevenue: '12500000', // 12.5M
        estimatedExpenses: '4200000', // 4.2M
        estimatedSalaries: '2500000'  // 2.5M
      })
    }
  }, [data.estimatedRevenue, updateData])

  const grossProfit = new Decimal(data.estimatedRevenue)
    .sub(data.estimatedExpenses)
    .sub(data.estimatedSalaries)
    .toNumber()

  const handleCustomProfit = (val: string) => {
    updateData({ customProfit: val === '' ? null : val })
  }

  const finalProfit = data.customProfit !== null ? Number(data.customProfit) : grossProfit

  return (
    <div className="space-y-6 animate-fade-in py-4">
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles className="w-24 h-24 text-primary" />
        </div>
        
        <h3 className="text-lg font-bold text-primary flex items-center gap-2">
          <Sparkles className="w-5 h-5" /> 
          {t('annualTax.profit.title') || 'Bénéfice Auto-Calculé (Basé sur vos G50)'}
        </h3>
        <p className="text-sm text-muted-foreground mt-1 mb-6">
          {t('annualTax.profit.description', { year: data.year }) || `Nous avons agrégé vos déclarations G50 de l'année ${data.year} pour estimer votre bénéfice net.`}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-background rounded-lg p-3 border shadow-sm">
            <p className="text-xs text-muted-foreground">{t('annualTax.profit.revenue') || 'Chiffre d\'Affaires Total'}</p>
            <p className="text-lg font-semibold">{Number(data.estimatedRevenue).toLocaleString()} DZD</p>
          </div>
          <div className="bg-background rounded-lg p-3 border shadow-sm text-destructive/80">
            <p className="text-xs">{t('annualTax.profit.expenses') || 'Achats & Frais (-)'}</p>
            <p className="text-lg font-semibold">{Number(data.estimatedExpenses).toLocaleString()} DZD</p>
          </div>
          <div className="bg-background rounded-lg p-3 border shadow-sm text-destructive/80">
            <p className="text-xs">{t('annualTax.profit.salaries') || 'Masse Salariale (-)'}</p>
            <p className="text-lg font-semibold">{Number(data.estimatedSalaries).toLocaleString()} DZD</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-primary/20 pt-4 mt-2">
          <p className="font-medium text-lg">{t('annualTax.profit.estimatedNet') || 'Bénéfice Net Estimé :'}</p>
          <p className="font-bold text-2xl text-primary">{grossProfit.toLocaleString()} DZD</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">{t('annualTax.profit.manualAdjustment') || 'Ajustement Manuel'}</h3>
        <p className="text-sm text-muted-foreground">
          {t('annualTax.profit.manualAdjustmentDesc') || "Avez-vous d'autres charges non déclarées dans vos G50 (loyer, amortissements) ? Vous pouvez forcer le montant de votre bénéfice final ici. Laissez vide pour utiliser l'estimation automatique."}
        </p>
        
        <div className="space-y-2">
          <Label htmlFor="customProfit">{t('annualTax.profit.finalProfitInput') || 'Bénéfice Net Final (DZD)'}</Label>
          <Input 
            id="customProfit"
            type="number"
            inputMode="decimal"
            placeholder={grossProfit.toString()}
            value={data.customProfit || ''}
            onChange={(e) => handleCustomProfit(e.target.value)}
            className="text-lg font-semibold"
          />
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between">
        <span className="font-medium">{t('annualTax.profit.finalProfit') || 'Bénéfice Imposable Retenu :'}</span>
        <span className="font-bold text-xl">{finalProfit.toLocaleString()} DZD</span>
      </div>
    </div>
  )
}
