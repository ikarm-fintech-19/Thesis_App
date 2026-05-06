'use client';

import React from 'react';
import { Check, Zap, Shield, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SUBSCRIPTION_PLANS, PlanType } from '@/lib/subscription';
import { toast } from 'sonner';

export function PricingTable() {
  const handleUpgrade = (plan: PlanType) => {
    if (plan === 'FREE') return;
    toast.info(`Demande de passage au forfait ${plan} enregistrée. Notre équipe vous contactera pour finaliser le paiement.`);
  };

  const plans = [
    { 
      id: 'FREE' as PlanType, 
      icon: <Zap className="h-5 w-5 text-muted-foreground" />,
      color: 'bg-muted/50'
    },
    { 
      id: 'PRO' as PlanType, 
      icon: <Rocket className="h-5 w-5 text-primary" />,
      color: 'bg-primary/5 border-primary/20',
      popular: true
    },
    { 
      id: 'ENTERPRISE' as PlanType, 
      icon: <Shield className="h-5 w-5 text-amber-500" />,
      color: 'bg-amber-50 border-amber-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
      {plans.map((p) => {
        const planInfo = SUBSCRIPTION_PLANS[p.id];
        return (
          <Card key={p.id} className={`relative flex flex-col ${p.color} transition-all duration-300 hover:shadow-lg`}>
            {p.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground">
                Plus Populaire
              </Badge>
            )}
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                {p.icon}
                <CardTitle>{planInfo.name}</CardTitle>
              </div>
              <CardDescription>
                <span className="text-3xl font-bold text-foreground">
                  {planInfo.price === 0 ? 'Gratuit' : `${planInfo.price} DZD`}
                </span>
                {planInfo.price > 0 && <span className="text-muted-foreground ml-1">/mois</span>}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {planInfo.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                variant={p.id === 'FREE' ? 'outline' : 'default'} 
                className="w-full"
                onClick={() => handleUpgrade(p.id)}
              >
                {p.id === 'FREE' ? 'Actuel' : 'Choisir ce plan'}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
