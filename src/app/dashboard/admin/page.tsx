'use client';

import React from 'react';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { ShieldCheck, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadJSON } from '@/lib/export-utils';

export default function AdminPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Administration</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Console de Supervision</h1>
          <p className="text-muted-foreground mt-2">
            Analyse globale des performances de la plateforme Matax.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" /> Filtrer
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="gap-2"
            onClick={async () => {
              try {
                const response = await fetch('/api/admin/stats');
                const data = await response.json();
                downloadJSON(data, `matax-admin-report-${new Date().toISOString().slice(0, 10)}`);
              } catch (error) {
                console.error('Export error:', error);
              }
            }}
          >
            <Download className="h-4 w-4" /> Exporter Rapport
          </Button>
        </div>
      </div>

      <AnalyticsDashboard />
    </div>
  );
}
