'use client';

import Link from 'next/link';
import { Users } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useActiveStudent } from '@/hooks/use-active-student';

/** Thanh cho phụ huynh: hiển thị con đang học + nút quay lại chọn con khác. */
export function ChildSwitchBar() {
  const { user } = useAuth();
  const { data: student } = useActiveStudent();

  if (user?.role !== 'PARENT') return null;

  return (
    <Link
      href="/parent"
      className="mb-3 flex items-center justify-between rounded-2xl bg-white px-4 py-2 shadow-pop"
    >
      <span className="text-sm font-bold text-ink/70">
        Đang học: <span className="text-brand">{student?.displayName ?? '...'}</span>
      </span>
      <span className="flex items-center gap-1 text-xs font-bold text-sky">
        <Users className="h-4 w-4" /> Đổi con
      </span>
    </Link>
  );
}
