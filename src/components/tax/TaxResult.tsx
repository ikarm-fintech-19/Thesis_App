'use client'

import { useI18n } from '@/lib/i18n-context'
import { TVACalculationResult } from '@/lib/tax-engine'
import { formatCurrency } from '@/lib/decimal-utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Receipt,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BookOpen
} from 'lucide-react'

interface TaxResultProps {
  result: TVACalculationResult | null
  mode: 'simple' | 'expert'
}

export function TaxResult({ result, mode }: TaxResultProps) {
  const { t, locale } = useI18n()

  if (!result) {
    return (
      <Card className="border-2 border-dashed border-muted card-interactive rounded-xl">
        <CardContent className="p-8 text-center">
          <Receipt className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">{t('result.noResult')}</p>
        </CardContent>
      </Card>
    )
  }

  const isExempt = result.exempt

  return (
    <Card className="overflow-hidden rounded-xl animate-fade-in-up">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{t('result.title')}</CardTitle>
          <Badge
            variant={isExempt ? 'secondary' : 'default'}
            className={isExempt
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-primary text-primary-foreground'
            }
          >
            {isExempt ? (
              <CheckCircle2 className="h-3.5 w-3.5 me-1" />
            ) : (
              <TrendingUp className="h-3.5 w-3.5 me-1" />
            )}
            {isExempt ? t('result.exempt') : `${result.rate.mul(100).toString()}%`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-stagger">
          <div className="rounded-lg bg-muted/50 p-3 space-y-1 transition-colors duration-150">
            <p className="text-xs text-muted-foreground font-medium">{t('result.base')}</p>
            <p className="text-xl font-bold font-mono" dir="ltr">
              {formatCurrency(result.base, locale)} <span className="text-xs font-normal">{t('common.currency')}</span>
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 space-y-1 transition-colors duration-150">
            <p className="text-xs text-muted-foreground font-medium">{t('result.taxAmount')}</p>
            <p className={`text-xl font-bold font-mono ${isExempt ? 'text-green-600' : 'text-primary'}`} dir="ltr">
              {formatCurrency(result.taxAmount, locale)} <span className="text-xs font-normal">{t('common.currency')}</span>
            </p>
          </div>
          {!isExempt && (
            <div className="col-span-1 sm:col-span-2 rounded-lg bg-primary/5 border border-primary/20 p-3 space-y-1 transition-colors duration-150">
              <p className="text-xs text-muted-foreground font-medium">{t('result.totalTTC')}</p>
              <p className="text-2xl font-bold font-mono text-primary" dir="ltr">
                {formatCurrency(result.totalTTC, locale)} <span className="text-xs font-normal">{t('common.currency')}</span>
              </p>
            </div>
          )}
        </div>

        {/* Exempt reason */}
        {isExempt && result.exemptReason && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">{t('result.exemptReason')}</p>
              <p className="text-xs text-amber-700 dark:text-amber-300">{result.exemptReason}</p>
            </div>
          </div>
        )}

        {/* Expert mode: full breakdown */}
        {mode === 'expert' && result.breakdown.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-semibold flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                {t('result.breakdown')}
              </p>
              {result.breakdown.map((step, idx) => (
                <div
                  key={idx}
                  className="rounded-md border bg-card p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{step.label}</p>
                    <span className="text-sm font-mono font-semibold" dir="ltr">
                      {formatCurrency(step.amount, locale)} {t('common.currency')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{step.notes}</p>
                  {step.article && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {step.article}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Legal reference */}
        {result.article && (
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
            <BookOpen className="h-3 w-3" />
            {t('result.article')}: {result.article}
          </div>
        )}

        {/* Metadata */}
        {result.metadata && (
          <div className="text-xs text-muted-foreground/70 bg-muted/30 rounded px-2 py-1.5">
            {result.metadata.law} — {result.metadata.authority} — {result.metadata.article_main}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
