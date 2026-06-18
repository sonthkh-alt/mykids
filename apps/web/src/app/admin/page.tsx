'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';

interface Overview {
  students: number;
  parents: number;
  lessons: number;
  aiConversations: number;
  lessonsCompleted: number;
  activeStudents: number;
}

const LABELS: Record<keyof Overview, string> = {
  students: 'Học sinh',
  parents: 'Phụ huynh',
  lessons: 'Bài học',
  aiConversations: 'Hội thoại AI',
  lessonsCompleted: 'Bài đã hoàn thành',
  activeStudents: 'Học sinh hoạt động',
};

export default function AdminOverview() {
  const { data } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => api.get<Overview>('/admin/overview'),
  });

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {data &&
        (Object.keys(LABELS) as (keyof Overview)[]).map((k) => (
          <Card key={k} className="text-center">
            <p className="font-display text-3xl font-extrabold text-brand">{data[k]}</p>
            <p className="text-sm font-bold text-ink/60">{LABELS[k]}</p>
          </Card>
        ))}
    </div>
  );
}
