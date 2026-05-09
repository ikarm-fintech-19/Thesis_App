'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/components/auth/AuthProvider';
import { LocaleSwitcher } from '@/components/tax/LocaleSwitcher';
import { LoginModal } from '@/components/auth/LoginModal';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { Landmark, User, LogOut, LayoutDashboard, Crown, Sun, Moon, Hexagon } from 'lucide-react';
import { BRAND } from '@/lib/brand';
import Link from 'next/link';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

export function Header() {
  const { t, dir } = useI18n();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md no-print">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity group">
            <div className="bg-primary/10 p-1.5 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              <Hexagon className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl leading-none tracking-tight">MATAX</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium opacity-80 mt-0.5">
                {t('nav.regtech')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/calculator" className="text-sm font-medium hover:text-primary transition-colors">
              {t('tabs.calculator')}
            </Link>
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
              {t('nav.dashboard')}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:block">
            <LocaleSwitcher />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className="h-9 w-9 rounded-lg hover:bg-primary/5"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-primary" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-primary" />
          </Button>

          {user ? (
            <DropdownMenu dir={dir}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-lg bg-primary/5 hover:bg-primary/10 cursor-pointer">
                  <User className="h-4 w-4 text-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-2 glass-card rounded-xl border-primary/10" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <LayoutDashboard className="me-2 h-4 w-4" />
                    <span>{t('nav.dashboard')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => logout()} className="text-destructive cursor-pointer">
                  <LogOut className="me-2 h-4 w-4" />
                  <span>{t('nav.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <LoginModal />
          )}

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" aria-label={t('common.menu')}>
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={dir === 'rtl' ? 'right' : 'left'} className="w-72">
                <div className="flex flex-col gap-8 mt-8">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
                      <Hexagon className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">MATAX</span>
                  </Link>
                  <nav className="flex flex-col gap-4">
                    <Link href="/calculator" className="text-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                      {t('tabs.calculator')}
                    </Link>
                    {!user && (
                      <Link href="/dashboard" className="text-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                        {t('nav.dashboard')}
                      </Link>
                    )}
                  </nav>

                  {user && (
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium mb-4 text-muted-foreground">{t('nav.dashboard')}</p>
                      <nav className="flex flex-col gap-3">
                        <Link href="/dashboard" className="text-base font-medium text-muted-foreground hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                          {t('nav.overview')}
                        </Link>
                        <Link href="/dashboard/scanner" className="text-base font-medium text-muted-foreground hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                          {t('nav.aiScanner')}
                        </Link>
                        <Link href="/dashboard/declarations" className="text-base font-medium text-muted-foreground hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                          {t('nav.myDeclarations')}
                        </Link>
                        <Link href="/dashboard/g50" className="text-base font-medium text-muted-foreground hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                          {t('nav.g50')}
                        </Link>
                        <Link href="/dashboard/settings" className="text-base font-medium text-muted-foreground hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                          {t('nav.settings')}
                        </Link>
                      </nav>
                    </div>
                  )}
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-4">{t('common.language')}</p>
                    <LocaleSwitcher />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
