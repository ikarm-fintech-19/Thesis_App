'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';

export function DeadlinesTimeline() {
  const { t } = useI18n();
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const nextMonthDate = new Date(currentDate.getFullYear(), currentMonth + 1, 20);
  
  const deadlines = [
    {
      title: t('dashboard.deadlines.g50_current') || 'G50 (Mois Actuel)',
      date: `20 ${nextMonthDate.toLocaleString('default', { month: 'long' })}`,
      status: 'pending', // pending, warning, done
      icon: CalendarDays,
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      title: t('dashboard.deadlines.annual_bilan') || 'Bilan Annuel (IBS/IRG)',
      date: '30 Avril',
      status: currentDate.getMonth() > 3 ? 'done' : 'warning',
      icon: AlertTriangle,
      color: currentDate.getMonth() > 3 ? 'text-emerald-500' : 'text-amber-500',
      bg: currentDate.getMonth() > 3 ? 'bg-emerald-500/10' : 'bg-amber-500/10'
    },
    {
      title: t('dashboard.deadlines.g50_prev') || 'G50 (Mois Précédent)',
      date: 'Déclaré',
      status: 'done',
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    }
  ];

  return (
    <Card className="col-span-1 h-full">
      <CardHeader>
        <CardTitle>{t('dashboard.deadlines.title') || 'Échéances Fiscales'}</CardTitle>
        <CardDescription>{t('dashboard.deadlines.desc') || 'Prochaines dates limites'}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {deadlines.map((deadline, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className={`mt-0.5 p-2 rounded-full ${deadline.bg} ${deadline.color}`}>
                <deadline.icon className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{deadline.title}</p>
                <p className="text-sm text-muted-foreground">{deadline.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
