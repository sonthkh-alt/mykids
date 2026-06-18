'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Clock, TrendingUp, TrendingDown, Flame } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ParentDashboardChild {
  studentId: string;
  displayName: string;
  level: number;
  xp: number;
  streakDays: number;
  weeklyMinutes: number;
  strengths: string[];
  weaknesses: string[];
  lastReportSummary?: string;
}

export default function ParentDashboard() {
  const { user, logout } = useAuth();

  const { data: children, isLoading } = useQuery({
    queryKey: ['parent-dashboard'],
    queryFn: () => api.get<ParentDashboardChild[]>('/parents/dashboard'),
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">
            Bảng điều khiển phụ huynh
          </h1>
          <p className="text-ink/60">Xin chào {user?.fullName}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={logout}>
          Đăng xuất
        </Button>
      </header>

      <div className="flex gap-2">
        <Link href="/parent/students/new">
          <Button size="sm">+ Thêm con</Button>
        </Link>
        <Link href="/parent/family">
          <Button size="sm" variant="outline">
            Thử thách gia đình
          </Button>
        </Link>
      </div>

      {isLoading && <p className="text-ink/60">Đang tải...</p>}

      {children?.length === 0 && (
        <Card>
          <p className="text-ink/70">
            Chưa có hồ sơ con nào. Hãy{' '}
            <Link href="/parent/students/new" className="font-bold text-brand">
              thêm con
            </Link>{' '}
            để bắt đầu!
          </p>
        </Card>
      )}

      {children?.map((c) => (
        <Card key={c.studentId} className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle>{c.displayName}</CardTitle>
            <span className="rounded-full bg-sun/20 px-3 py-1 font-display font-bold text-ink">
              Lv {c.level}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat icon={<Clock className="h-5 w-5 text-sky" />} label="Phút/tuần" value={c.weeklyMinutes} />
            <Stat icon={<Flame className="h-5 w-5 text-coral" />} label="Streak" value={c.streakDays} />
            <Stat icon={<TrendingUp className="h-5 w-5 text-brand" />} label="XP" value={c.xp} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-brand/10 p-3">
              <p className="flex items-center gap-1 text-xs font-bold text-brand">
                <TrendingUp className="h-4 w-4" /> Điểm mạnh
              </p>
              <p className="text-sm text-ink/70">
                {c.strengths.length ? c.strengths.join(', ') : 'Đang thu thập...'}
              </p>
            </div>
            <div className="rounded-xl bg-coral/10 p-3">
              <p className="flex items-center gap-1 text-xs font-bold text-coral">
                <TrendingDown className="h-4 w-4" /> Cần cải thiện
              </p>
              <p className="text-sm text-ink/70">
                {c.weaknesses.length ? c.weaknesses.join(', ') : 'Đang thu thập...'}
              </p>
            </div>
          </div>

          {c.lastReportSummary && (
            <div className="rounded-xl bg-grape/10 p-3">
              <p className="mb-1 text-xs font-bold text-grape">🤖 Báo cáo AI</p>
              <p className="text-sm text-ink/70">{c.lastReportSummary}</p>
            </div>
          )}

          <Link href={`/parent/reports/${c.studentId}`}>
            <Button variant="outline" size="sm" className="w-full">
              Xem báo cáo chi tiết
            </Button>
          </Link>
        </Card>
      ))}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl bg-cloud p-3">
      <div className="mb-1 flex justify-center">{icon}</div>
      <p className="font-display text-lg font-extrabold text-ink">{value}</p>
      <p className="text-[10px] font-bold text-ink/50">{label}</p>
    </div>
  );
}
