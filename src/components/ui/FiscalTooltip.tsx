'use client';

import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useI18n } from '@/lib/i18n-context';
import { HelpCircle } from 'lucide-react';

interface FiscalTooltipProps {
  term: 'ht' | 'tva' | 'irg' | 'cnas' | 'tap';
  children?: React.ReactNode;
}

export function FiscalTooltip({ term, children }: FiscalTooltipProps) {
  const { t } = useI18n();

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 cursor-help group">
            {children || <span className="font-semibold border-b border-dotted border-slate-400 group-hover:border-primary transition-colors">{term.toUpperCase()}</span>}
            <HelpCircle className="h-3 w-3 text-slate-400 group-hover:text-primary transition-colors" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[250px] p-3 space-y-1.5 shadow-xl border-none">
          <p className="font-bold text-sm border-b border-primary-foreground/20 pb-1">
            {t(`terminology.${term}.title`)}
          </p>
          <p className="text-xs opacity-90 leading-relaxed">
            {t(`terminology.${term}.desc`)}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
