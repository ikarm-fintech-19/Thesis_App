'use client'

import { useState, useSyncExternalStore } from 'react'

function getOnlineStatus() {
  if (typeof window === 'undefined') return true
  return navigator.onLine
}

const onlineStore = {
  subscribe(callback: () => void) {
    window.addEventListener('online', callback)
    window.addEventListener('offline', callback)
    return () => {
      window.removeEventListener('online', callback)
      window.removeEventListener('offline', callback)
    }
  },
  getSnapshot: getOnlineStatus,
}

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const isOnline = useSyncExternalStore(onlineStore.subscribe, onlineStore.getSnapshot)
  const [mounted] = useState(() => {
    if (typeof window === 'undefined') return false
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault()
    })
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
    return true
  })

  if (!mounted) return <>{children}</>

  return (
    <>
      {!isOnline && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-80 bg-amber-100 dark:bg-amber-900 border border-amber-300 dark:border-amber-700 rounded-lg p-4 z-50 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <div>
              <p className="font-medium text-amber-900 dark:text-amber-100">Mode hors ligne</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">Certaines fonctionnalités peuvent être limitées</p>
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  )
}