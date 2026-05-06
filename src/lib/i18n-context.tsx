'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import fr from '@/messages/fr.json'
import en from '@/messages/en.json'
import ar from '@/messages/ar.json'

export type Locale = 'fr' | 'en' | 'ar'

type Messages = typeof fr

const messagesMap: Record<Locale, Messages> = { fr, en, ar }

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, options?: { defaultValue?: string; current?: number; total?: number }) => string
  messages: Messages
  dir: 'ltr' | 'rtl'
  isRTL: boolean
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ar')

  React.useEffect(() => {
    const saved = localStorage.getItem('matax_locale') as Locale
    if (saved && ['fr', 'en', 'ar'].includes(saved)) {
      Promise.resolve().then(() => {
        setLocaleState(saved)
        document.documentElement.lang = saved
        document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr'
      })
    }
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    document.documentElement.lang = newLocale
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr'
    localStorage.setItem('matax_locale', newLocale)
  }, [])

  const messages = messagesMap[locale]

  const t = useCallback((key: string, options?: { defaultValue?: string; current?: number; total?: number }) => {
    const keys = key.split('.')
    let result: any = messages
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k]
      } else {
        result = options?.defaultValue || key
        break
      }
    }

    if (typeof result === 'string') {
      // Basic interpolation for current/total
      if (options?.current !== undefined) result = result.replace('{current}', String(options.current))
      if (options?.total !== undefined) result = result.replace('{total}', String(options.total))
      return result
    }

    return options?.defaultValue || key
  }, [messages])

  const dir = locale === 'ar' ? 'rtl' : 'ltr'
  const isRTL = locale === 'ar'

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, messages, dir, isRTL }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
