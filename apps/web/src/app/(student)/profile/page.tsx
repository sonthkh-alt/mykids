'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { StudentProfileDto } from '@ai-academy/types';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useActiveStudent } from '@/hooks/use-active-student';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatsBar } from '@/components/gamification/stats-bar';

const INTEREST_SUGGESTIONS = ['Robot', 'Minecraft', 'Khủng long', 'Vũ trụ', 'Bóng đá', 'Vẽ', 'Âm nhạc'];

export default function ProfilePage() {
  const { logout } = useAuth();
  const { data: student } = useActiveStudent();
  const qc = useQueryClient();
  const [goal, setGoal] = useState('');

  const save = useMutation({
    mutationFn: (body: Partial<StudentProfileDto>) =>
      api.patch(`/students/${student!.id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['active-student'] }),
  });

  if (!student) return null;
  const interests = student.interests ?? [];

  function toggleInterest(topic: string) {
    const next = interests.includes(topic)
      ? interests.filter((t) => t !== topic)
      : [...interests, topic];
    save.mutate({ interests: next });
  }

  return (
    <div className="flex flex-col gap-5">
      <CardTitle className="text-2xl">Hồ sơ của tôi</CardTitle>
      <StatsBar level={student.level} xp={student.xp} streakDays={student.streakDays} />

      <Card className="flex flex-col gap-3">
        <CardTitle>Thông tin</CardTitle>
        <p className="font-body text-ink">
          <strong>Tên:</strong> {student.displayName}
        </p>
        <p className="font-body text-ink">
          <strong>Lớp:</strong> {student.grade}
        </p>
        <p className="font-body text-ink">
          <strong>Tiếng Anh:</strong> {student.englishLevel} · <strong>Toán:</strong>{' '}
          {student.mathLevel}
        </p>
      </Card>

      <Card className="flex flex-col gap-3">
        <CardTitle>Sở thích (giúp AI cá nhân hóa bài học)</CardTitle>
        <div className="flex flex-wrap gap-2">
          {INTEREST_SUGGESTIONS.map((t) => (
            <button
              key={t}
              onClick={() => toggleInterest(t)}
              className={`rounded-full px-3 py-1.5 text-sm font-bold transition-colors ${
                interests.includes(t)
                  ? 'bg-brand text-white'
                  : 'bg-black/5 text-ink/60'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <CardTitle>Mục tiêu của em</CardTitle>
        <Input
          placeholder="VD: Nói tiếng Anh tự tin..."
          value={goal || student.goal || ''}
          onChange={(e) => setGoal(e.target.value)}
        />
        <Button onClick={() => save.mutate({ goal })} disabled={save.isPending}>
          Lưu mục tiêu
        </Button>
      </Card>

      <Button variant="ghost" className="text-coral" onClick={logout}>
        Đăng xuất
      </Button>
    </div>
  );
}
