'use client';

import Link from 'next/link';
import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Lock, Play } from 'lucide-react';
import { api } from '@/lib/api';
import { useActiveStudent } from '@/hooks/use-active-student';
import { Card, CardTitle } from '@/components/ui/card';

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

  const { data: courses } = useQuery({
    queryKey: ['courses', subject, student?.grade],
    enabled: !!student,
    queryFn: () =>
      api.get<Course[]>(
        `/learning/courses?subject=${subject.toUpperCase()}&grade=${student!.grade}`,
      ),
  });

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-display text-2xl font-extrabold capitalize text-ink">
        {subject} World
      </h1>

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

      {courses?.map((course) => (
        <Card key={course.id} className="flex flex-col gap-3">
          <CardTitle>{course.title}</CardTitle>
          {course.description && <p className="text-sm text-ink/60">{course.description}</p>}
          <div className="flex flex-col gap-2">
            {course.lessons.map((lesson, idx) => (
              <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                <div className="flex items-center gap-3 rounded-xl border-2 border-black/5 bg-cloud p-3 transition-colors hover:border-brand">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white">
                    {idx === 0 ? <Play className="h-5 w-5" /> : <Lock className="h-4 w-4 opacity-60" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-display font-bold text-ink">{lesson.title}</p>
                    <p className="text-xs text-ink/50">
                      {lesson.module} · {lesson.estMinutes} phút · +{lesson.xpReward} XP
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
