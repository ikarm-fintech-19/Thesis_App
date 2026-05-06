'use client'

import { AnnualTaxData } from './AnnualTaxWizard'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2, User } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'

interface ProfileStepProps {
  data: AnnualTaxData
  updateData: (updates: Partial<AnnualTaxData>) => void
}

export default function ProfileStep({ data, updateData }: ProfileStepProps) {
  const { t } = useI18n()

  return (
    <div className="space-y-8 animate-fade-in py-4">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{t('annualTax.profile.title') || '1. Forme Juridique'}</h3>
        <p className="text-sm text-muted-foreground">
          {t('annualTax.profile.description') || "Êtes-vous une entreprise (Personne Morale soumise à l'IBS) ou un entrepreneur individuel (Personne Physique soumise à l'IRG) ?"}
        </p>
        
        <RadioGroup 
          value={data.entityType} 
          onValueChange={(val: 'morale' | 'physique') => updateData({ entityType: val })}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
        >
          <div>
            <RadioGroupItem value="physique" id="physique" className="peer sr-only" />
            <Label
              htmlFor="physique"
              className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
            >
              <User className="mb-3 h-6 w-6" />
              <span className="font-semibold text-lg">{t('annualTax.profile.physique') || 'Personne Physique'}</span>
              <span className="text-xs text-muted-foreground mt-1 text-center">{t('annualTax.profile.physiqueDesc') || 'Entrepreneur Individuel (Soumis à l\'IRG)'}</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="morale" id="morale" className="peer sr-only" />
            <Label
              htmlFor="morale"
              className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
            >
              <Building2 className="mb-3 h-6 w-6" />
              <span className="font-semibold text-lg">{t('annualTax.profile.morale') || 'Personne Morale'}</span>
              <span className="text-xs text-muted-foreground mt-1 text-center">{t('annualTax.profile.moraleDesc') || 'SARL, EURL, SPA (Soumis à l\'IBS)'}</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {data.entityType === 'morale' && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-lg font-medium">{t('annualTax.profile.sectorTitle') || '2. Secteur d\'Activité'}</h3>
          <p className="text-sm text-muted-foreground">
            {t('annualTax.profile.sectorDesc') || "Le taux de l'IBS dépend de votre secteur d'activité."}
          </p>
          <Select 
            value={data.sector} 
            onValueChange={(val: any) => updateData({ sector: val })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('annualTax.profile.sectorPlaceholder') || "Sélectionnez votre secteur"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="production">{t('annualTax.profile.sectorProduction') || 'Production / Industrie (19%)'}</SelectItem>
              <SelectItem value="btph_tourism">{t('annualTax.profile.sectorBTPH') || 'BTPH & Tourisme (23%)'}</SelectItem>
              <SelectItem value="services_commerce">{t('annualTax.profile.sectorServices') || 'Services & Commerce Général (26%)'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
