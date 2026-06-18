import { Inject, Injectable } from '@nestjs/common';
import {
  buildPersonaContext,
  dailyQuestSetSchema,
  LlmClient,
  type LlmMessage,
  mathHintSchema,
  parentReportSchema,
  readingQuizSchema,
  storySchema,
  type DailyQuestSet,
  type GeneratedStory,
  type MathHint,
  type ParentReportAi,
  type ReadingQuiz,
} from '@ai-academy/ai';
import type { StudentPersona } from '@ai-academy/types';
import { PromptService } from './prompt.service';
import { LLM_CLIENT } from './llm.provider';

/**
 * AI Content generator — sinh nội dung CÓ CẤU TRÚC (JSON) cho các module:
 * quiz đọc hiểu, gợi ý toán từng bước, daily quest, báo cáo phụ huynh, truyện.
 * Dùng bởi Learning / Quests / Reports.
 */
@Injectable()
export class AiContentService {
  constructor(
    @Inject(LLM_CLIENT) private readonly llm: LlmClient,
    private readonly prompts: PromptService,
  ) {}

  get isConfigured(): boolean {
    return this.llm.isConfigured;
  }

  /** Sinh câu hỏi đọc hiểu từ một đoạn văn (Reading Coach AI). */
  async generateReadingQuiz(
    passage: string,
    persona: StudentPersona,
    count = 4,
  ): Promise<ReadingQuiz> {
    const prompt = await this.prompts.getByKey('READING_COACH');
    const messages: LlmMessage[] = [
      { role: 'system', content: `${prompt.systemPrompt}\n\n${buildPersonaContext(persona)}` },
      {
        role: 'user',
        content: `Tạo ${count} câu hỏi đọc hiểu (mỗi câu 4 lựa chọn) cho đoạn văn sau. Trả JSON {"questions":[{text,options,correctIndex,explanation}]}.\n\nĐOẠN VĂN:\n${passage}`,
      },
    ];
    return this.llm.chatJson(messages, readingQuizSchema, {
      model: prompt.model,
      temperature: prompt.temperature,
      maxTokens: prompt.maxTokens,
    });
  }

  /** Gợi ý toán TỪNG BƯỚC, không lộ đáp án trừ khi reveal=true (Math Tutor AI). */
  async generateMathHints(
    problem: string,
    persona: StudentPersona,
    reveal = false,
  ): Promise<MathHint> {
    const prompt = await this.prompts.getByKey('MATH_TUTOR');
    const messages: LlmMessage[] = [
      { role: 'system', content: `${prompt.systemPrompt}\n\n${buildPersonaContext(persona)}` },
      {
        role: 'user',
        content: `Bài toán: "${problem}".
${reveal ? 'Em đã thử nhiều lần, hãy đưa đáp án cuối kèm giải thích.' : 'CHỈ đưa gợi ý từng bước, KHÔNG đáp án cuối.'}
Trả JSON {"hints":[...],"encouragement":"...","finalAnswerRevealed":${reveal},"finalAnswer":"..."}.`,
      },
    ];
    return this.llm.chatJson(messages, mathHintSchema, {
      model: prompt.model,
      temperature: prompt.temperature,
      maxTokens: prompt.maxTokens,
    });
  }

  /** Sinh bộ 5 daily quest cá nhân hóa (Daily Quest AI). */
  async generateDailyQuests(persona: StudentPersona): Promise<DailyQuestSet> {
    const prompt = await this.prompts.getByKey('DAILY_QUEST');
    const messages: LlmMessage[] = [
      { role: 'system', content: `${prompt.systemPrompt}\n\n${buildPersonaContext(persona)}` },
      {
        role: 'user',
        content:
          'Tạo đúng 5 nhiệm vụ cho hôm nay (ENGLISH, MATH, READING, MOVEMENT, CREATIVE). Trả JSON {"quests":[{type,title,description,rewardXp}]}.',
      },
    ];
    return this.llm.chatJson(messages, dailyQuestSetSchema, {
      model: prompt.model,
      temperature: prompt.temperature,
      maxTokens: prompt.maxTokens,
    });
  }

  /** Sinh báo cáo phụ huynh từ dữ liệu thống kê (Parent Report AI). */
  async generateParentReport(
    studentName: string,
    stats: { subject: string; minutes: number; accuracy: number }[],
    totalMinutes: number,
  ): Promise<ParentReportAi> {
    const prompt = await this.prompts.getByKey('PARENT_REPORT');
    const messages: LlmMessage[] = [
      { role: 'system', content: prompt.systemPrompt },
      {
        role: 'user',
        content: `Học sinh: ${studentName}. Tổng thời gian tuần: ${totalMinutes} phút.
Thống kê theo môn: ${JSON.stringify(stats)}.
Trả JSON {"summary","strengths":[],"weaknesses":[],"recommendations":[]}.`,
      },
    ];
    return this.llm.chatJson(messages, parentReportSchema, {
      model: prompt.model,
      temperature: prompt.temperature,
      maxTokens: prompt.maxTokens,
    });
  }

  /** Sáng tạo truyện cá nhân hóa (Story Creator AI). */
  async generateStory(
    theme: string,
    persona: StudentPersona,
    language: 'vi' | 'en' = 'vi',
  ): Promise<GeneratedStory> {
    const prompt = await this.prompts.getByKey('STORY_CREATOR');
    const messages: LlmMessage[] = [
      { role: 'system', content: `${prompt.systemPrompt}\n\n${buildPersonaContext(persona)}` },
      {
        role: 'user',
        content: `Viết truyện ${language === 'en' ? 'bằng tiếng Anh' : 'bằng tiếng Việt'} chủ đề "${theme}". Trả JSON {"title","paragraphs":[],"vocabulary":[{word,meaning}]}.`,
      },
    ];
    return this.llm.chatJson(messages, storySchema, {
      model: prompt.model,
      temperature: prompt.temperature,
      maxTokens: prompt.maxTokens,
    });
  }
}
