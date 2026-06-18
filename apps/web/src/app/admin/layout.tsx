import Link from 'next/link';
import type { ReactNode } from 'react';
import { AuthGuard } from '@/components/layout/auth-guard';

const NAV = [
  { href: '/admin', label: 'Tổng quan' },
  { href: '/admin/students', label: 'Học sinh' },
  { href: '/admin/prompts', label: 'AI Prompts' },
  { href: '/admin/audit', label: 'Audit Log' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allow={['ADMIN']}>
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-4 px-4 py-6">
        <header className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-extrabold text-ink">⚙️ Admin Panel</h1>
          <nav className="flex gap-2">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-full bg-black/5 px-3 py-1.5 text-sm font-bold text-ink/70 hover:bg-brand hover:text-white"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </header>
        {children}
      </div>
    </AuthGuard>
  );
}
