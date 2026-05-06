'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useI18n } from '@/lib/i18n-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Download, Eye, Clock, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { downloadCSV } from '@/lib/export-utils';

export default function DeclarationsPage() {
  const [declarations, setDeclarations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, locale } = useI18n();

  useEffect(() => {
    fetch('/api/user/declarations')
      .then(res => res.json())
      .then(res => {
        if (res.success) setDeclarations(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('userDeclarations.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('userDeclarations.subtitle')}</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/g50">{t('userDeclarations.newButton')}</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('userDeclarations.history')}</CardTitle>
          <CardDescription>{t('userDeclarations.historyDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : declarations.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium">{t('userDeclarations.empty')}</h3>
              <p className="text-xs text-muted-foreground mt-1">{t('userDeclarations.emptyDesc')}</p>
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="h-10 px-2 text-left font-medium text-muted-foreground">{t('userDeclarations.type')}</th>
                    <th className="h-10 px-2 text-left font-medium text-muted-foreground">{t('userDeclarations.period')}</th>
                    <th className="h-10 px-2 text-left font-medium text-muted-foreground">{t('userDeclarations.status')}</th>
                    <th className="h-10 px-2 text-right font-medium text-muted-foreground">{t('userDeclarations.netAmount')}</th>
                    <th className="h-10 px-2 text-right font-medium text-muted-foreground">{t('userDeclarations.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {declarations.map((d) => (
                    <tr key={d.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-2 align-middle">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="font-medium">{d.type}</span>
                        </div>
                      </td>
                      <td className="p-2 align-middle font-mono text-xs">{d.period}</td>
                      <td className="p-2 align-middle">
                        <Badge variant="secondary" className="text-[10px]">
                          {d.status}
                        </Badge>
                      </td>
                      <td className="p-2 align-middle text-right font-mono font-medium">
                        {Number(d.netAmount).toLocaleString(locale === 'ar' ? 'ar-DZ' : 'fr-DZ')} DZD
                      </td>
                      <td className="p-2 align-middle text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              const headers = [t('userDeclarations.type'), t('userDeclarations.period'), t('userDeclarations.status'), t('userDeclarations.netAmount')];
                              const rows = [[d.type, d.period, d.status, d.netAmount]];
                              downloadCSV(headers, rows, `declaration-${d.id}`);
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Alert variant="default" className="bg-amber-50 border-amber-200">
        <Clock className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 text-xs">
          {t('userDeclarations.archiveNote')}
        </AlertDescription>
      </Alert>
    </div>
  );
}
