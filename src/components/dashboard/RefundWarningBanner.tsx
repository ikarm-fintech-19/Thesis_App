'use client'

import React from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Clock } from 'lucide-react'
import { isClaimValid } from '@/lib/tax-engine'

interface RefundWarningBannerProps {
  declarationYear: number
}

export function RefundWarningBanner({ declarationYear }: RefundWarningBannerProps) {
  const currentYear = new Date().getFullYear()
  const isValid = isClaimValid(declarationYear, currentYear)
  const remainingYears = 4 - (currentYear - declarationYear)

  if (!isValid) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Délai de Prescription Dépassé (Art. 27 LF 2026)</AlertTitle>
        <AlertDescription>
          Le délai légal de 4 ans pour réclamer le remboursement de cet excédent est expiré (Art. 27 LF 2026).
        </AlertDescription>
      </Alert>
    )
  }

  if (remainingYears <= 1) {
    return (
      <Alert className="bg-amber-50 border-amber-200 text-amber-800">
        <Clock className="h-4 w-4 text-amber-600" />
        <AlertTitle>Urgence: Délai de Prescription Proche</AlertTitle>
        <AlertDescription>
          Il vous reste moins d'un an pour réclamer le remboursement de cet excédent avant prescription légale (Délai total: 4 ans).
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
