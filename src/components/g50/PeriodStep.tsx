'use client'

import { useI18n } from '@/lib/i18n-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Info } from 'lucide-react'

interface PeriodStepProps {
  data: any
  updateData: any
  onPenaltiesChange: any
}

const months = [
  { value: 1, label: 'Janvier' },
  { value: 2, label: 'Février' },
  { value: 3, label: 'Mars' },
  { value: 4, label: 'Avril' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Juin' },
  { value: 7, label: 'Juillet' },
  { value: 8, label: 'Août' },
  { value: 9, label: 'Septembre' },
  { value: 10, label: 'Octobre' },
  { value: 11, label: 'Novembre' },
  { value: 12, label: 'Décembre' }
]

const quarters = [
  { value: 1, label: 'T1 (Jan-Mar)' },
  { value: 2, label: 'T2 (Avr-Juin)' },
  { value: 3, label: 'T3 (Juil-Sep)' },
  { value: 4, label: 'T4 (Oct-Dec)' }
]

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

export default function PeriodStep({ data, updateData, onPenaltiesChange }: PeriodStepProps) {
  const { t } = useI18n()

  const handlePeriodChange = (field: string, value: string | number) => {
    const newPeriod = { ...data.period, [field]: value }
    updateData({ period: newPeriod })
    checkPenalties(newPeriod)
  }

  const checkPenalties = (period: any) => {
    const now = new Date()
    const deadline = new Date(period.year, period.month - 1, 20)
    const isLate = now > deadline
    const isCurrentPeriod = period.year === now.getFullYear() && period.month === now.getMonth() + 1

    const penalties: any[] = []
    if (isLate && !isCurrentPeriod) {
      penalties.push({ type: 'LATE_DECLARATION', message: t('penalties.lateDeclaration'), severity: 'error' as const })
    }
    onPenaltiesChange(penalties)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t('wizard.period.title')}
          </CardTitle>
          <CardDescription>{t('wizard.period.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t('wizard.period.type')}</Label>
              <Select
                value={data.period.type}
                onValueChange={(v: 'monthly' | 'quarterly') => handlePeriodChange('type', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">{t('wizard.period.monthly')}</SelectItem>
                  <SelectItem value="quarterly">{t('wizard.period.quarterly')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('wizard.period.month')}</Label>
              <Select
                value={String(data.period.month)}
                onValueChange={(v) => handlePeriodChange('month', parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {data.period.type === 'monthly'
                    ? months.map(m => (
                        <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                      ))
                    : quarters.map(q => (
                        <SelectItem key={q.value} value={String(q.value)}>{q.label}</SelectItem>
                      ))
                  }
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('wizard.period.year')}</Label>
              <Select
                value={String(data.period.year)}
                onValueChange={(v) => handlePeriodChange('year', parseInt(v))}
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
          </div>

          <div className="bg-muted/50 p-4 rounded-lg flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">{t('wizard.period.deadline')}</p>
              <p>{t('wizard.period.deadlineInfo')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}