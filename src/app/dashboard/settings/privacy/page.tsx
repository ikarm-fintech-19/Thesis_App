'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';

export default function PrivacySettingsPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Confidentialité</h1>
          <p className="text-muted-foreground mt-1">Vos données sont sécurisées.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Politique de confidentialité</CardTitle>
          <CardDescription>Gérez la confidentialité de vos données.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Matax s'engage à protéger vos données personnelles et fiscales.
            Aucune donnée n'est partagée avec des tiers sans votre consentement explicite.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}