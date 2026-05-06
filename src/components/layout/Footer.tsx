'use client'
import Link from 'next/link';
import { useI18n } from '@/lib/i18n-context';
import { BRAND } from '@/lib/brand';

import { usePathname } from 'next/navigation';

export function Footer() {
  const { t } = useI18n();
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  
  if (pathname?.startsWith('/dashboard')) return null;

  return (
    <footer className="mt-12 border-t bg-muted/30 py-12 no-print relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/20 dark:[mask-image:linear-gradient(0deg,rgba(0,0,0,0.8),rgba(0,0,0,0.4))] -z-10" />
      <div className="container mx-auto max-w-5xl px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl text-primary tracking-tight">{BRAND.name}</span>
              <span className="text-muted-foreground text-sm font-medium">© {currentYear}</span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">{t('footer.builtWith')}</p>
          </div>
          <div className="flex gap-8 text-sm font-semibold text-muted-foreground">
            <Link href="/legal" className="hover:text-primary transition-all duration-200 hover:underline underline-offset-4">{t('footer.terms')}</Link>
            <Link href="/dashboard/settings/privacy" className="hover:text-primary transition-all duration-200 hover:underline underline-offset-4">{t('footer.privacy')}</Link>
            <Link href="/contact" className="hover:text-primary transition-all duration-200 hover:underline underline-offset-4">{t('footer.contact')}</Link>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-primary/5 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold opacity-70">
            {t('footer.compliance')}
          </p>
          <p className="mt-2 text-[10px] text-muted-foreground/60">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
