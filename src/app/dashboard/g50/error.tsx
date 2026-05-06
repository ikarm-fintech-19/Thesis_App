'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function G50Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('G50 Wizard Error:', error);
  }, [error]);

  return (
    <div className="flex h-[80vh] w-full items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg border-destructive/20">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-destructive/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Une erreur est survenue</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Le module de déclaration a rencontré un problème inattendu. Vos données en cours pourraient ne pas avoir été sauvegardées.
          </p>
          <div className="bg-muted/50 rounded p-3 text-left overflow-auto max-h-32">
            <code className="text-xs text-destructive">{error.message || 'Erreur inconnue'}</code>
          </div>
          <Button onClick={() => reset()} className="w-full gap-2 mt-4">
            <RotateCcw className="h-4 w-4" /> Réessayer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
