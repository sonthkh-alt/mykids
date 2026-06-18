import type { ExerciseType, Subject } from '@prisma/client';

export interface SeedOption {
  text: string;
  correct: boolean;
}

export interface SeedQuestion {
  text: string;
  explanation: string;
  options: SeedOption[];
}

export interface SeedLesson {
  title: string;
  module: string;
  estMinutes: number;
  xpReward: number;
  type: ExerciseType;
  questions: SeedQuestion[];
}

export interface SeedCourse {
  subject: Subject;
  title: string;
  slug: string;
  description: string;
  gradeMin: number;
  gradeMax: number;
  lessons: SeedLesson[];
}

/** Trộn mảng (Fisher–Yates) — đặt đáp án đúng ở vị trí ngẫu nhiên. */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function mcQuestion(
  text: string,
  correct: string,
  distractors: string[],
  explanation: string,
): SeedQuestion {
  const options = shuffle([
    { text: correct, correct: true },
    ...distractors.slice(0, 3).map((d) => ({ text: d, correct: false })),
  ]);
  return { text, explanation, options };
}

export const rint = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;
