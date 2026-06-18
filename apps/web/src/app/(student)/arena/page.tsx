'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Lightbulb, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { useActiveStudent } from '@/hooks/use-active-student';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MathHint {
  hints: string[];
  encouragement: string;
  finalAnswerRevealed: boolean;
  finalAnswer?: string;
}

/** Đấu trường Toán — gia sư AI gợi ý TỪNG BƯỚC, chỉ lộ đáp án khi nhấn "Xem đáp án". */
export default function MathArenaPage() {
  const { data: student } = useActiveStudent();
  const [problem, setProblem] = useState('');

  const ask = useMutation({
    mutationFn: (reveal: boolean) =>
      api.post<MathHint>('/learning/math/hints', { studentId: student!.id, problem, reveal }),
  });

  const hint = ask.data;

  return (
    <div className="flex flex-col gap-5">
      <CardTitle className="text-2xl">Đấu trường Toán ➗</CardTitle>
      <Card className="flex flex-col gap-3">
        <p className="text-sm text-ink/60">
          Nhập bài toán, thầy AI sẽ gợi ý từng bước để con tự nghĩ ra đáp án nhé!
        </p>
        <textarea
          className="min-h-20 rounded-xl border-2 border-black/10 p-3 focus:border-brand focus:outline-none"
          placeholder="VD: Lan có 12 cái kẹo, cho bạn 5 cái. Lan còn bao nhiêu cái?"
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
        />
        <Button disabled={!problem || !student || ask.isPending} onClick={() => ask.mutate(false)}>
          <Lightbulb className="h-5 w-5" /> {ask.isPending ? 'Đang nghĩ...' : 'Xin gợi ý'}
        </Button>
      </Card>

      {hint && (
        <Card className="flex flex-col gap-3">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-grape" /> Gợi ý từ thầy AI
          </CardTitle>
          <ol className="flex flex-col gap-2">
            {hint.hints.map((h, i) => (
              <li key={i} className="rounded-xl bg-sky/10 p-3 text-sm text-ink">
                <span className="font-bold text-sky">Bước {i + 1}:</span> {h}
              </li>
            ))}
          </ol>
          <p className="font-body font-semibold text-brand">💚 {hint.encouragement}</p>

          {hint.finalAnswerRevealed ? (
            <div className="rounded-xl bg-brand/10 p-3 font-display font-bold text-ink">
              ✅ Đáp án: {hint.finalAnswer}
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => ask.mutate(true)} disabled={ask.isPending}>
              Con đã thử rồi — xem đáp án
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
