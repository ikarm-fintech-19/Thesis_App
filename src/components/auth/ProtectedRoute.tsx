'use client';

import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthUser } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: AuthUser['role'][];
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setIsRedirecting(true);
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/dashboard';
      router.push('/login?redirect=' + encodeURIComponent(currentPath));
    } else if (!loading && user && requiredRole && !requiredRole.includes(user.role)) {
      setIsRedirecting(true);
      router.push('/dashboard');
    }
  }, [user, loading, router, requiredRole]);

  if (loading || !user || isRedirecting) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        {isRedirecting && <p className="text-muted-foreground animate-pulse text-sm">Redirection en cours...</p>}
      </div>
    );
  }

  return <>{children}</>;
}
