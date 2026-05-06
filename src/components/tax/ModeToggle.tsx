'use client'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Calculator, GraduationCap, Wrench } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'

export type UIMode = 'simple' | 'expert' | 'thesis'

interface ModeToggleProps {
  mode: UIMode
  onModeChange: (mode: UIMode) => void
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  const { t } = useI18n()

  return (
    <ToggleGroup
      type="single"
      value={mode}
      onValueChange={(val) => { if (val) onModeChange(val as UIMode) }}
      className="bg-muted/50 rounded-lg p-1"
    >
      <ToggleGroupItem
        value="simple"
        className="flex items-center gap-1.5 px-3 py-2 data-[state=on]:bg-background data-[state=on]:shadow-sm rounded-md text-sm"
      >
        <Calculator className="h-4 w-4" />
        {t('modes.simple')}
      </ToggleGroupItem>
      <ToggleGroupItem
        value="expert"
        className="flex items-center gap-1.5 px-3 py-2 data-[state=on]:bg-background data-[state=on]:shadow-sm rounded-md text-sm"
      >
        <Wrench className="h-4 w-4" />
        {t('modes.expert')}
      </ToggleGroupItem>
      <ToggleGroupItem
        value="thesis"
        className="flex items-center gap-1.5 px-3 py-2 data-[state=on]:bg-background data-[state=on]:shadow-sm rounded-md text-sm"
      >
        <GraduationCap className="h-4 w-4" />
        {t('modes.thesis')}
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
