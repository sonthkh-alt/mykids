import { Module } from '@nestjs/common';
import { QuestsService } from './quests.service';
import { QuestsController } from './quests.controller';
import { QuestsListener } from './quests.listener';
import { StudentsModule } from '../students/students.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [StudentsModule, AiModule],
  controllers: [QuestsController],
  providers: [QuestsService, QuestsListener],
  exports: [QuestsService],
})
export class QuestsModule {}
