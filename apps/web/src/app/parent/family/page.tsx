'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ChallengeProgress { value: number }
interface Challenge {
  id: string;
  kind: string;
  title: string;
  description: string;
  targetValue: number;
  rewardXp: number;
  status: string;
  progress: ChallengeProgress[];
}
interface Group { id: string; name: string; challenges: Challenge[] }

const TEMPLATES = [
  { kind: 'PARENT_CHILD', title: 'Đọc sách cùng nhau', description: 'Bố/mẹ và con đọc sách 15 phút mỗi ngày.', goalType: 'READ_TOGETHER', targetValue: 7, rewardXp: 50 },
  { kind: 'PARENT_CHILD', title: 'Trò chuyện tiếng Anh', description: 'Nói chuyện tiếng Anh đơn giản mỗi ngày.', goalType: 'ENGLISH_TALK', targetValue: 5, rewardXp: 40 },
  { kind: 'WHOLE_FAMILY', title: 'Vận động cả nhà', description: 'Cả gia đình vận động 20 phút.', goalType: 'MOVEMENT', targetValue: 5, rewardXp: 60 },
];

export default function FamilyPage() {
  const qc = useQueryClient();
  const { data: groups } = useQuery({
    queryKey: ['family-groups'],
    queryFn: () => api.get<Group[]>('/family/groups'),
  });

  const createGroup = useMutation({
    mutationFn: () => api.post('/family/groups', { name: 'Gia đình của tôi' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['family-groups'] }),
  });

  const createChallenge = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/family/challenges', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['family-groups'] }),
  });

  const logProgress = useMutation({
    mutationFn: (challengeId: string) => api.post(`/family/challenges/${challengeId}/progress`, { value: 1 }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['family-groups'] }),
  });

  const group = groups?.[0];

  return (
    <div className="flex flex-col gap-5">
      <CardTitle className="text-2xl">Thử thách gia đình 👨‍👩‍👧‍👦</CardTitle>

      {!group ? (
        <Card className="text-center">
          <p className="mb-3 text-ink/70">Tạo nhóm gia đình để bắt đầu các thử thách cùng con.</p>
          <Button onClick={() => createGroup.mutate()} disabled={createGroup.isPending}>
            Tạo nhóm gia đình
          </Button>
        </Card>
      ) : (
        <>
          <Card>
            <CardTitle className="mb-3">Thêm thử thách mới</CardTitle>
            <div className="flex flex-col gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.title}
                  onClick={() => createChallenge.mutate({ ...t, groupId: group.id })}
                  className="flex items-center gap-3 rounded-xl border-2 border-black/5 bg-cloud p-3 text-left hover:border-brand"
                >
                  <Plus className="h-5 w-5 text-brand" />
                  <div>
                    <p className="font-display font-bold text-ink">{t.title}</p>
                    <p className="text-xs text-ink/50">{t.description} · +{t.rewardXp} XP</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <CardTitle>Đang diễn ra</CardTitle>
          {group.challenges.length === 0 && (
            <p className="text-ink/50">Chưa có thử thách nào. Thêm từ mẫu phía trên!</p>
          )}
          {group.challenges.map((c) => {
            const done = c.progress.reduce((a, p) => a + p.value, 0);
            const pct = Math.min(100, Math.round((done / c.targetValue) * 100));
            const completed = c.status === 'COMPLETED';
            return (
              <Card key={c.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="font-display font-bold text-ink">{c.title}</p>
                  {completed ? (
                    <CheckCircle2 className="h-6 w-6 text-brand" />
                  ) : (
                    <span className="rounded-full bg-sun/20 px-2 py-0.5 text-xs font-bold text-ink">
                      {done}/{c.targetValue}
                    </span>
                  )}
                </div>
                <p className="text-sm text-ink/60">{c.description}</p>
                <div className="h-3 w-full overflow-hidden rounded-full bg-black/10">
                  <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
                </div>
                {!completed && (
                  <Button size="sm" variant="outline" onClick={() => logProgress.mutate(c.id)}>
                    ✅ Ghi nhận hôm nay (+1)
                  </Button>
                )}
              </Card>
            );
          })}
        </>
      )}
    </div>
  );
}
