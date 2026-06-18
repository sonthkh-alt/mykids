import { z } from 'zod';

/** Schema cho output có cấu trúc từ AI (structured output). */

export const generatedQuestionSchema = z.object({
  text: z.string(),
  options: z.array(z.string()).min(2).max(6),
  correctIndex: z.number().int().min(0),
  explanation: z.string(),
});
export type GeneratedQuestion = z.infer<typeof generatedQuestionSchema>;

export const readingQuizSchema = z.object({
  questions: z.array(generatedQuestionSchema).min(1).max(8),
});
export type ReadingQuiz = z.infer<typeof readingQuizSchema>;

export const mathHintSchema = z.object({
  hints: z.array(z.string()).min(1).max(5), // gợi ý từng bước, KHÔNG đáp án
  encouragement: z.string(),
  finalAnswerRevealed: z.boolean(),
  finalAnswer: z.string().optional(),
});
export type MathHint = z.infer<typeof mathHintSchema>;

export const dailyQuestSetSchema = z.object({
  quests: z
    .array(
      z.object({
        type: z.enum(['ENGLISH', 'MATH', 'READING', 'MOVEMENT', 'CREATIVE']),
        title: z.string(),
        description: z.string(),
        rewardXp: z.number().int().min(5).max(50),
      }),
    )
    .length(5),
});
export type DailyQuestSet = z.infer<typeof dailyQuestSetSchema>;

export const parentReportSchema = z.object({
  summary: z.string(),
  strengths: z.array(z.string()).max(6),
  weaknesses: z.array(z.string()).max(6),
  recommendations: z.array(z.string()).max(6),
});
export type ParentReportAi = z.infer<typeof parentReportSchema>;

export const storySchema = z.object({
  title: z.string(),
  paragraphs: z.array(z.string()).min(2).max(10),
  vocabulary: z.array(z.object({ word: z.string(), meaning: z.string() })).max(10),
});
export type GeneratedStory = z.infer<typeof storySchema>;
