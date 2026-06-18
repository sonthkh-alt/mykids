'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { LearningStyle, ProficiencyLevel } from '@ai-academy/types';
import { api, ApiClientError } from '@/lib/api';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const INTERESTS = ['Robot', 'Minecraft', 'Khủng long', 'Vũ trụ', 'Bóng đá', 'Vẽ', 'Âm nhạc', 'Siêu anh hùng'];
const LEVELS: ProficiencyLevel[] = ['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'ADVANCED'];

export default function NewStudentPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    displayName: '',
    grade: 4,
    englishLevel: 'BEGINNER' as ProficiencyLevel,
    mathLevel: 'BEGINNER' as ProficiencyLevel,
    learningStyle: 'VISUAL' as LearningStyle,
    interests: [] as string[],
  });
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () => api.post('/students', form),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['parent-dashboard'] });
      router.push('/parent');
    },
    onError: (e) => setError(e instanceof ApiClientError ? e.message : 'Lỗi tạo hồ sơ'),
  });

  return (
    <div className="flex flex-col gap-5">
      <CardTitle className="text-2xl">Thêm hồ sơ con 🧒</CardTitle>
      <Card className="flex flex-col gap-4">
        <Input
          label="Tên hiển thị của con"
          value={form.displayName}
          onChange={(e) => setForm({ ...form, displayName: e.target.value })}
        />
        <div>
          <label className="font-display text-sm font-bold text-ink/70">Lớp</label>
          <div className="mt-2 flex gap-2">
            {[3, 4, 5, 6].map((g) => (
              <button
                key={g}
                onClick={() => setForm({ ...form, grade: g })}
                className={`h-12 flex-1 rounded-2xl font-display font-bold ${
                  form.grade === g ? 'bg-brand text-white' : 'bg-black/5 text-ink/60'
                }`}
              >
                Lớp {g}
              </button>
            ))}
          </div>
        </div>

        <SelectRow
          label="Trình độ Tiếng Anh"
          value={form.englishLevel}
          options={LEVELS}
          onChange={(v) => setForm({ ...form, englishLevel: v })}
        />
        <SelectRow
          label="Trình độ Toán"
          value={form.mathLevel}
          options={LEVELS}
          onChange={(v) => setForm({ ...form, mathLevel: v })}
        />

        <div>
          <label className="font-display text-sm font-bold text-ink/70">Sở thích của con</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {INTERESTS.map((t) => (
              <button
                key={t}
                onClick={() =>
                  setForm({
                    ...form,
                    interests: form.interests.includes(t)
                      ? form.interests.filter((x) => x !== t)
                      : [...form.interests, t],
                  })
                }
                className={`rounded-full px-3 py-1.5 text-sm font-bold ${
                  form.interests.includes(t) ? 'bg-grape text-white' : 'bg-black/5 text-ink/60'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm font-semibold text-coral">{error}</p>}
        <Button
          size="lg"
          disabled={!form.displayName || create.isPending}
          onClick={() => create.mutate()}
        >
          {create.isPending ? 'Đang tạo...' : 'Tạo hồ sơ'}
        </Button>
      </Card>
    </div>
  );
}

function SelectRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <label className="font-display text-sm font-bold text-ink/70">{label}</label>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`h-10 rounded-xl text-xs font-bold ${
              value === o ? 'bg-sky text-white' : 'bg-black/5 text-ink/60'
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
