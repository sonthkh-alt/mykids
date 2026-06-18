'use client';

import { use, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import type { XpEventResult } from '@ai-academy/types';
import { api } from '@/lib/api';
import { useActiveStudent } from '@/hooks/use-active-student';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Celebrate } from '@/components/gamification/celebrate';

interface Option { id: string; text: string }
interface Question {
  id: string;
  text: string;
  explanation?: string;
  answerOptions: Option[];
}
interface Exercise { id: string; prompt: string; questions: Question[] }
interface Lesson {
  id: string;
  title: string;
  exercises: Exercise[];
  course?: { subject: string };
}

type SubmitResult = XpEventResult & { correct: number; total: number };

export default function LessonPlayer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const { data: student } = useActiveStudent();

  const { data: lesson } = useQuery({
    queryKey: ['lesson', id],
    queryFn: () => api.get<Lesson>(`/learning/lessons/${id}`),
  });

  const questions = useMemo(
    () => lesson?.exercises.flatMap((e) => e.questions.map((q) => ({ ...q, exerciseId: e.id }))) ?? [],
    [lesson],
  );

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<SubmitResult | null>(null);

  const submit = useMutation({
    mutationFn: (payload: { exerciseId: string; answers: { questionId: string; response: string }[] }) =>
      api.post<SubmitResult>(`/learning/exercises/${payload.exerciseId}/submit`, {
        studentId: student!.id,
        answers: payload.answers,
      }),
    onSuccess: (res) => {
      setResult(res);
      void qc.invalidateQueries({ queryKey: ['active-student'] });
    },
  });

  if (!lesson || !student) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  const q = questions[idx];
  if (!q) {
    return (
      <div className="flex flex-col items-center gap-4 pt-16 text-center">
        <p className="text-5xl">📚</p>
        <p className="font-display text-lg text-ink/70">Bài học chưa có câu hỏi.</p>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </div>
    );
  }

  const isCorrectChoice = (optId: string) =>
    checked && selected === optId; // hiển thị chọn; đáp án đúng do server xác định

  function onCheck() {
    if (selected == null) return;
    setAnswers((a) => ({ ...a, [q.id]: selected }));
    setChecked(true);
  }

  function onNext() {
    if (!lesson || selected == null) return;
    const last = idx === questions.length - 1;
    if (!last) {
      setIdx((i) => i + 1);
      setSelected(null);
      setChecked(false);
      return;
    }
    // Nộp toàn bộ — gộp theo exercise (ở đây mỗi lesson seed 1 exercise).
    const exerciseId = lesson.exercises[0]?.id;
    if (!exerciseId) return;
    const all = { ...answers, [q.id]: selected };
    submit.mutate({
      exerciseId,
      answers: Object.entries(all).map(([questionId, response]) => ({ questionId, response })),
    });
  }

  return (
    <div className="flex min-h-[80vh] flex-col gap-5">
      <header className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-ink/50">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="flex-1">
          <Progress value={(idx + (checked ? 1 : 0)) / questions.length} />
        </div>
        <span className="text-sm font-bold text-ink/50">
          {idx + 1}/{questions.length}
        </span>
      </header>

      <h1 className="font-display text-xl font-extrabold text-ink">{lesson.title}</h1>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="flex flex-1 flex-col gap-4"
        >
          <p className="font-display text-lg font-bold text-ink">{q.text}</p>

          <div className="flex flex-col gap-3">
            {q.answerOptions.map((opt) => {
              const isSel = selected === opt.id;
              return (
                <button
                  key={opt.id}
                  disabled={checked}
                  onClick={() => setSelected(opt.id)}
                  className={`flex items-center justify-between rounded-2xl border-2 p-4 text-left font-body font-semibold transition-all ${
                    isSel
                      ? 'border-brand bg-brand/10 text-ink'
                      : 'border-black/10 bg-white text-ink/80'
                  }`}
                >
                  {opt.text}
                  {isCorrectChoice(opt.id) && <Check className="h-5 w-5 text-brand" />}
                </button>
              );
            })}
          </div>

          {checked && q.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-sky/10 p-3 text-sm text-ink/70"
            >
              💡 {q.explanation}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="sticky bottom-24">
        {!checked ? (
          <Button className="w-full" size="lg" disabled={selected == null} onClick={onCheck}>
            Kiểm tra
          </Button>
        ) : (
          <Button className="w-full" size="lg" onClick={onNext} disabled={submit.isPending}>
            {idx === questions.length - 1 ? (submit.isPending ? 'Đang nộp...' : 'Hoàn thành 🎉') : 'Tiếp theo →'}
          </Button>
        )}
      </div>

      <Celebrate
        result={result}
        onClose={() => {
          setResult(null);
          const subject = lesson.course?.subject?.toLowerCase();
          router.push(subject ? `/worlds/${subject}` : '/home');
        }}
      />
    </div>
  );
}
