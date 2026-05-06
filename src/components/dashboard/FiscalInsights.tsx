'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n-context';
import { Lightbulb, CheckCircle2, TrendingDown, Info } from 'lucide-react';

export function FiscalInsights() {
  const { t } = useI18n();

  const insights = [
    {
      id: 1,
      type: 'tva',
      icon: Lightbulb,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      id: 2,
      type: 'compliance',
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      id: 3,
      type: 'digital',
      icon: TrendingDown,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      id: 4,
      type: 'tfpc',
      icon: Info,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
    }
  ];

  return (
    <Card className="border-none shadow-xl bg-white/50 backdrop-blur-md overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          {t('dashboard.fiscalInsights')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight) => (
          <div key={insight.id} className="flex gap-4 p-3 rounded-xl border border-slate-100 hover:border-primary/20 transition-all group">
            <div className={`p-2 rounded-lg ${insight.bg} ${insight.color} shrink-0 h-fit`}>
              <insight.icon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
                {t(`dashboard.insights.${insight.type}.title`)}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                {t(`dashboard.insights.${insight.type}.desc`)}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
