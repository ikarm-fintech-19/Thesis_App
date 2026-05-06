'use client';

import React, { useEffect, useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Calculator, CreditCard, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(res => {
        if (res.success) setData(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminSkeleton />;
  if (!data) return <div>Erreur lors du chargement des données.</div>;

  const summaryItems = [
    { name: 'Utilisateurs Totaux', value: data.summary.totalUsers, icon: Users, trend: '+12%', up: true },
    { name: 'Calculs Réalisés', value: data.summary.totalCalculations, icon: Calculator, trend: '+45%', up: true },
    { name: 'Abonnés Pro/Ent', value: data.summary.activeSubscribers, icon: CreditCard, trend: '+3%', up: true },
    { name: 'Revenu Estimé', value: `${data.summary.revenue.toLocaleString()} DZD`, icon: Activity, trend: '+8%', up: true },
  ];

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryItems.map((item) => (
          <Card key={item.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{item.name}</CardTitle>
              <item.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs flex items-center gap-1 mt-1">
                {item.up ? <ArrowUpRight className="h-3 w-3 text-emerald-500" /> : <ArrowDownRight className="h-3 w-3 text-destructive" />}
                <span className={item.up ? 'text-emerald-500' : 'text-destructive'}>{item.trend}</span>
                <span className="text-muted-foreground">depuis le mois dernier</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Volume de Calculs</CardTitle>
            <CardDescription>Nombre total de calculs effectués par jour</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.dailyAnalytics}>
                <defs>
                  <linearGradient id="colorCalculations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => new Date(val).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'short' })}
                  style={{ fontSize: '10px' }}
                />
                <YAxis style={{ fontSize: '10px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--primary))' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="totalCalculations" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorCalculations)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acquisition Utilisateurs</CardTitle>
            <CardDescription>Nouveaux inscrits sur les 30 derniers jours</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.dailyAnalytics}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => new Date(val).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'short' })}
                  style={{ fontSize: '10px' }}
                />
                <YAxis style={{ fontSize: '10px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="newUsers" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Calculations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Dernières Activités</CardTitle>
          <CardDescription>Historique en temps réel des calculs sur la plateforme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Utilisateur</th>
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Mode</th>
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Date</th>
                  <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">Détails</th>
                </tr>
              </thead>
              <tbody>
                {data.recentCalculations.map((calc: any) => (
                  <tr key={calc.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-2 align-middle">
                      <div className="flex flex-col">
                        <span className="font-medium">{calc.user.name}</span>
                        <span className="text-xs text-muted-foreground">{calc.user.email}</span>
                      </div>
                    </td>
                    <td className="p-2 align-middle">
                      <Badge variant="outline">{calc.mode}</Badge>
                    </td>
                    <td className="p-2 align-middle text-muted-foreground">
                      {new Date(calc.createdAt).toLocaleString('fr-DZ')}
                    </td>
                    <td className="p-2 align-middle text-right">
                      <Button variant="ghost" size="sm">Consulter</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  );
}
