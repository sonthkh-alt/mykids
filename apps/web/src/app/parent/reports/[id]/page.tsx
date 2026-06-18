'use client';

import { use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PerformanceReportDto } from '@ai-academy/types';
import { api } from '@/lib/api';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface SavedReport {
  id: string;
  periodStart: string;
  periodEnd: string;
  totalMinutes: number;
  strengths: string[];
  weaknesses: string[];
  aiSummary: string;
  breakdown: { subject: string; minutes: number; accuracy: number }[];
}

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const qc = useQueryClient();

  const { data: reports } = useQuery({
    queryKey: ['reports', id],
    queryFn: () => api.get<SavedReport[]>(`/reports/${id}`),
  });

  const generate = useMutation({
    mutationFn: () => api.post<PerformanceReportDto>(`/reports/weekly/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reports', id] }),
  });

  const latest = reports?.[0];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <CardTitle className="text-2xl">Báo cáo học tập</CardTitle>
        <Button size="sm" onClick={() => generate.mutate()} disabled={generate.isPending}>
          {generate.isPending ? 'Đang tạo...' : 'Tạo báo cáo tuần'}
        </Button>
      </div>

      {!latest && (
        <Card>
          <p className="text-ink/60">
            Chưa có báo cáo. Nhấn &quot;Tạo báo cáo tuần&quot; để AI phân tích tiến độ của con.
          </p>
        </Card>
      )}

      {latest && (
        <>
          <Card className="bg-grape/10">
            <p className="mb-1 text-xs font-bold text-grape">🤖 Tóm tắt từ AI</p>
            <p className="font-body text-ink">{latest.aiSummary}</p>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-brand/10">
              <p className="text-sm font-bold text-brand">💪 Điểm mạnh</p>
              <ul className="mt-1 list-inside list-disc text-sm text-ink/70">
                {latest.strengths.length ? latest.strengths.map((s) => <li key={s}>{s}</li>) : <li>Đang thu thập</li>}
              </ul>
            </Card>
            <Card className="bg-coral/10">
              <p className="text-sm font-bold text-coral">📈 Cần cải thiện</p>
              <ul className="mt-1 list-inside list-disc text-sm text-ink/70">
                {latest.weaknesses.length ? latest.weaknesses.map((s) => <li key={s}>{s}</li>) : <li>Đang thu thập</li>}
              </ul>
            </Card>
          </div>

          <Card className="flex flex-col gap-3">
            <CardTitle>Chi tiết theo môn</CardTitle>
            {latest.breakdown.map((b) => (
              <div key={b.subject}>
                <div className="mb-1 flex justify-between text-sm font-bold text-ink/70">
                  <span>{b.subject}</span>
                  <span>{b.minutes} phút · {Math.round(b.accuracy * 100)}% đúng</span>
                </div>
                <Progress value={b.accuracy} />
              </div>
            ))}
            <p className="mt-2 text-right text-sm font-bold text-ink/50">
              Tổng: {latest.totalMinutes} phút
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
