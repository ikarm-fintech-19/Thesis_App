'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useI18n } from '@/lib/i18n-context';

const data = [
  { name: 'Nov', revenue: 400000, tax: 76000 },
  { name: 'Dec', revenue: 300000, tax: 57000 },
  { name: 'Jan', revenue: 550000, tax: 104500 },
  { name: 'Feb', revenue: 450000, tax: 85500 },
  { name: 'Mar', revenue: 600000, tax: 114000 },
  { name: 'Apr', revenue: 800000, tax: 152000 },
];

export function RevenueChart() {
  const { t, locale } = useI18n();

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>{t('dashboard.revenueTitle') || 'Revenus vs Taxes (DZD)'}</CardTitle>
        <CardDescription>{t('dashboard.revenueDesc') || 'Aperçu de vos déclarations G50 des 6 derniers mois'}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} dy={10} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} 
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <Tooltip 
                cursor={{fill: 'hsl(var(--muted)/0.4)'}}
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="revenue" name={t('dashboard.revenue') || 'Chiffre d\'Affaires'} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="tax" name={t('dashboard.taxes') || 'Taxes (TVA + IRG)'} fill="hsl(var(--destructive)/0.8)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
