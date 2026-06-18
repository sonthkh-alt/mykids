'use client';

import Link from 'next/link';
import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, Lock, Play, Star } from 'lucide-react';
import { api } from '@/lib/api';
import { useActiveStudent } from '@/hooks/use-active-student';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface PathLesson {
  id: string;
  title: string;
  module: string;
  estMinutes: number;
  xpReward: number;
  completed: boolean;
  unlocked: boolean;
}
interface PathUnit {
  title: string;
  lessons: PathLesson[];
}
interface PathData {
  subject: string;
  grade: number;
  total: number;
  completed: number;
  currentLessonId: string | null;
  units: PathUnit[];
}

export default function SubjectPathPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = use(params);
  const { data: student } = useActiveStudent();
  const [grade, setGrade] = useState<number | null>(null);
  const activeGrade = grade ?? student?.grade ?? 4;

  const { data: path } = useQuery({
    queryKey: ['path', subject, activeGrade, student?.id],
    enabled: !!student,
    queryFn: () =>
      api.get<PathData>(
        `/learning/path?subject=${subject.toUpperCase()}&grade=${activeGrade}&studentId=${student!.id}`,
      ),
  });

  const ratio = path && path.total ? path.completed / path.total : 0;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-extrabold capitalize text-ink">
        {subject} World
      </h1>

      {/* Tiến độ */}
      {path && path.total > 0 && (
        <div className="rounded-2xl bg-white p-3 shadow-pop">
          <div className="mb-1 flex items-center justify-between text-sm font-bold text-ink/60">
            <span>Tiến độ lộ trình</span>
            <span>{path.completed}/{path.total} bài</span>
          </div>
          <Progress value={ratio} />
        </div>
      )}

      {/* Độ khó */}
      <div className="rounded-2xl bg-white p-3 shadow-pop">
        <p className="mb-2 text-sm font-bold text-ink/70">
          🎚️ Độ khó — bấm để đổi <span className="font-normal text-ink/40">(lớp càng cao càng khó)</span>
        </p>
        <div className="flex gap-2">
          {[3, 4, 5, 6].map((g) => (
            <button
              key={g}
              onClick={() => setGrade(g)}
              className={cn(
                'h-11 flex-1 rounded-xl font-display text-sm font-bold transition-colors',
                activeGrade === g ? 'bg-brand text-white shadow-pop' : 'bg-black/5 text-ink/60 hover:bg-black/10',
              )}
            >
              Lớp {g}
            </button>
          ))}
        </div>
      </div>

      {subject.toLowerCase() === 'math' && (
        <Link href="/arena">
          <div className="flex items-center gap-3 rounded-2xl bg-coral p-4 text-white shadow-pop">
            <span className="text-3xl">⚔️</span>
            <div>
              <p className="font-display font-extrabold">Đấu trường Toán</p>
              <p className="text-sm opacity-90">Giải toán với gợi ý AI từng bước</p>
            </div>
          </div>
        </Link>
      )}

      {/* Nút tiếp tục */}
      {path?.currentLessonId && (
        <Link href={`/lessons/${path.currentLessonId}`}>
          <Button size="lg" className="w-full">
            <Play className="h-5 w-5" /> {path.completed > 0 ? 'Tiếp tục học' : 'Bắt đầu học'}
          </Button>
        </Link>
      )}
      {path && path.currentLessonId === null && path.total > 0 && (
        <div className="rounded-2xl bg-brand/10 p-4 text-center font-display font-bold text-brand">
          🏆 Hoàn thành toàn bộ lộ trình Lớp {activeGrade}! Thử lớp cao hơn nhé.
        </div>
      )}

      {path?.total === 0 && (
        <Card>
          <p className="text-ink/60">Nội dung đang được chuẩn bị. 🚧</p>
        </Card>
      )}

      {/* Lộ trình uốn lượn (Duolingo-style) */}
      {path?.units.map((unit, ui) => (
        <section key={`${unit.title}-${ui}`} className="mt-2">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full bg-grape px-4 py-1.5 font-display text-sm font-extrabold text-white shadow-pop">
              {unit.title}
            </span>
            <span className="text-xs font-bold text-ink/40">
              {unit.lessons.filter((l) => l.completed).length}/{unit.lessons.length}
            </span>
          </div>

          <div className="flex flex-col items-center gap-3 py-1">
            {unit.lessons.map((lesson, i) => {
              const state = lesson.completed ? 'done' : lesson.unlocked ? 'current' : 'locked';
              const offset = Math.round(Math.sin(i * 0.9) * 64); // đường đi uốn lượn
              const node = (
                <div
                  className="flex flex-col items-center"
                  style={{ transform: `translateX(${offset}px)` }}
                >
                  {state === 'current' && (
                    <span className="mb-1 animate-bounce rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold text-white">
                      BẮT ĐẦU
                    </span>
                  )}
                  <div
                    className={cn(
                      'flex h-16 w-16 items-center justify-center rounded-full border-b-4 transition-transform',
                      state === 'done' && 'border-brand-dark bg-brand text-white',
                      state === 'current' && 'border-yellow-500 bg-sun text-ink ring-4 ring-sun/40 active:translate-y-1',
                      state === 'locked' && 'border-black/10 bg-black/10 text-ink/30',
                    )}
                  >
                    {state === 'done' && <Check className="h-7 w-7" />}
                    {state === 'current' && <Star className="h-7 w-7" />}
                    {state === 'locked' && <Lock className="h-6 w-6" />}
                  </div>
                </div>
              );
              return state === 'locked' ? (
                <div key={lesson.id} title="Hoàn thành bài trước để mở khóa">
                  {node}
                </div>
              ) : (
                <Link key={lesson.id} href={`/lessons/${lesson.id}`} aria-label={lesson.title}>
                  {node}
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
