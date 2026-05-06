'use client';

import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useI18n } from '@/lib/i18n-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Clock, 
  FileCheck, 
  Calculator,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UsageBanner } from '@/components/subscription/UsageBanner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { DeadlinesTimeline } from '@/components/dashboard/DeadlinesTimeline';
import { FiscalInsights } from '@/components/dashboard/FiscalInsights';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { t } = useI18n();
  const { user } = useAuth();

  const stats = [
    {
      title: t('dashboard.totalRevenue') || 'Total Revenue (2026)',
      value: '12,450,000 DZD',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: t('dashboard.taxLiability') || 'Estimated Taxes',
      value: '2,365,500 DZD',
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: t('dashboard.pendingDeclarations') || 'Pending Declarations',
      value: '1',
      icon: FileCheck,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in max-w-[1600px] mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('dashboard.welcome') || 'Marhaba'}, {user?.name || 'User'}
          </h1>
          <p className="text-slate-500 mt-1">
            {t('dashboard.subtitle') || 'Voici un aperçu de votre situation fiscale.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" size="sm" className="hidden md:flex rounded-full px-4 h-10 border-slate-200">
              <Clock className="h-4 w-4 mr-2 text-slate-400" />
              {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
           </Button>
           <Button className="rounded-full px-6 h-10 shadow-lg shadow-primary/20 btn-press" asChild>
              <Link href="/dashboard/calculator">
                <Calculator className="h-4 w-4 mr-2" />
                {t('nav.newCalculation')}
              </Link>
           </Button>
        </div>
      </div>

      <UsageBanner />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Charts */}
        <div className="lg:col-span-2 space-y-8">
          <RevenueChart />
          
          <Alert className="bg-slate-50 border-slate-200">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertTitle className="font-semibold">{t('common.updateNote') || 'Mise à jour Fiscale'}</AlertTitle>
            <AlertDescription className="text-slate-600">
              {t('common.updateDesc') || 'Les taux de TVA 2026 sont appliqués automatiquement à vos calculs.'}
            </AlertDescription>
          </Alert>
        </div>

        {/* Right Column: Deadlines & Insights */}
        <div className="space-y-8">
          <DeadlinesTimeline />
          <FiscalInsights />
          
          <Card className="bg-primary text-primary-foreground border-none shadow-xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
               <Calculator className="h-24 w-24" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                {t('common.aiTitle') || 'Scan Intelligent IA'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <p className="text-sm opacity-90 leading-relaxed">
                {t('common.aiDesc') || 'Scannez vos factures avec l\'IA pour extraire automatiquement les montants HT et TVA.'}
              </p>
              <Button variant="secondary" className="w-full h-11 rounded-xl font-semibold shadow-sm" asChild>
                <Link href="/dashboard/scanner">
                  {t('common.aiButton') || 'Lancer le Scanner'} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
