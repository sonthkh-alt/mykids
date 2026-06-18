import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { GamificationService } from './gamification.service';

/**
 * Lắng nghe domain events và quy đổi thành XP.
 * Tách rời gamification khỏi quests (Open/Closed Principle).
 *
 * Lưu ý: XP cho hoàn thành bài học (LESSON_COMPLETED) được LearningService
 * cộng đồng bộ để trả kết quả ăn mừng ngay cho UI, nên không xử lý ở đây.
 */
@Injectable()
export class GamificationListener {
  constructor(private readonly gamification: GamificationService) {}

  @OnEvent('quest.completed')
  async onQuestCompleted(e: {
    studentId: string;
    questId: string;
    rewardXp: number;
  }): Promise<void> {
    await this.gamification.grantXp(e.studentId, e.rewardXp, 'QUEST_COMPLETED', {
      type: 'quest',
      id: e.questId,
    });
  }
}
