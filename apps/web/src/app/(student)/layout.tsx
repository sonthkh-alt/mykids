import type { ReactNode } from 'react';
import { AuthGuard } from '@/components/layout/auth-guard';
import { BottomNav } from '@/components/layout/bottom-nav';
import { ChildSwitchBar } from '@/components/layout/child-switch-bar';

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allow={['STUDENT', 'PARENT', 'ADMIN']}>
      <div className="mx-auto min-h-screen max-w-md px-4 pb-24 pt-4">
        <ChildSwitchBar />
        {children}
      </div>
      <BottomNav />
    </AuthGuard>
  );
}
