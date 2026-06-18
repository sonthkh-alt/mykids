import { Module } from '@nestjs/common';
import { LlmClientProvider } from './llm.provider';
import { PromptService } from './prompt.service';
import { AiTutorService } from './ai-tutor.service';
import { AiContentService } from './ai-content.service';
import { AiController } from './ai.controller';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [StudentsModule],
  controllers: [AiController],
  providers: [LlmClientProvider, PromptService, AiTutorService, AiContentService],
  // Export để Learning / Quests / Reports / Admin tái sử dụng.
  exports: [PromptService, AiContentService, AiTutorService],
})
export class AiModule {}
