'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  FileSearch, 
  Upload, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Building2,
  Calendar,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { formatCurrency } from '@/lib/decimal-utils';
import { useI18n } from '@/lib/i18n-context';
import { useAIStore } from '@/lib/ai-store';

interface ScanResult {
  vendorName: string;
  date: string;
  baseHT: string;
  tvaRate: string;
  tvaAmount: string;
  totalTTC: string;
  category: string;
  confidence: number;
}

export function AIScanner() {
  const { locale } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { lastResult: result, setLastResult: setResult } = useAIStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setResult(null);
    }
  };

  const handleScan = async () => {
    if (!file) return;

    setIsScanning(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/ai/scan', {
        method: 'POST',
        body: formData,
      });

      const contentType = res.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      if (!res.ok) {
        if (isJson) {
          const errorData = await res.json();
          throw new Error(errorData.error || `Scan failed (${res.status})`);
        } else {
          throw new Error(`Server error (${res.status}). Please check system logs.`);
        }
      }

      if (!isJson) {
        throw new Error('Received invalid response format from server');
      }

      const data = await res.json();
      setResult(data.result);
      toast.success('Facture analysée avec succès');
    } catch (error: any) {
      console.error('Scan error:', error);
      toast.error(error.message || 'Erreur lors de l\'analyse');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
      <Card className="border-2 border-dashed border-primary/20 bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Télécharger une Facture
          </CardTitle>
          <CardDescription>
            Scannez vos factures physiques pour extraire automatiquement les données fiscales.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-xl p-8 transition-colors hover:bg-muted/50">
            {preview ? (
              <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden border shadow-lg">
                <img src={preview} alt="Preview" className="object-cover w-full h-full" />
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="absolute top-2 right-2 opacity-80 hover:opacity-100"
                  onClick={() => { setFile(null); setPreview(null); }}
                >
                  Changer
                </Button>
              </div>
            ) : (
              <>
                <FileSearch className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Glissez-déposez ou cliquez pour sélectionner une image (JPG, PNG)
                </p>
                <Input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  id="file-upload" 
                  onChange={handleFileChange}
                />
                <Button variant="outline" asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Choisir un fichier
                  </label>
                </Button>
              </>
            )}
          </div>

          <Button 
            className="w-full h-11 rounded-xl btn-press" 
            disabled={!file || isScanning}
            onClick={handleScan}
          >
            {isScanning ? (
              <>
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 me-2" />
                Lancer l'Analyse IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className={result ? 'animate-fade-in-right' : 'opacity-50 grayscale pointer-events-none'}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Résultats de l'Extraction
          </CardTitle>
          <CardDescription>
            Données extraites selon les règles de la LF 2026.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {result ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Fournisseur</Label>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{result.vendorName}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Date</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{result.date}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Montant HT</span>
                  <span className="font-mono font-bold" dir="ltr">{formatCurrency(result.baseHT, locale)} DZD</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">Taux TVA</span>
                    <Badge variant="outline" className="text-[10px]">{(parseFloat(result.tvaRate) * 100).toFixed(0)}%</Badge>
                  </div>
                  <span className="font-mono font-bold text-primary" dir="ltr">{formatCurrency(result.tvaAmount, locale)} DZD</span>
                </div>
                <div className="pt-2 border-t flex justify-between items-center">
                  <span className="text-sm font-bold">Total TTC</span>
                  <span className="text-xl font-mono font-black text-primary" dir="ltr">{formatCurrency(result.totalTTC, locale)} DZD</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Confiance de l'IA</Label>
                  <span className="text-xs font-bold text-green-600">{(result.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-600 transition-all duration-1000" 
                    style={{ width: `${result.confidence * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-lg">
                  Modifier
                </Button>
                <Button 
                  className="flex-1 rounded-lg"
                  asChild
                >
                  <Link href="/dashboard/declarations?action=add-scan">
                    Ajouter à la Déclaration
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground/20 mb-4" />
              <p className="text-sm text-muted-foreground">
                Veuillez télécharger et scanner une facture pour voir les résultats.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
