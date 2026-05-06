'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  LifeBuoy,
  Search,
  MessageSquare,
  BookOpen,
  Calculator,
  FileText,
  ShieldCheck,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

const FAQ = [
  {
    q: "Comment calculer la TVA sur mes ventes ?",
    a: "Rendez-vous sur le calculateur principal depuis l'accueil. Saisissez votre chiffre d'affaires hors taxe, sélectionnez le taux applicable (19% régime général, 9% taux réduit) et le moteur calcule automatiquement la TVA collectée.",
    category: "Calcul",
  },
  {
    q: "Quelle est la différence entre TVA collectée et TVA déductible ?",
    a: "La TVA collectée est celle que vous facturez à vos clients. La TVA déductible est celle que vous payez sur vos achats professionnels. La TVA nette à reverser = TVA collectée − TVA déductible.",
    category: "Fiscal",
  },
  {
    q: "Comment remplir ma déclaration G50 ?",
    a: "Accédez à la section 'Déclaration G50' dans le tableau de bord. Le wizard en 5 étapes vous guide : période, ventes, achats, salaires et récapitulatif. Le document final est conforme au formulaire officiel de la DGIP.",
    category: "G50",
  },
  {
    q: "Les calculs sont-ils conformes à la Loi de Finances 2026 ?",
    a: "Oui. Matax intègre toutes les dispositions de la LF2026 : taux de 19% et 9%, exonérations sectorielles (Article 29), Taxe Locale de Solidarité (TLS) et règles de prorata pour les activités mixtes.",
    category: "Conformité",
  },
  {
    q: "Puis-je exporter mes déclarations en PDF ?",
    a: "Oui, tous les forfaits incluent l'export PDF. Le forfait Professionnel ajoute l'export CSV/Excel pour intégration avec votre logiciel comptable.",
    category: "Export",
  },
  {
    q: "Comment fonctionne le Scanner IA de factures ?",
    a: "Le scanner utilise l'IA de Matax pour extraire automatiquement les données fiscales de vos factures uploadées (PDF, image). Il détecte le montant HT, le taux TVA applicable et calcule la déductibilité.",
    category: "IA",
  },
  {
    q: "Que faire si j'oublie mon mot de passe ?",
    a: "Contactez notre support à contact@matax.dz avec l'email de votre compte. Nous vous enverrons un lien de réinitialisation sous 1h.",
    category: "Compte",
  },
];

const categoryColors: Record<string, string> = {
  Calcul: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Fiscal: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  G50: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  Conformité: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  Export: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  IA: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  Compte: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const quickLinks = [
  { icon: Calculator, label: 'Calculateur TVA', href: '/' },
  { icon: FileText, label: 'Déclaration G50', href: '/dashboard/g50' },
  { icon: ShieldCheck, label: 'Mentions légales', href: '/legal' },
  { icon: MessageSquare, label: 'Nous contacter', href: '/contact' },
];

export default function SupportPage() {
  const [search, setSearch] = useState('');

  const filtered = FAQ.filter(
    (item) =>
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-[80vh] py-16">
      <div className="container max-w-4xl px-4 mx-auto space-y-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
        </Link>

        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
            <LifeBuoy className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Centre d'aide</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Trouvez des réponses à vos questions sur Matax et la fiscalité algérienne.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher une question..."
            className="pl-10 h-12 text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickLinks.map(({ icon: Icon, label, href }) => (
            <Link key={label} href={href}>
              <Card className="hover:border-primary/40 hover:shadow-md transition-all cursor-pointer h-full">
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium">{label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Questions fréquentes
            </CardTitle>
            <CardDescription>
              {filtered.length} question{filtered.length > 1 ? 's' : ''} trouvée{filtered.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <p>Aucun résultat pour «{search}».</p>
                <Button variant="link" asChild className="mt-2">
                  <Link href="/contact">Posez votre question directement →</Link>
                </Button>
              </div>
            ) : (
              <Accordion type="single" collapsible className="space-y-1">
                {filtered.map((item, idx) => (
                  <AccordionItem key={idx} value={`item-${idx}`} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline text-left gap-3">
                      <div className="flex items-center gap-3 flex-1">
                        <Badge className={`text-[10px] shrink-0 ${categoryColors[item.category]}`} variant="outline">
                          {item.category}
                        </Badge>
                        <span className="text-sm font-medium">{item.q}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed pt-1 pb-4">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <Card className="bg-primary text-primary-foreground text-center">
          <CardContent className="p-8 space-y-4">
            <h2 className="text-xl font-bold">Vous n'avez pas trouvé votre réponse ?</h2>
            <p className="opacity-90 text-sm">
              Notre équipe d'experts fiscaux répond sous 24h ouvrables.
            </p>
            <Button variant="secondary" asChild>
              <Link href="/contact">
                <MessageSquare className="mr-2 h-4 w-4" />
                Contacter un expert
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
