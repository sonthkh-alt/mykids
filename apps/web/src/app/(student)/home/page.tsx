'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import type { DailyQuestDto } from '@ai-academy/types';
import { api } from '@/lib/api';
import { useActiveStudent } from '@/hooks/use-active-student';
import { StatsBar } from '@/components/gamification/stats-bar';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const QUEST_EMOJI: Record<string, string> = {
  ENGLISH: '🔤',
  MATH: '➗',
  READING: '📖',
  MOVEMENT: '🏃',
  CREATIVE: '🎨',
};

// Nhiệm vụ học thuật -> tự hoàn thành khi học xong 1 bài ở World tương ứng.
const QUEST_WORLD: Record<string, string> = {
  ENGLISH: '/worlds/english',
  MATH: '/worlds/math',
  READING: '/worlds/reading',
};

export default function HomePage() {
  const { data: student } = useActiveStudent();
  const qc = useQueryClient();

  const { data: quests } = useQuery({
    queryKey: ['quests', student?.id],
    enabled: !!student,
    queryFn: () => api.get<DailyQuestDto[]>(`/quests/today/${student!.id}`),
  });

  const complete = useMutation({
    mutationFn: (id: string) => api.post(`/quests/${id}/complete`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['quests', student?.id] });
      void qc.invalidateQueries({ queryKey: ['active-student'] });
    },
  });

  if (!student) return null;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-grape text-2xl text-white shadow-pop">
          {student.displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-body text-sm text-ink/60">Xin chào,</p>
          <h1 className="font-display text-xl font-extrabold text-ink">
            {student.displayName} 👋
          </h1>
        </div>
      </header>

      <StatsBar level={student.level} xp={student.xp} streakDays={student.streakDays} />

      <section>
        <CardTitle className="mb-1 flex items-center gap-2">
          🎯 Nhiệm vụ hôm nay
        </CardTitle>
        <p className="mb-3 text-xs text-ink/50">
          Nhiệm vụ Anh/Toán/Đọc tự hoàn thành khi con học xong 1 bài. Vận động & Sáng tạo thì bấm “Đã làm”.
        </p>
        <div className="flex flex-col gap-3">
          {quests?.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="flex items-center gap-3">
                <span className="text-2xl">{QUEST_EMOJI[q.type] ?? '⭐'}</span>
                <div className="flex-1">
                  <p className="font-display font-bold text-ink">{q.title}</p>
                  <p className="text-sm text-ink/60">{q.description}</p>
                  <span className="text-xs font-bold text-brand">+{q.rewardXp} XP</span>
                </div>
                {q.status === 'COMPLETED' ? (
                  <CheckCircle2 className="h-7 w-7 text-brand" />
                ) : QUEST_WORLD[q.type] ? (
                  // Học thuật: bấm vào học, hệ thống TỰ hoàn thành khi xong 1 bài.
                  <Link href={QUEST_WORLD[q.type]!}>
                    <Button size="sm">
                      Học ngay <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  // Ngoài đời (Vận động/Sáng tạo): phụ huynh/bé xác nhận đã làm.
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => complete.mutate(q.id)}
                    disabled={complete.isPending}
                  >
                    Đã làm
                  </Button>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
