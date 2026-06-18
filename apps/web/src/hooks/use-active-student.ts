'use client';

import { useQuery } from '@tanstack/react-query';
import type { StudentProfileDto } from '@ai-academy/types';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

/**
 * Lấy hồ sơ học sinh "đang hoạt động":
 * - STUDENT: chính mình (activeStudentId)
 * - PARENT: con đầu tiên (demo; có thể mở rộng cho phép chọn con)
 */
export function useActiveStudent() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['active-student', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<StudentProfileDto | null> => {
      if (user?.activeStudentId) {
        return api.get<StudentProfileDto>(`/students/${user.activeStudentId}`);
      }
      if (user?.role === 'PARENT') {
        const list = await api.get<StudentProfileDto[]>('/students');
        return list[0] ?? null;
      }
      return null;
    },
  });
}
