'use client';

import React from 'react';
import { AIScanner } from '@/components/tax/AIScanner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ScannerPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scanner IA de Factures</h1>
          <p className="text-muted-foreground mt-1">
            Extraire les données fiscales intelligemment grâce à l'IA de Matax.
          </p>
        </div>
      </div>

      <AIScanner />
    </div>
  );
}
