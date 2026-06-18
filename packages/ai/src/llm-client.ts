import OpenAI from 'openai';
import { ZodSchema } from 'zod';

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmCallOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LlmResult {
  content: string;
  promptTokens?: number;
  completionTokens?: number;
}

export interface LlmClientConfig {
  apiKey?: string;
  baseUrl?: string;
  defaultModel: string;
}

/**
 * Adapter LLM provider-agnostic (hiện dùng OpenAI).
 * Tách khỏi NestJS để có thể tái dùng & test độc lập.
 */
export class LlmClient {
  private readonly client: OpenAI | null;
  private readonly defaultModel: string;

  constructor(config: LlmClientConfig) {
    this.defaultModel = config.defaultModel;
    this.client = config.apiKey
      ? new OpenAI({ apiKey: config.apiKey, baseURL: config.baseUrl })
      : null;
  }

  get isConfigured(): boolean {
    return this.client !== null;
  }

  async chat(messages: LlmMessage[], opts: LlmCallOptions = {}): Promise<LlmResult> {
    if (!this.client) {
      throw new Error(
        'OPENAI_API_KEY chưa được cấu hình — không thể gọi AI. Hãy đặt biến môi trường.',
      );
    }
    const res = await this.client.chat.completions.create({
      model: opts.model ?? this.defaultModel,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 800,
      messages,
    });
    const choice = res.choices[0];
    return {
      content: choice?.message?.content ?? '',
      promptTokens: res.usage?.prompt_tokens,
      completionTokens: res.usage?.completion_tokens,
    };
  }

  /**
   * Gọi LLM và ép kết quả về JSON theo schema Zod (structured output).
   * Dùng cho sinh quiz, câu hỏi đọc hiểu, báo cáo có cấu trúc.
   */
  async chatJson<T>(
    messages: LlmMessage[],
    schema: ZodSchema<T>,
    opts: LlmCallOptions = {},
  ): Promise<T> {
    if (!this.client) {
      throw new Error('OPENAI_API_KEY chưa được cấu hình.');
    }
    const res = await this.client.chat.completions.create({
      model: opts.model ?? this.defaultModel,
      temperature: opts.temperature ?? 0.4,
      max_tokens: opts.maxTokens ?? 1200,
      response_format: { type: 'json_object' },
      messages,
    });
    const raw = res.choices[0]?.message?.content ?? '{}';
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error('AI trả về JSON không hợp lệ.');
    }
    const result = schema.safeParse(parsed);
    if (!result.success) {
      throw new Error(`AI JSON sai schema: ${result.error.message}`);
    }
    return result.data;
  }
}
