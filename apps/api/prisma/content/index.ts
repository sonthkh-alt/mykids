import { buildMath } from './math';
import { buildEnglishLessons } from './english';
import { buildCodingLessons } from './coding';
import { buildScienceLessons } from './science';
import { buildReadingLessons } from './reading';
import type { SeedCourse, SeedLesson } from './types';
import type { Subject } from '@prisma/client';

export type { SeedCourse } from './types';

const PER_COURSE = 40;

/** Chia 1 khóa lớn thành nhiều "Tập" để giao diện hiển thị nhẹ nhàng. */
function splitCourse(c: SeedCourse, per = PER_COURSE): SeedCourse[] {
  if (c.lessons.length <= per) return [c];
  const out: SeedCourse[] = [];
  for (let i = 0; i < c.lessons.length; i += per) {
    const n = Math.floor(i / per) + 1;
    out.push({ ...c, title: `${c.title} — Tập ${n}`, slug: `${c.slug}-t${n}`, lessons: c.lessons.slice(i, i + per) });
  }
  return out;
}

function wrap(
  subject: Subject,
  title: string,
  slug: string,
  description: string,
  lessons: SeedLesson[],
  gradeMin = 3,
  gradeMax = 6,
): SeedCourse {
  return { subject, title, slug, description, gradeMin, gradeMax, lessons };
}

/**
 * Toàn bộ chương trình học. Mục tiêu ~100 giờ MỖI môn.
 * `scale` nhân số lượng bài (mặc định 1).
 */
export function buildCurriculum(scale = 1): SeedCourse[] {
  const s = Math.max(1, scale);
  const courses: SeedCourse[] = [];

  // Toán: ~750 bài (4 lớp) ≈ 100 giờ
  for (const c of buildMath(30 * s, 8)) courses.push(...splitCourse(c));

  // Tiếng Anh: ~820 bài ≈ 100 giờ
  courses.push(...splitCourse(wrap('ENGLISH', 'Tiếng Anh theo chủ đề', 'english', 'Từ vựng 20 chủ đề + ngữ pháp vui: flashcard, quiz hai chiều.', buildEnglishLessons(870 * s))));

  // Khoa học: ~750 bài ≈ 100 giờ
  courses.push(...splitCourse(wrap('SCIENCE', 'Thế giới Khoa học kỳ thú', 'science', 'Động vật, vũ trụ, cơ thể người, vật liệu & thí nghiệm.', buildScienceLessons(750 * s))));

  // Lập trình/Logic: ~750 bài ≈ 100 giờ
  courses.push(...splitCourse(wrap('CODING', 'Lập trình & Tư duy Logic', 'coding', 'Dãy số, quy luật, điều kiện, vòng lặp, giải đố.', buildCodingLessons(750 * s))));

  // Đọc hiểu: ~600 bài ≈ 100 giờ
  courses.push(...splitCourse(wrap('READING', 'Đọc hiểu & Truyện hay', 'reading', 'Truyện ngắn kèm câu hỏi đọc hiểu rèn tư duy.', buildReadingLessons(600 * s))));

  return courses;
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
