import type { Subject } from '@ai-academy/types';

export const LESSON_COMPLETED = 'lesson.completed';

/** Domain event phát khi học sinh hoàn thành 1 bài học/bài tập. */
export interface LessonCompletedEvent {
  studentId: string;
  lessonId: string;
  subject: Subject;
  accuracy: number; // 0..1
  minutes: number;
  baseXp: number;
}
