'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Bell, Shield, User, Lock, ExternalLink, CreditCard, Crown, Sparkles, Building2, Check, ArrowRight, Database, Download } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n-context';
import { downloadJSON } from '@/lib/export-utils';


export default function SettingsPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [twoFA, setTwoFA] = useState(false);

  if (!user) return null;

  const handleSave = () => {
    toast.success(t('settings.profile.success'));
  };

  const handleUpgrade = (planId: string) => {
    if (planId === user.plan) return;
    if (planId === 'ENTERPRISE') {
      toast.info(t('settings.billing.plans.cta_contact'));
      return;
    }
    toast.info(t('settings.billing.integration') || 'Fonctionnalité de paiement en cours d\'intégration — disponible prochainement.');
  };

  const plans = [
    {
      id: 'FREE',
      name: t('settings.billing.plans.free'),
      price: 0,
      description: 'Pour découvrir la plateforme',
      icon: User,
      features: ['10 calculs/mois', 'Export PDF', 'Calculateur TVA basique'],
      cta: t('settings.billing.plans.current'),
    },
    {
      id: 'PRO',
      name: t('settings.billing.plans.pro'),
      price: 999,
      description: 'Pour les TPE et indépendants',
      icon: Crown,
      features: ['Calculs illimités', 'Export PDF illimité', 'Déclarations G50 illimitées', 'Export CSV/Excel'],
      cta: t('settings.billing.plans.cta_upgrade'),
      popular: true,
    },
    {
      id: 'ENTERPRISE',
      name: t('settings.billing.plans.enterprise'),
      price: 4999,
      description: 'Pour les cabinets et entreprises',
      icon: Building2,
      features: ['Tout inclus Pro', 'Multi-dossiers clients', 'Gestion d\'équipe', 'API Access', 'Support prioritaire'],
      cta: t('settings.billing.plans.cta_contact'),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('settings.description')}</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="general">{t('settings.tabs.general')}</TabsTrigger>
          <TabsTrigger value="billing">{t('settings.tabs.billing')}</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-8 mt-0">
          {/* Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" /> {t('settings.profile.title')}
              </CardTitle>
              <CardDescription>{t('settings.profile.desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('settings.profile.name')}</Label>
                  <Input id="name" defaultValue={user.name ?? ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('settings.profile.email')}</Label>
                  <Input id="email" type="email" defaultValue={user.email} />
                </div>
              </div>
              <Button onClick={handleSave}>{t('settings.profile.save')}</Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-4 w-4" /> {t('settings.notifications.title')}
              </CardTitle>
              <CardDescription>{t('settings.notifications.desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t('settings.notifications.email')}</p>
                  <p className="text-xs text-muted-foreground">{t('settings.notifications.emailDesc')}</p>
                </div>
                <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t('settings.notifications.sms')}</p>
                  <p className="text-xs text-muted-foreground">{t('settings.notifications.smsDesc')}</p>
                </div>
                <Switch checked={smsNotif} onCheckedChange={setSmsNotif} />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-4 w-4" /> {t('settings.security.title')}
              </CardTitle>
              <CardDescription>{t('settings.security.desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t('settings.security.twoFactor')}</p>
                  <p className="text-xs text-muted-foreground">{t('settings.security.twoFactorDesc')}</p>
                </div>
                <Switch checked={twoFA} onCheckedChange={setTwoFA} />
              </div>
              <Separator />
              <Button variant="outline" className="w-full sm:w-auto">
                {t('settings.security.changePassword')}
              </Button>
            </CardContent>
          </Card>

          {/* Legal */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" /> {t('settings.legal.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/settings/privacy">
                  {t('settings.legal.privacy')} <ExternalLink className="ml-2 h-3 w-3" />
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/legal">
                  {t('settings.legal.terms')} <ExternalLink className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                {t('settings.data.title') || 'Gestion des Données'}
              </CardTitle>
              <CardDescription>
                {t('settings.data.desc') || 'Exportez ou gérez vos informations personnelles.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="space-y-1">
                  <p className="font-medium text-sm">{t('settings.data.exportTitle') || 'Exporter mes données'}</p>
                  <p className="text-xs text-muted-foreground">{t('settings.data.exportDesc') || 'Téléchargez une copie de toutes vos données au format JSON.'}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="shrink-0"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/user/export-data');
                      const data = await response.json();
                      downloadJSON(data, `matax-data-export-${new Date().toISOString().slice(0, 10)}`);
                      toast.success(t('settings.data.exportSuccess') || 'Exportation réussie');
                    } catch (error) {
                      toast.error(t('settings.data.exportError') || 'Erreur lors de l\'exportation');
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t('settings.data.exportButton') || 'Télécharger (JSON)'}
                </Button>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-red-50/30 rounded-xl border border-red-100">
                <div className="space-y-1">
                  <p className="font-medium text-sm text-red-700">{t('settings.data.deleteTitle') || 'Supprimer mon compte'}</p>
                  <p className="text-xs text-red-600/70">{t('settings.data.deleteDesc') || 'Cette action est irréversible et supprimera toutes vos données.'}</p>
                </div>
                <Button variant="destructive" size="sm" className="shrink-0">
                  {t('settings.data.deleteButton') || 'Supprimer'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-8 mt-0">
          {/* Current Plan Summary */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider text-primary">{t('settings.billing.currentPlan')}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{user.plan}</p>
                  <Badge variant={user.plan === 'FREE' ? 'outline' : 'default'}>
                    {user.plan === 'FREE' ? t('settings.billing.plans.free') : t('settings.billing.active')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('settings.billing.calculations')} : <strong>{(user as any).calculationsUsed ?? '—'}</strong>
                </p>
              </div>
              {user.plan === 'FREE' && (
                <Button className="gap-2" onClick={() => handleUpgrade('PRO')}>
                  <Sparkles className="h-4 w-4" />
                  {t('settings.billing.upgrade')} — 999 DZD/mois
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrent = user.plan === plan.id;
              return (
                <Card
                  key={plan.id}
                  className={`relative transition-all ${
                    plan.popular ? 'border-primary shadow-lg' : ''
                  } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                      <Sparkles className="h-3 w-3 mr-1" /> {t('settings.billing.plans.popular')}
                    </Badge>
                  )}
                  {isCurrent && (
                    <Badge variant="outline" className="absolute -top-3 right-4 border-primary text-primary">
                      {t('settings.billing.plans.current')}
                    </Badge>
                  )}
                  <CardHeader className="text-center pb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">{plan.price.toLocaleString()}</span>
                      <span className="text-muted-foreground text-sm"> DZD/mois</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={isCurrent ? 'outline' : plan.popular ? 'default' : 'outline'}
                      disabled={isCurrent}
                      onClick={() => handleUpgrade(plan.id)}
                    >
                      {isCurrent ? t('settings.billing.plans.current') : plan.cta}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Payment History placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('settings.billing.history')}</CardTitle>
              <CardDescription>Vos factures et reçus de paiement.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10 text-muted-foreground text-sm">
                {t('settings.billing.noTransactions')}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
