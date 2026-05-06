'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AlertCircle, Lock, Mail, ShieldCheck, User, Briefcase } from 'lucide-react';
import { BRAND } from '@/lib/brand';
import { toast } from 'sonner';

export function LoginModal({ trigger }: { trigger?: React.ReactNode }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Bienvenue sur ' + BRAND.name);
      setOpen(false);
      router.refresh();
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Échec de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (role: 'admin' | 'expert' | 'user') => {
    setLoading(true);
    try {
      const demoEmail = role === 'admin' ? 'admin@matax.dz' : 
                        role === 'expert' ? 'expert@compta.dz' : 
                        'user@matax.dz';
      const demoPass = role === 'admin' ? 'admin123' : 
                       role === 'expert' ? 'expert123' : 
                       'user123';
      await login(demoEmail, demoPass);
      toast.success(`Connecté en tant que ${role.toUpperCase()}`);
      setOpen(false);
      router.refresh();
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Connexion</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <Lock className="w-6 h-6" />
            Accès Matax
          </DialogTitle>
          <DialogDescription>
            Connectez-vous pour accéder à vos déclarations et outils avancés.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
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
              />
            </div>
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Demo Access</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm" onClick={() => quickLogin('user')} className="flex flex-col h-auto py-2 gap-1">
            <User className="h-4 w-4" />
            <span className="text-[10px]">Citoyen</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => quickLogin('expert')} className="flex flex-col h-auto py-2 gap-1">
            <Briefcase className="h-4 w-4" />
            <span className="text-[10px]">Expert</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => quickLogin('admin')} className="flex flex-col h-auto py-2 gap-1">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-[10px]">Admin</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
