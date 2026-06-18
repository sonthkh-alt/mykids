import { buildMath } from './math';
import { buildEnglish } from './english';
import {
  buildCodingCourse,
  buildReadingCourse,
  buildScienceCourse,
} from './others';
import type { SeedCourse } from './types';

export type { SeedCourse } from './types';

/**
 * Xây toàn bộ chương trình học mẫu.
 * `scale` nhân số lượng bài (mặc định 1). Toán sinh procedural nên đạt dung lượng lớn nhất.
 */
export function buildCurriculum(scale = 1): SeedCourse[] {
  const s = Math.max(1, scale);
  return [
    ...buildMath(30 * s, 8), // ~750 bài Toán (4 lớp) ≈ 100 giờ luyện tập
    ...buildEnglish(10 * s), // từ vựng theo chủ đề (flashcard + quiz)
    buildScienceCourse(),
    buildCodingCourse(150 * s, 8),
    buildReadingCourse(),
  ];
}

export function curriculumStats(courses: SeedCourse[]) {
  let lessons = 0;
  let questions = 0;
  let minutes = 0;
  const bySubject: Record<string, { lessons: number; minutes: number }> = {};
  for (const c of courses) {
    for (const l of c.lessons) {
      lessons += 1;
      questions += l.questions.length;
      minutes += l.estMinutes;
      const b = (bySubject[c.subject] ??= { lessons: 0, minutes: 0 });
      b.lessons += 1;
      b.minutes += l.estMinutes;
    }
  }
  return { lessons, questions, hours: Math.round(minutes / 60), bySubject };
}
