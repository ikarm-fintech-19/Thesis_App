'use client';

import React, { useState, Suspense } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Lock, Mail, ShieldCheck, User, Briefcase, Landmark, Hexagon } from 'lucide-react';
import { BRAND } from '@/lib/brand';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect');
  const redirect = rawRedirect?.startsWith('/') ? rawRedirect : '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Bienvenue sur ' + BRAND.name);
      router.refresh();
      router.push(redirect);
    } catch (error: any) {
      toast.error(error.message || 'Échec de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (role: 'admin' | 'expert' | 'user') => {
    setLoading(true);
    try {
      const demoEmail =
        role === 'admin'
          ? 'admin@matax.dz'
          : role === 'expert'
          ? 'expert@compta.dz'
          : 'user@matax.dz';
      const demoPass =
        role === 'admin' ? 'admin123' : role === 'expert' ? 'expert123' : 'user123';
      await login(demoEmail, demoPass);
      toast.success(`Connecté en tant que ${role.toUpperCase()}`);
      router.refresh();
      router.push(redirect);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 px-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Brand */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center justify-center gap-2">
            <div className="bg-primary/10 p-2 rounded-xl text-primary">
              <Hexagon className="h-8 w-8" />
            </div>
            <span className="font-bold text-3xl tracking-tight">MATAX</span>
          </Link>
          <p className="text-sm text-muted-foreground">Connectez-vous pour accéder à votre espace fiscal</p>
        </div>

        <Card className="border-primary/10 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Connexion
            </CardTitle>
            <CardDescription>
              Entrez vos identifiants pour accéder à la plateforme.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nom@entreprise.dz"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </Button>
            </form>

            {/* Demo Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-primary/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Accès démo</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLogin('user')}
                disabled={loading}
                title="Accès rapide en tant qu'utilisateur (Citoyen)"
                className="flex flex-col h-auto py-3 gap-1 hover:border-primary/40 card-interactive"
              >
                <User className="h-4 w-4" />
                <span className="text-[10px]">Citoyen</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLogin('expert')}
                disabled={loading}
                title="Accès rapide en tant qu'expert-comptable"
                className="flex flex-col h-auto py-3 gap-1 hover:border-primary/40 card-interactive"
              >
                <Briefcase className="h-4 w-4" />
                <span className="text-[10px]">Expert</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLogin('admin')}
                disabled={loading}
                title="Accès rapide en tant qu'administrateur"
                className="flex flex-col h-auto py-3 gap-1 hover:border-primary/40 card-interactive"
              >
                <ShieldCheck className="h-4 w-4" />
                <span className="text-[10px]">Admin</span>
              </Button>
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Pas encore de compte ?{' '}
              <Link href="/contact" className="text-primary hover:underline font-medium">
                Contactez-nous
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-[10px] text-muted-foreground opacity-60 uppercase tracking-widest">
          {BRAND.name} · Conforme Loi de Finances 2026 · DGIP Algérie
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
