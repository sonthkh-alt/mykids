'use client';

import { Flame, Star, Trophy } from 'lucide-react';
import { getLevelProgress } from '@ai-academy/utils';
import { Progress } from '@/components/ui/progress';

interface StatsBarProps {
  level: number;
  xp: number;
  streakDays: number;
}

/** Thanh trạng thái gamification: Level + XP progress + Streak (Home header). */
export function StatsBar({ xp, streakDays }: StatsBarProps) {
  const p = getLevelProgress(xp);
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-3 shadow-pop">
      <div className="flex items-center gap-1.5 rounded-full bg-sun/20 px-3 py-1">
        <Trophy className="h-5 w-5 text-sun" />
        <span className="font-display font-bold text-ink">Lv {p.level}</span>
      </div>

      <div className="flex-1">
        <div className="mb-1 flex items-center gap-1 text-xs font-bold text-ink/60">
          <Star className="h-4 w-4 text-brand" />
          {p.xpIntoLevel} / {p.xpIntoLevel + p.xpForNextLevel} XP
        </div>
        <Progress value={p.progressRatio} />
      </div>

      <div className="flex items-center gap-1.5 rounded-full bg-coral/15 px-3 py-1">
        <Flame className="h-5 w-5 text-coral" />
        <span className="font-display font-bold text-coral">{streakDays}</span>
      </div>
    </div>
  );
}
