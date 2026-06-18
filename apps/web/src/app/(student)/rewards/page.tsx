'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import type { RewardDto } from '@ai-academy/types';
import { api } from '@/lib/api';
import { useActiveStudent } from '@/hooks/use-active-student';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatsBar } from '@/components/gamification/stats-bar';

interface Reward {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  costXp: number;
  kind: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  rarity: string;
  owned: boolean;
}

const RARITY_RING: Record<string, string> = {
  COMMON: 'ring-black/10',
  RARE: 'ring-sky',
  EPIC: 'ring-grape',
  LEGENDARY: 'ring-sun',
};

export default function RewardsPage() {
  const { data: student } = useActiveStudent();
  const qc = useQueryClient();

  const { data: rewards } = useQuery({
    queryKey: ['rewards'],
    queryFn: () => api.get<Reward[]>('/gamification/rewards'),
  });
  const { data: badges } = useQuery({
    queryKey: ['badges', student?.id],
    enabled: !!student,
    queryFn: () => api.get<Badge[]>(`/gamification/badges/${student!.id}`),
  });

  const redeem = useMutation({
    mutationFn: (rewardId: string) =>
      api.post(`/gamification/rewards/${rewardId}/redeem`, { studentId: student!.id }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['active-student'] });
      void qc.invalidateQueries({ queryKey: ['rewards'] });
    },
  });

  if (!student) return null;

  return (
    <div className="flex flex-col gap-5">
      <CardTitle className="text-2xl">Trung tâm phần thưởng 🎁</CardTitle>
      <StatsBar level={student.level} xp={student.xp} streakDays={student.streakDays} />

      <section>
        <CardTitle className="mb-3">Huy hiệu</CardTitle>
        <div className="grid grid-cols-4 gap-3">
          {badges?.map((b) => (
            <div key={b.id} className="flex flex-col items-center gap-1 text-center">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl ring-4 ${
                  RARITY_RING[b.rarity]
                } ${b.owned ? '' : 'opacity-30 grayscale'}`}
              >
                🏅
              </div>
              <span className="text-[10px] font-bold text-ink/60">{b.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <CardTitle className="mb-3">Cửa hàng đổi XP</CardTitle>
        <div className="flex flex-col gap-3">
          {rewards?.map((r, i) => {
            const affordable = student.xp >= r.costXp;
            return (
              <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                <Card className="flex items-center gap-3">
                  <span className="text-3xl">🎀</span>
                  <div className="flex-1">
                    <p className="font-display font-bold text-ink">{r.name}</p>
                    <p className="text-xs text-ink/60">{r.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={affordable ? 'primary' : 'outline'}
                    disabled={!affordable || redeem.isPending}
                    onClick={() => redeem.mutate(r.id)}
                  >
                    {r.costXp} XP
                  </Button>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
