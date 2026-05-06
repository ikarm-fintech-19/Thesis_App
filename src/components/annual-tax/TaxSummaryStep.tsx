'use client'

import { AnnualTaxData } from './AnnualTaxWizard'
import { calculateIBS, calculateRdAllocation } from '@/lib/ibs-engine'
import { calculateIRGBusiness } from '@/lib/irg-business-engine'
import Decimal from 'decimal.js'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Download, Beaker } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n-context'
import { downloadJSON } from '@/lib/export-utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface TaxSummaryStepProps {
  data: AnnualTaxData
}

export default function TaxSummaryStep({ data }: TaxSummaryStepProps) {
  const { t } = useI18n()
  
  const grossProfit = new Decimal(data.estimatedRevenue)
    .sub(data.estimatedExpenses)
    .sub(data.estimatedSalaries)
    .toNumber()
    
  const finalProfit = data.customProfit !== null ? Number(data.customProfit) : grossProfit

  const isIBS = data.entityType === 'morale'
  
  const ibsResult = isIBS ? calculateIBS(finalProfit, data.sector) : null
  const irgResult = !isIBS ? calculateIRGBusiness(finalProfit) : null

  const taxName = isIBS ? 'IBS (Impôt sur les Bénéfices)' : 'IRG (Impôt sur le Revenu Global)'
  const finalTax = isIBS ? ibsResult!.ibsAmount.toNumber() : irgResult!.totalIrg.toNumber()

  const turnover = new Decimal(data.estimatedRevenue)
  const isLargeEnterprise = isIBS && turnover.gte(2000000000) 
  const rdAllocation = isLargeEnterprise ? calculateRdAllocation(turnover) : null

  return (
    <div className="space-y-6 animate-fade-in py-4">
      {isLargeEnterprise && (
        <Alert className="bg-purple-50 border-purple-200 text-purple-800">
          <Beaker className="h-4 w-4 text-purple-600" />
          <AlertTitle>Obligation R&D (Art. 119 LF 2026)</AlertTitle>
          <AlertDescription>
            Votre chiffre d'affaires dépasse 2 Mds DZD. Vous avez l'obligation d'allouer au moins 1% de votre CA ({rdAllocation?.toNumber().toLocaleString()} DZD) à la recherche et développement, ou de verser ce montant au fonds national.
          </AlertDescription>
        </Alert>
      )}

      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold">{t('annualTax.summary.title', { year: data.year }) || `Bilan Fiscal Annuel ${data.year}`}</h3>
        <p className="text-muted-foreground">{t('annualTax.summary.subtitle') || 'Voici le récapitulatif de votre déclaration annuelle.'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-primary/20 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h4 className="font-semibold text-lg border-b pb-2">{t('annualTax.summary.taxableBase') || 'Base Imposable'}</h4>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">{t('annualTax.summary.legalForm') || 'Forme Juridique'}</span>
              <span className="font-medium">{isIBS ? (t('annualTax.summary.moraleValue') || 'Personne Morale (SARL/EURL)') : (t('annualTax.summary.physiqueValue') || 'Personne Physique')}</span>
            </div>
            {isIBS && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{t('annualTax.summary.ibsRate') || 'Taux IBS appliqué'}</span>
                <span className="font-medium">{(ibsResult!.rate.toNumber() * 100)}%</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-dashed">
              <span className="font-medium">{t('annualTax.summary.netProfitRetained') || 'Bénéfice Net Retenu'}</span>
              <span className="font-bold text-lg">{finalProfit.toLocaleString()} DZD</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary bg-primary/5 shadow-md">
          <CardContent className="p-6 flex flex-col justify-center h-full space-y-2 text-center">
            <p className="text-sm font-medium text-muted-foreground">{t('annualTax.summary.totalTaxToPay', { taxName }) || `Total ${taxName} à payer`}</p>
            <p className="text-4xl font-black text-primary">{finalTax.toLocaleString()} DZD</p>
            {!isIBS && (
              <p className="text-xs text-muted-foreground mt-2">
                {t('annualTax.summary.irgBreakdown') || 'Calculé selon le barème progressif IRG.'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* IRG Breakdown Details */}
      {!isIBS && irgResult!.breakdown.length > 0 && (
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <h4 className="font-semibold text-sm mb-4">{t('annualTax.summary.irgBreakdownTitle') || 'Détail du calcul IRG (Barème Progressif)'}</h4>
            <div className="space-y-2">
              {irgResult!.breakdown.map((b, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm bg-muted/30 p-2 rounded">
                  <span>{t('annualTax.summary.bracket', { bracket: b.bracket }) || `Tranche ${b.bracket}`} <span className="text-muted-foreground ml-2">({b.rate})</span></span>
                  <span className="font-medium">{b.tax.toNumber().toLocaleString()} DZD</span>
                </div>
              ))}
              <div className="flex justify-between items-center font-bold text-sm p-2 pt-4 border-t">
                <span>{t('annualTax.summary.total') || 'Total'}</span>
                <span>{finalTax.toLocaleString()} DZD</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center pt-4">
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => {
            const exportData = {
              metadata: {
                title: `Bilan Fiscal Annuel ${data.year}`,
                timestamp: new Date().toISOString(),
                year: data.year
              },
              data: data,
              taxCalculation: {
                taxName,
                finalProfit,
                finalTax,
                details: isIBS ? ibsResult : irgResult
              }
            };
            downloadJSON(exportData, `bilan-annuel-${data.year}`);
          }}
        >
          <Download className="w-4 h-4" />
          {t('annualTax.summary.download') || 'Télécharger Liasse Fiscale (G4/G11)'}
        </Button>
      </div>
    </div>
  )
}
