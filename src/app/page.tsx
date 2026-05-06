'use client'

import { useI18n } from '@/lib/i18n-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Calculator, FileCheck, Shield, Clock, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  const { t } = useI18n()

  const features = [
    {
      icon: Calculator,
      title: t('landing.features.calculator.title'),
      description: t('landing.features.calculator.desc')
    },
    {
      icon: FileCheck,
      title: t('landing.features.declaration.title'),
      description: t('landing.features.declaration.desc')
    },
    {
      icon: Shield,
      title: t('landing.features.compliant.title'),
      description: t('landing.features.compliant.desc')
    },
    {
      icon: Clock,
      title: t('landing.features.time.title'),
      description: t('landing.features.time.desc')
    }
  ]

  const steps = [
    {
      number: '1',
      title: t('landing.howItWorks.steps.step1.title'),
      description: t('landing.howItWorks.steps.step1.desc')
    },
    {
      number: '2',
      title: t('landing.howItWorks.steps.step2.title'),
      description: t('landing.howItWorks.steps.step2.desc')
    },
    {
      number: '3',
      title: t('landing.howItWorks.steps.step3.title'),
      description: t('landing.howItWorks.steps.step3.desc')
    }
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <div className="container relative px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              {t('landing.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('landing.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/login">
                  {t('landing.hero.cta')}
                  <ArrowRight className="ms-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">
                  {t('landing.hero.cta2')}
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {t('landing.hero.noCredit')}
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t('landing.features.title')}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, idx) => (
              <Card key={idx} className="border-none shadow-none bg-transparent">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="container px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            {t('landing.howItWorks.title')}
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            {t('landing.howItWorks.subtitle')}
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {t('landing.cta.title')}
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-xl mx-auto">
            {t('landing.cta.subtitle')}
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/login">
              {t('landing.cta.button')}
            </Link>
          </Button>
        </div>
      </section>

    </div>
  )
}