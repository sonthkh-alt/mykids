import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { localDateKey } from '@ai-academy/utils';
import type { DailyQuestDto, QuestType, Subject } from '@ai-academy/types';

/** Hoàn thành 1 bài học môn này sẽ tự hoàn thành nhiệm vụ tương ứng. */
const SUBJECT_TO_QUEST: Partial<Record<Subject, QuestType>> = {
  ENGLISH: 'ENGLISH',
  MATH: 'MATH',
  READING: 'READING',
};
import { PrismaService } from '../../core/prisma/prisma.service';
import { StudentsService } from '../students/students.service';
import { AiContentService } from '../ai/ai-content.service';

/** Bộ quest dự phòng khi AI chưa cấu hình — đảm bảo luôn có nhiệm vụ. */
const FALLBACK_QUESTS: { type: QuestType; title: string; description: string; rewardXp: number }[] = [
  { type: 'ENGLISH', title: 'Học 5 từ vựng mới', description: 'Mở English World và học 5 từ mới hôm nay.', rewardXp: 15 },
  { type: 'MATH', title: 'Giải 5 bài tính nhẩm', description: 'Vào Math World luyện tính nhẩm.', rewardXp: 15 },
  { type: 'READING', title: 'Đọc 1 truyện ngắn', description: 'Đọc và trả lời câu hỏi đọc hiểu.', rewardXp: 15 },
  { type: 'MOVEMENT', title: 'Vận động 10 phút', description: 'Nhảy dây, chạy bộ hoặc tập thể dục.', rewardXp: 10 },
  { type: 'CREATIVE', title: 'Vẽ hoặc kể 1 ý tưởng', description: 'Sáng tạo điều gì đó vui hôm nay!', rewardXp: 10 },
];

@Injectable()
export class QuestsService {
  private readonly logger = new Logger(QuestsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly students: StudentsService,
    private readonly aiContent: AiContentService,
    private readonly events: EventEmitter2,
  ) {}

  /** Lấy quest hôm nay; nếu chưa có thì sinh (AI hoặc fallback). */
  async getToday(studentId: string): Promise<DailyQuestDto[]> {
    const student = await this.prisma.student.findUniqueOrThrow({
      where: { id: studentId },
    });
    const dateKey = localDateKey(new Date(), student.timeZone);

    const existing = await this.prisma.studentDailyQuest.findMany({
      where: { studentId, dateKey },
      include: { quest: true },
      orderBy: { createdAt: 'asc' },
    });
    if (existing.length > 0) {
      return existing.map((sq) => ({
        id: sq.id,
        type: sq.quest.type,
        title: sq.quest.title,
        description: sq.quest.description,
        rewardXp: sq.quest.rewardXp,
        status: sq.status,
      }));
    }
    return this.generate(studentId, dateKey);
  }

  private async generate(studentId: string, dateKey: string): Promise<DailyQuestDto[]> {
    let specs = FALLBACK_QUESTS;
    if (this.aiContent.isConfigured) {
      try {
        const persona = await this.students.getPersona(studentId);
        const ai = await this.aiContent.generateDailyQuests(persona);
        specs = ai.quests;
      } catch (e) {
        this.logger.warn(`AI sinh quest lỗi, dùng fallback: ${(e as Error).message}`);
      }
    }

    const created: DailyQuestDto[] = [];
    for (const spec of specs) {
      const quest = await this.prisma.dailyQuest.create({
        data: {
          type: spec.type,
          title: spec.title,
          description: spec.description,
          rewardXp: spec.rewardXp,
          dateKey,
          studentId,
          generatedByAi: this.aiContent.isConfigured,
        },
      });
      const sq = await this.prisma.studentDailyQuest.create({
        data: { studentId, questId: quest.id, dateKey },
      });
      created.push({
        id: sq.id,
        type: quest.type,
        title: quest.title,
        description: quest.description,
        rewardXp: quest.rewardXp,
        status: sq.status,
      });
    }
    return created;
  }

  /**
   * Tự động hoàn thành nhiệm vụ học thuật (Anh/Toán/Đọc) khi học xong 1 bài
   * đúng môn. Gọi từ QuestsListener khi nhận sự kiện LESSON_COMPLETED.
   */
  async autoCompleteForSubject(studentId: string, subject: Subject): Promise<void> {
    const questType = SUBJECT_TO_QUEST[subject];
    if (!questType) return;

    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!student) return;
    const dateKey = localDateKey(new Date(), student.timeZone);

    const sq = await this.prisma.studentDailyQuest.findFirst({
      where: {
        studentId,
        dateKey,
        status: { not: 'COMPLETED' },
        quest: { type: questType },
      },
      include: { quest: true },
    });
    if (!sq) return;

    await this.prisma.studentDailyQuest.update({
      where: { id: sq.id },
      data: { status: 'COMPLETED', progress: 100, completedAt: new Date() },
    });
    this.events.emit('quest.completed', {
      studentId,
      questId: sq.questId,
      rewardXp: sq.quest.rewardXp,
    });
    this.logger.log(`Tự hoàn thành nhiệm vụ ${questType} cho ${studentId}`);
  }

  /** Hoàn thành 1 quest thủ công (nhiệm vụ ngoài đời: Vận động/Sáng tạo). */
  async complete(studentDailyQuestId: string): Promise<{ rewardXp: number }> {
    const sq = await this.prisma.studentDailyQuest.update({
      where: { id: studentDailyQuestId },
      data: { status: 'COMPLETED', progress: 100, completedAt: new Date() },
      include: { quest: true },
    });
    this.events.emit('quest.completed', {
      studentId: sq.studentId,
      questId: sq.questId,
      rewardXp: sq.quest.rewardXp,
    });
    return { rewardXp: sq.quest.rewardXp };
  }
}
