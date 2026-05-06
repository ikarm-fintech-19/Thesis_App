'use client'

import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react'
import { useState } from 'react'

interface PenaltyWarningBannerProps {
  penalties: Array<{
    type: string
    message: string
    severity: 'warning' | 'error'
  }>
}

export default function PenaltyWarningBanner({ penalties }: PenaltyWarningBannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  if (penalties.length === 0) return null

  const visiblePenalties = penalties.filter(p => !dismissed.has(p.type))

  if (visiblePenalties.length === 0) return null

  return (
    <div className="space-y-2">
      {visiblePenalties.map((penalty, idx) => (
        <div
          key={`${penalty.type}-${idx}`}
          className={`flex items-start gap-3 p-3 rounded-lg border ${
            penalty.severity === 'error'
              ? 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800'
              : 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800'
          }`}
        >
          {penalty.severity === 'error' ? (
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className={`text-sm font-medium ${
              penalty.severity === 'error'
                ? 'text-red-800 dark:text-red-200'
                : 'text-amber-800 dark:text-amber-200'
            }`}>
              {penalty.message}
            </p>
          </div>
          <button
            onClick={() => setDismissed(prev => new Set([...prev, penalty.type]))}
            className="shrink-0 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      ))}
    </div>
  )
}