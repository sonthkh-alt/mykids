import { Module } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { GamificationListener } from './gamification.listener';
import { RewardsService } from './rewards.service';
import { GamificationController } from './gamification.controller';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [StudentsModule],
  controllers: [GamificationController],
  providers: [GamificationService, GamificationListener, RewardsService],
  exports: [GamificationService, RewardsService],
})
export class GamificationModule {}
