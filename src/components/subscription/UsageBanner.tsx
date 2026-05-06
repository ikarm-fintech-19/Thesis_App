'use client';

import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, ArrowUpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function UsageBanner() {
  const { user } = useAuth();
  
  if (!user || user.role === 'ADMIN') return null;

  const planInfo = SUBSCRIPTION_PLANS[user.plan];
  const calculationsUsed = (user as any).calculationsUsed ?? 0;
  const usagePercent = Math.min(Math.round((calculationsUsed / planInfo.calculationLimit) * 100), 100);
  const isNearLimit = usagePercent > 80;

  return (
    <Card className={`mb-6 overflow-hidden border-none shadow-sm ${isNearLimit ? 'bg-destructive/5' : 'bg-primary/5'}`}>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className={`p-2 rounded-lg ${isNearLimit ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="space-y-1 flex-1">
              <p className="text-sm font-medium">
                Utilisation du forfait {user.plan}: {calculationsUsed} / {planInfo.calculationLimit === 1000000 ? '∞' : planInfo.calculationLimit} calculs
              </p>
              <Progress value={usagePercent} className="h-1.5 w-full md:w-48" />
            </div>
          </div>
          
          <Button variant="outline" size="sm" asChild className="gap-2 shrink-0">
            <Link href="/dashboard/settings">
              <ArrowUpCircle className="h-4 w-4" />
              Mettre à niveau
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
