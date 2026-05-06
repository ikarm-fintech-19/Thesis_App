'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n-context';
import { BarChart3, FileText, Settings, Plus, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  const tabs = [
    { name: t('nav.overview'), href: '/dashboard', icon: BarChart3 },
    { name: t('nav.declarations') || 'Déclarations', href: '/dashboard/declarations', icon: FileText },
    { name: t('nav.aiScanner'), href: '/dashboard/scanner', icon: Zap },
    { name: t('nav.settings'), href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <>
      {/* Floating Action Button */}
      <Link 
        href="/dashboard/g50"
        className="md:hidden fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 active:scale-95 transition-transform"
        aria-label={t('nav.g50') || 'G50 Mensuel'}
      >
        <Plus className="h-6 w-6" />
      </Link>

      {/* Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between border-t bg-background/90 backdrop-blur-md px-2 pb-2 pt-2 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-1 rounded-lg transition-colors min-h-[44px]",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className={cn("h-5 w-5", isActive ? "fill-primary/20" : "")} />
              <span className="text-[10px] font-medium leading-none">{tab.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
