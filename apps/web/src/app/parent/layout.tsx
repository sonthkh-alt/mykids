import type { ReactNode } from 'react';
import { AuthGuard } from '@/components/layout/auth-guard';

export default function ParentLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allow={['PARENT', 'ADMIN']}>
      <div className="mx-auto min-h-screen max-w-2xl px-4 py-6">{children}</div>
    </AuthGuard>
  );
}
