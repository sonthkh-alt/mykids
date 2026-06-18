'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { StudentProfileDto } from '@ai-academy/types';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { activeStudentStore } from '@/lib/active-student';

/**
 * Hồ sơ học sinh "đang hoạt động":
 * - STUDENT: chính mình.
 * - PARENT: con được chọn (activeStudentStore), mặc định con đầu tiên.
 */
export function useActiveStudent() {
  const { user } = useAuth();
  const [activeId, setActiveId] = useState<string | null>(null);

  // Đọc lựa chọn hiện tại + lắng nghe khi phụ huynh đổi con.
  useEffect(() => {
    setActiveId(activeStudentStore.get());
    const onChange = (e: Event) => setActiveId((e as CustomEvent<string>).detail);
    window.addEventListener('active-student-changed', onChange);
    return () => window.removeEventListener('active-student-changed', onChange);
  }, []);

  return useQuery({
    queryKey: ['active-student', user?.id, activeId],
    enabled: !!user,
    queryFn: async (): Promise<StudentProfileDto | null> => {
      if (user?.role === 'PARENT') {
        if (activeId) {
          try {
            return await api.get<StudentProfileDto>(`/students/${activeId}`);
          } catch {
            /* con không hợp lệ -> rơi về con đầu tiên */
          }
        }
        const list = await api.get<StudentProfileDto[]>('/students');
        return list[0] ?? null;
      }
      if (user?.activeStudentId) {
        return api.get<StudentProfileDto>(`/students/${user.activeStudentId}`);
      }
      return null;
    },
  });
}
