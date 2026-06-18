'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Prompt {
  id: string;
  key: string;
  name: string;
  description?: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  version: number;
  isActive: boolean;
}

export default function PromptsAdmin() {
  const qc = useQueryClient();
  const { data: prompts } = useQuery({
    queryKey: ['admin-prompts'],
    queryFn: () => api.get<Prompt[]>('/admin/prompts'),
  });
  const [editing, setEditing] = useState<Record<string, Partial<Prompt>>>({});

  const save = useMutation({
    mutationFn: ({ key, body }: { key: string; body: Partial<Prompt> }) =>
      api.patch(`/admin/prompts/${key}`, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-prompts'] });
      setEditing({});
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-ink/60">
        Chỉnh sửa prompt AI. Thay đổi áp dụng ngay (cache 5 phút), tăng version để theo dõi.
      </p>
      {prompts?.map((p) => {
        const draft = editing[p.key] ?? {};
        return (
          <Card key={p.id} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <CardTitle>
                {p.name}{' '}
                <span className="text-xs font-normal text-ink/40">v{p.version} · {p.model}</span>
              </CardTitle>
            </div>
            <textarea
              className="min-h-32 rounded-xl border-2 border-black/10 p-3 font-mono text-sm focus:border-brand focus:outline-none"
              defaultValue={p.systemPrompt}
              onChange={(e) =>
                setEditing((s) => ({ ...s, [p.key]: { ...draft, systemPrompt: e.target.value } }))
              }
            />
            <div className="flex items-center gap-3">
              <label className="text-sm font-bold text-ink/60">
                Temp:
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  defaultValue={p.temperature}
                  className="ml-2 w-20 rounded-lg border-2 border-black/10 px-2 py-1"
                  onChange={(e) =>
                    setEditing((s) => ({
                      ...s,
                      [p.key]: { ...draft, temperature: Number(e.target.value) },
                    }))
                  }
                />
              </label>
              <Button
                size="sm"
                disabled={save.isPending || !editing[p.key]}
                onClick={() => save.mutate({ key: p.key, body: editing[p.key]! })}
              >
                Lưu
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
