import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LlmClient } from '@ai-academy/ai';

export const LLM_CLIENT = Symbol('LLM_CLIENT');

/** Cung cấp LlmClient (OpenAI adapter) từ cấu hình môi trường. */
export const LlmClientProvider: Provider = {
  provide: LLM_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService) =>
    new LlmClient({
      apiKey: config.get<string>('openai.apiKey'),
      baseUrl: config.get<string>('openai.baseUrl'),
      defaultModel: config.getOrThrow<string>('openai.defaultModel'),
    }),
};
