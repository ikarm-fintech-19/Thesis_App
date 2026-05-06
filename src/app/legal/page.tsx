import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Scale } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export const metadata = {
  title: 'Mentions légales — Matax',
  description: 'Mentions légales et informations juridiques de la plateforme Matax.',
};

export default function LegalPage() {
  return (
    <div className="min-h-[80vh] py-16">
      <div className="container max-w-3xl px-4 mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Scale className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mentions légales</h1>
            <p className="text-muted-foreground text-sm mt-1">Dernière mise à jour : janvier 2026</p>
          </div>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">

          <section>
            <h2 className="text-foreground text-xl font-semibold mb-3">1. Éditeur du site</h2>
            <p>
              La plateforme <strong className="text-foreground">Matax</strong> est éditée par Matax SAS, société à responsabilité simplifiée au capital de 1 000 000 DZD, immatriculée au Registre du Commerce d'Alger.
            </p>
            <p className="mt-2">
              <strong className="text-foreground">Siège social :</strong> Alger, Algérie<br />
              <strong className="text-foreground">Email :</strong> contact@matax.dz<br />
              <strong className="text-foreground">Directeur de publication :</strong> Équipe Matax
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-foreground text-xl font-semibold mb-3">2. Hébergement</h2>
            <p>
              La plateforme est hébergée sur des serveurs sécurisés. Les données des utilisateurs sont stockées conformément aux réglementations algériennes en vigueur relatives à la protection des données personnelles.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-foreground text-xl font-semibold mb-3">3. Propriété intellectuelle</h2>
            <p>
              L'ensemble des contenus présents sur Matax (textes, calculs, logique métier, interfaces) est protégé par le droit de la propriété intellectuelle. Toute reproduction, même partielle, est interdite sans autorisation écrite préalable.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-foreground text-xl font-semibold mb-3">4. Limitation de responsabilité</h2>
            <p>
              Les calculs fournis par Matax sont basés sur la <strong className="text-foreground">Loi de Finances 2026</strong> et le Code des Impôts Directs et Indirects (CIDTA). Ils ont une valeur indicative et ne constituent pas un conseil fiscal ou juridique opposable. Matax ne saurait être tenu responsable d'erreurs résultant d'une mauvaise saisie de données par l'utilisateur.
            </p>
            <p className="mt-2">
              Il est recommandé de consulter un expert-comptable agréé pour toute décision fiscale significative.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-foreground text-xl font-semibold mb-3">5. Données personnelles</h2>
            <p>
              Matax collecte uniquement les données nécessaires au fonctionnement du service (email, informations de calcul). Ces données ne sont jamais cédées à des tiers à des fins commerciales.
            </p>
            <p className="mt-2">
              Conformément à la législation algérienne, vous disposez d'un droit d'accès, de rectification et de suppression de vos données en contactant :{' '}
              <a href="mailto:contact@matax.dz" className="text-primary hover:underline">
                contact@matax.dz
              </a>
            </p>
            <p className="mt-2">
              Pour la politique de confidentialité complète, consultez la{' '}
              <Link href="/dashboard/settings/privacy" className="text-primary hover:underline">
                page dédiée
              </Link>.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-foreground text-xl font-semibold mb-3">6. Droit applicable</h2>
            <p>
              Le présent site et les présentes mentions légales sont soumis au droit algérien. Tout litige relatif à l'utilisation de la plateforme sera soumis à la juridiction compétente du tribunal d'Alger.
            </p>
          </section>

          <Separator />

          <p className="text-xs text-center text-muted-foreground/60 pt-4">
            © {new Date().getFullYear()} Matax · Tous droits réservés · Alger, Algérie
          </p>
        </div>
      </div>
    </div>
  );
}
