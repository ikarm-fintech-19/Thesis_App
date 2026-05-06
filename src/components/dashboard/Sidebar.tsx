'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useI18n } from '@/lib/i18n-context';
import { 
  Calculator, 
  FileText,
  FileCheck,
  BarChart3, 
  Settings, 
  Users, 
  CreditCard,
  ShieldCheck,
  ChevronRight,
  Zap,
  PieChart,
  Briefcase,
  GraduationCap,
  PiggyBank,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useI18n();

  const navigation = [
    { name: t('nav.overview'), href: '/dashboard', icon: BarChart3 },
    { name: t('nav.newCalculation'), href: '/dashboard/calculator', icon: Calculator },
    { name: t('nav.aiScanner'), href: '/dashboard/scanner', icon: Zap },
    { name: t('nav.declarations') || 'Déclarations', href: '/dashboard/declarations', icon: FileText },
    { name: t('nav.g50') || 'G50 Mensuel', href: '/dashboard/g50', icon: FileCheck },
    { name: t('nav.tfpc') || 'Taxe Formation', href: '/dashboard/tfpc', icon: GraduationCap },
    { name: 'Dividendes', href: '/dashboard/dividends', icon: PiggyBank },
    { name: 'Retenue Étrangère', href: '/dashboard/foreign-withholding', icon: Globe },
    { name: t('annualTax.nav') || 'Bilan Annuel', href: '/dashboard/annual-tax', icon: PieChart },
    { name: t('nav.myTeam'), href: '/dashboard/team', icon: Users, roles: ['ACCOUNTANT', 'ADMIN'] },
    { name: t('nav.myClients') || 'Mes Clients', href: '/dashboard/accountant', icon: Briefcase, roles: ['ACCOUNTANT', 'ADMIN'] },

    { name: t('nav.settings'), href: '/dashboard/settings', icon: Settings },
    { name: t('nav.adminConsole'), href: '/dashboard/admin', icon: ShieldCheck, roles: ['ADMIN'] },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 bg-card border-r h-full">
      <div className="p-4 border-b">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2">
          {t('nav.dashboard')}
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => {
          if (item.roles && user && !item.roles.includes(user.role)) return null;

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors group",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {item.name}
              </div>
              {isActive && <ChevronRight className="h-3 w-3" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="bg-muted/50 rounded-xl p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">{t('nav.assistance')}</p>
          <p className="text-xs text-muted-foreground">{t('nav.helpText')}</p>
          <Link href="/support" className="text-xs text-primary font-medium hover:underline mt-2 inline-block">
            {t('nav.contactExpert')}
          </Link>
        </div>
      </div>
    </div>
  );
}
