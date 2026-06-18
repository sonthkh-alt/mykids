import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { AiPrompt } from '@prisma/client';
import { DEFAULT_PROMPTS } from '@ai-academy/ai';
import type { AiPromptKey } from '@ai-academy/types';
import { PrismaService } from '../../core/prisma/prisma.service';
import { RedisService } from '../../core/redis/redis.service';
import { UpdatePromptDto } from './dto/update-prompt.dto';

/**
 * Prompt Management — lưu prompt trong DB, cache Redis, seed mặc định khi rỗng.
 * Admin Panel chỉnh sửa qua updateByKey().
 */
@Injectable()
export class PromptService implements OnModuleInit {
  private readonly cacheKey = (key: string) => `prompt:${key}`;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /** Seed prompt mặc định nếu DB chưa có (idempotent). */
  async onModuleInit(): Promise<void> {
    for (const p of DEFAULT_PROMPTS) {
      await this.prisma.aiPrompt.upsert({
        where: { key: p.key },
        update: {}, // không ghi đè bản đã chỉnh tay
        create: {
          key: p.key,
          name: p.name,
          description: p.description,
          systemPrompt: p.systemPrompt,
          model: p.model,
          temperature: p.temperature,
          maxTokens: p.maxTokens,
        },
      });
    }
  }

  async getByKey(key: AiPromptKey): Promise<AiPrompt> {
    const cached = await this.redis.getJson<AiPrompt>(this.cacheKey(key));
    if (cached) return cached;
    const prompt = await this.prisma.aiPrompt.findUnique({ where: { key } });
    if (!prompt) throw new NotFoundException(`Không tìm thấy prompt: ${key}`);
    await this.redis.setJson(this.cacheKey(key), prompt, 300);
    return prompt;
  }

  list(): Promise<AiPrompt[]> {
    return this.prisma.aiPrompt.findMany({ orderBy: { key: 'asc' } });
  }

  async updateByKey(key: AiPromptKey, dto: UpdatePromptDto): Promise<AiPrompt> {
    const existing = await this.prisma.aiPrompt.findUnique({ where: { key } });
    if (!existing) throw new NotFoundException(`Không tìm thấy prompt: ${key}`);
    const updated = await this.prisma.aiPrompt.update({
      where: { key },
      data: { ...dto, version: { increment: 1 } },
    });
    await this.redis.del(this.cacheKey(key));
    return updated;
  }
}
