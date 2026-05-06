'use client'

import { useI18n, Locale } from '@/lib/i18n-context'
import { Button } from '@/components/ui/button'
import { Languages } from 'lucide-react'

export function LocaleSwitcher() {
  const { locale, setLocale, t } = useI18n()

  const locales: { code: Locale; label: string; flag: string }[] = [
    { code: 'fr', label: t('common.french'), flag: '🇫🇷' },
    { code: 'en', label: t('common.english'), flag: '🇬🇧' },
    { code: 'ar', label: t('common.arabic'), flag: '🇩🇿' }
  ]

  return (
    <div className="flex items-center gap-1">
      <Languages className="h-4 w-4 text-muted-foreground" />
      {locales.map(l => (
        <Button
          key={l.code}
          variant={locale === l.code ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setLocale(l.code)}
          className={`text-xs px-2 py-1 ${locale === l.code ? 'shadow-sm' : ''}`}
        >
          {l.flag} {l.label}
        </Button>
      ))}
    </div>
  )
}
