'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import type { Role } from '@ai-academy/types';
import { useAuth } from '@/lib/auth-context';

/** Bảo vệ route client-side theo vai trò. */
export function AuthGuard({
  children,
  allow,
}: {
  children: ReactNode;
  allow: Role[];
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else if (!allow.includes(user.role)) router.replace('/home');
  }, [user, loading, allow, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }
  return <>{children}</>;
}
