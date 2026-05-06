'use client'

import { useI18n } from '@/lib/i18n-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, Sparkles, Building2, Users } from 'lucide-react'
import Link from 'next/link'

const plans = [
  {
    id: 'FREE',
    name: 'Gratuit',
    price: 0,
    description: 'Pour découvrir la plateforme',
    features: [
      { name: '10 calculs/mois', included: true },
      { name: 'Export PDF', included: true },
      { name: 'Calculateur TVA basique', included: true },
      { name: 'Déclarations G50', included: false },
      { name: 'Export CSV/Excel', included: false },
      { name: 'Support prioritaire', included: false },
      { name: 'API Access', included: false },
    ],
    cta: 'Commencer gratuitement',
    ctaLink: '/login',
    popular: false
  },
  {
    id: 'PRO',
    name: 'Professionnel',
    price: 999,
    description: 'Pour les TPE et indépendants',
    features: [
      { name: 'Calculs illimités', included: true },
      { name: 'Export PDF illimité', included: true },
      { name: 'Calculateur complet', included: true },
      { name: 'Déclarations G50 illimitées', included: true },
      { name: 'Export CSV/Excel', included: true },
      { name: 'Support prioritaire', included: false },
      { name: 'API Access', included: false },
    ],
    cta: 'Passer à Pro',
    ctaLink: '/dashboard/settings',
    popular: true
  },
  {
    id: 'ENTERPRISE',
    name: 'Entreprise',
    price: 4999,
    description: 'Pour les cabinets et entreprises',
    features: [
      { name: 'Tout включено Pro', included: true },
      { name: 'Multi-dossiers clients', included: true },
      { name: 'Gestion d\'équipe', included: true },
      { name: 'API Access', included: true },
      { name: 'Support prioritaire', included: true },
      { name: 'Formation personnalisée', included: true },
      { name: 'Intégrations sur mesure', included: true },
    ],
    cta: 'Contactez-nous',
    ctaLink: '/contact',
    popular: false
  }
]

export default function PricingPage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-20">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('pricing.title', { defaultValue: 'Tarifs simples et transparents' })}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('pricing.subtitle', { 
              defaultValue: 'Choisissez le plan adapté à vos besoins.Aucun engagement, résiliation anytime.' 
            })}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {t('pricing.popular', { defaultValue: 'Plus populaire' })}
                </Badge>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground"> DZD<span className="text-sm">/mois</span></span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-500 shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground/50 shrink-0" />
                      )}
                      <span className={feature.included ? '' : 'text-muted-foreground/70'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={plan.popular ? 'default' : 'outline'}
                  asChild
                >
                  <Link href={plan.ctaLink}>
                    {plan.cta}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            {t('pricing.faq.question', { defaultValue: 'Des questions sur les tarifs?' })}
          </p>
          <Button variant="link" asChild>
            <Link href="/contact">{t('pricing.contact', { defaultValue: 'Contactez-nous' })}</Link>
          </Button>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">{t('pricing.features.noContract', { defaultValue: 'Sans engagement' })}</h3>
            <p className="text-sm text-muted-foreground">
              {t('pricing.features.noContractDesc', { defaultValue: 'Résiliez anytime, pas de frais cachés' })}
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">{t('pricing.features.algeria', { defaultValue: 'Adapté Algérie' })}</h3>
            <p className="text-sm text-muted-foreground">
              {t('pricing.features.algeriaDesc', { defaultValue: 'Conforme aux lois fiscales algériennes' })}
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">{t('pricing.features.support', { defaultValue: 'Support local' })}</h3>
            <p className="text-sm text-muted-foreground">
              {t('pricing.features.supportDesc', { defaultValue: 'Assistance en français et arabe' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}