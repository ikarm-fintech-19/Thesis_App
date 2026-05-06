'use client';

import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AuthUser } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: AuthUser['role'][];
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/dashboard';
      router.push('/login?redirect=' + encodeURIComponent(currentPath));
    } else if (!loading && user && requiredRole && !requiredRole.includes(user.role)) {
      router.push('/dashboard');
    }
  }, [user, loading, router, requiredRole]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
