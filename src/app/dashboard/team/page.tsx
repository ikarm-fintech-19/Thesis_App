'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, UserPlus, Mail, ShieldCheck, Briefcase, User, Crown, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type TeamRole = 'ADMIN' | 'ACCOUNTANT' | 'USER';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: 'active' | 'pending';
}

const roleIcons: Record<TeamRole, React.ElementType> = {
  ADMIN: ShieldCheck,
  ACCOUNTANT: Briefcase,
  USER: User,
};

const roleColors: Record<TeamRole, string> = {
  ADMIN: 'text-destructive',
  ACCOUNTANT: 'text-primary',
  USER: 'text-muted-foreground',
};

const DEMO_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Ahmed Benali', email: 'admin@matax.dz', role: 'ADMIN', status: 'active' },
  { id: '2', name: 'Fatima Zidane', email: 'expert@compta.dz', role: 'ACCOUNTANT', status: 'active' },
];

export default function TeamPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>(DEMO_MEMBERS);
  const [inviteEmail, setInviteEmail] = useState('');

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    const newMember: TeamMember = {
      id: String(Date.now()),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: 'USER',
      status: 'pending',
    };
    setMembers((prev) => [...prev, newMember]);
    toast.success(`Invitation envoyée à ${inviteEmail}`);
    setInviteEmail('');
  };

  const handleRemove = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    toast.success('Membre retiré de l\'équipe.');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mon Équipe</h1>
          <p className="text-muted-foreground mt-1">Gérez les membres et les accès à votre espace Matax.</p>
        </div>
      </div>

      {/* Plan notice for non-enterprise */}
      {user.plan === 'FREE' && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardContent className="p-4 flex items-center gap-3">
            <Crown className="h-5 w-5 text-amber-600 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-200">Fonctionnalité PRO</p>
              <p className="text-amber-700 dark:text-amber-300/80 text-xs">
                La gestion d'équipe est disponible à partir du forfait Professionnel.{' '}
                <Link href="/dashboard/settings" className="underline font-medium">Mettre à niveau →</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invite form */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-4 w-4" /> Inviter un membre
            </CardTitle>
            <CardDescription>
              Invitez un collaborateur ou expert-comptable à rejoindre votre espace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="flex gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="collaborateur@entreprise.dz"
                  className="pl-10"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <Button type="submit">Inviter</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Members list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Membres ({members.length})</CardTitle>
          <CardDescription>Tous les membres avec accès à votre organisation.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          {members.map((member) => {
            const RoleIcon = roleIcons[member.role];
            return (
              <div key={member.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {member.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{member.name}</p>
                      {member.status === 'pending' && (
                        <Badge variant="outline" className="text-[10px]">En attente</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-1 text-xs font-medium ${roleColors[member.role]}`}>
                    <RoleIcon className="h-3 w-3" />
                    {member.role}
                  </div>
                  {isAdmin && member.email !== user.email && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemove(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
