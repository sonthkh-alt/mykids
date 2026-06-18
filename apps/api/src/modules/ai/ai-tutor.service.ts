import { Inject, Injectable } from '@nestjs/common';
import {
  buildPersonaContext,
  LlmClient,
  type LlmMessage,
} from '@ai-academy/ai';
import type {
  AiPromptKey,
  AiTutorResponseDto,
  Subject,
} from '@ai-academy/types';
import { PrismaService } from '../../core/prisma/prisma.service';
import { StudentsService } from '../students/students.service';
import { PromptService } from './prompt.service';
import { LLM_CLIENT } from './llm.provider';

const SUBJECT_TO_PROMPT: Record<Subject, AiPromptKey> = {
  ENGLISH: 'ENGLISH_TUTOR',
  MATH: 'MATH_TUTOR',
  SCIENCE: 'SCIENCE_TUTOR',
  CODING: 'CODING_TUTOR',
  READING: 'READING_COACH',
  LIFE_SKILLS: 'ENGLISH_TUTOR',
};

/** AI Tutor: chat có ngữ cảnh, cá nhân hóa, lưu toàn bộ hội thoại. */
@Injectable()
export class AiTutorService {
  constructor(
    @Inject(LLM_CLIENT) private readonly llm: LlmClient,
    private readonly prisma: PrismaService,
    private readonly prompts: PromptService,
    private readonly students: StudentsService,
  ) {}

  async chat(
    studentId: string,
    subject: Subject,
    message: string,
    conversationId?: string,
  ): Promise<AiTutorResponseDto> {
    const promptKey = SUBJECT_TO_PROMPT[subject];
    const [prompt, persona] = await Promise.all([
      this.prompts.getByKey(promptKey),
      this.students.getPersona(studentId),
    ]);

    // Lấy/khởi tạo hội thoại
    const conversation = conversationId
      ? await this.prisma.aiConversation.findUnique({
          where: { id: conversationId },
          include: { messages: { orderBy: { createdAt: 'asc' }, take: 20 } },
        })
      : await this.prisma.aiConversation.create({
          data: { studentId, promptKey, promptId: prompt.id, subject },
          include: { messages: true },
        });

    if (!conversation) {
      throw new Error('Không tìm thấy hội thoại.');
    }

    const history: LlmMessage[] = conversation.messages.map((m) => ({
      role: m.role.toLowerCase() as LlmMessage['role'],
      content: m.content,
    }));

    const messages: LlmMessage[] = [
      { role: 'system', content: `${prompt.systemPrompt}\n\n${buildPersonaContext(persona)}` },
      ...history,
      { role: 'user', content: message },
    ];

    const result = await this.llm.chat(messages, {
      model: prompt.model,
      temperature: prompt.temperature,
      maxTokens: prompt.maxTokens,
    });

    // Lưu cả tin nhắn người dùng và phản hồi AI
    await this.prisma.$transaction([
      this.prisma.aiMessage.create({
        data: { conversationId: conversation.id, role: 'USER', content: message },
      }),
      this.prisma.aiMessage.create({
        data: {
          conversationId: conversation.id,
          role: 'ASSISTANT',
          content: result.content,
          tokens: result.completionTokens,
        },
      }),
      this.prisma.aiConversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      }),
    ]);

    return { conversationId: conversation.id, message: result.content };
  }

  getConversation(id: string) {
    return this.prisma.aiConversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }

  listConversations(studentId: string) {
    return this.prisma.aiConversation.findMany({
      where: { studentId },
      orderBy: { updatedAt: 'desc' },
      take: 30,
    });
  }
}
