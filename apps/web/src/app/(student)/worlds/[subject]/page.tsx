'use client';

import Link from 'next/link';
import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Lock, Play } from 'lucide-react';
import { api } from '@/lib/api';
import { useActiveStudent } from '@/hooks/use-active-student';
import { Card, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Lesson {
  id: string;
  title: string;
  module: string;
  xpReward: number;
  estMinutes: number;
}
interface Course {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
}

export default function SubjectPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = use(params);
  const { data: student } = useActiveStudent();
  const [openId, setOpenId] = useState<string | null>(null);

  const { data: courses } = useQuery({
    queryKey: ['courses', subject, student?.grade],
    enabled: !!student,
    queryFn: () =>
      api.get<Course[]>(
        `/learning/courses?subject=${subject.toUpperCase()}&grade=${student!.grade}`,
      ),
  });

  const totalLessons = courses?.reduce((a, c) => a + c.lessons.length, 0) ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-extrabold capitalize text-ink">
        {subject} World
      </h1>
      {totalLessons > 0 && (
        <p className="-mt-2 text-sm font-bold text-ink/50">
          {totalLessons} bài học • {courses?.length} tập
        </p>
      )}

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

      {courses?.length === 0 && (
        <Card>
          <p className="text-ink/60">Nội dung đang được chuẩn bị. Quay lại sớm nhé! 🚧</p>
        </Card>
      )}

      {courses?.map((course, ci) => {
        const open = openId === course.id;
        return (
          <Card key={course.id} className="flex flex-col gap-0 p-0 overflow-hidden">
            <button
              onClick={() => setOpenId(open ? null : course.id)}
              className="flex items-center gap-3 p-4 text-left"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand/15 font-display text-lg font-extrabold text-brand">
                {ci + 1}
              </div>
              <div className="flex-1">
                <CardTitle>{course.title}</CardTitle>
                <p className="text-xs text-ink/50">{course.lessons.length} bài học</p>
              </div>
              <ChevronDown className={cn('h-5 w-5 text-ink/40 transition-transform', open && 'rotate-180')} />
            </button>

            {open && (
              <div className="flex flex-col gap-2 border-t-2 border-black/5 p-4">
                {course.lessons.map((lesson, idx) => (
                  <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                    <div className="flex items-center gap-3 rounded-xl border-2 border-black/5 bg-cloud p-3 transition-colors hover:border-brand">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white">
                        {idx === 0 ? <Play className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5 opacity-60" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-display text-sm font-bold text-ink">{lesson.title}</p>
                        <p className="text-[11px] text-ink/50">
                          {lesson.module} · {lesson.estMinutes}′ · +{lesson.xpReward} XP
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
