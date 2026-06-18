import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { awardXp, levelFromXp, localDateKey, nextStreak } from '@ai-academy/utils';
import type { BadgeDto, XpEventResult } from '@ai-academy/types';
import { PrismaService } from '../../core/prisma/prisma.service';

interface BadgeCriteria {
  type: 'XP_TOTAL' | 'STREAK' | 'LESSONS_COMPLETED' | 'LEVEL';
  value: number;
}

/**
 * Gamification engine: cộng XP (giao dịch nguyên tử), tính lại Level,
 * cập nhật Streak theo ngày địa phương, kiểm tra & trao Badge.
 */
@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Cộng XP + cập nhật streak + kiểm tra badge. Trả về kết quả cho UI ăn mừng. */
  async grantXp(
    studentId: string,
    amount: number,
    reason: string,
    ref?: { type: string; id: string },
  ): Promise<XpEventResult> {
    const result = await this.prisma.$transaction(async (tx) => {
      const student = await tx.student.findUniqueOrThrow({ where: { id: studentId } });

      // 1) XP & Level
      const outcome = awardXp(student.xp, amount);

      // 2) Streak (theo ngày địa phương)
      const todayKey = localDateKey(new Date(), student.timeZone);
      const streakDays = nextStreak(student.lastActiveKey, todayKey, student.streakDays);

      await tx.student.update({
        where: { id: studentId },
        data: {
          xp: outcome.totalXp,
          level: outcome.newLevel,
          streakDays,
          lastActiveKey: todayKey,
        },
      });

      await tx.xpLog.create({
        data: {
          studentId,
          amount,
          reason,
          refType: ref?.type ?? null,
          refId: ref?.id ?? null,
        },
      });

      return { outcome, streakDays };
    });

    const badgesUnlocked = await this.checkAndAwardBadges(studentId);

    return {
      xpGained: amount,
      totalXp: result.outcome.totalXp,
      level: result.outcome.newLevel,
      leveledUp: result.outcome.leveledUp,
      badgesUnlocked,
      streakDays: result.streakDays,
    };
  }

  /** Đối chiếu thành tích hiện tại với điều kiện huy hiệu, trao huy hiệu mới. */
  async checkAndAwardBadges(studentId: string): Promise<BadgeDto[]> {
    const [student, badges, owned, lessonCount] = await Promise.all([
      this.prisma.student.findUniqueOrThrow({ where: { id: studentId } }),
      this.prisma.badge.findMany(),
      this.prisma.studentBadge.findMany({ where: { studentId }, select: { badgeId: true } }),
      this.prisma.learningRecord.count({ where: { studentId, completed: true } }),
    ]);

    const ownedIds = new Set(owned.map((o) => o.badgeId));
    const newlyAwarded: BadgeDto[] = [];

    for (const badge of badges) {
      if (ownedIds.has(badge.id)) continue;
      const c = badge.criteria as unknown as BadgeCriteria;
      let achieved = false;
      switch (c.type) {
        case 'XP_TOTAL':
          achieved = student.xp >= c.value;
          break;
        case 'STREAK':
          achieved = student.streakDays >= c.value;
          break;
        case 'LEVEL':
          achieved = levelFromXp(student.xp) >= c.value;
          break;
        case 'LESSONS_COMPLETED':
          achieved = lessonCount >= c.value;
          break;
      }
      if (achieved) {
        try {
          await this.prisma.studentBadge.create({
            data: { studentId, badgeId: badge.id },
          });
          newlyAwarded.push(this.toBadgeDto(badge));
        } catch (e) {
          // unique constraint nếu trao đồng thời — bỏ qua
          if ((e as Prisma.PrismaClientKnownRequestError).code !== 'P2002') throw e;
        }
      }
    }
    if (newlyAwarded.length)
      this.logger.log(`🏅 ${studentId} mở khóa ${newlyAwarded.length} huy hiệu`);
    return newlyAwarded;
  }

  async getBadges(studentId: string) {
    const all = await this.prisma.badge.findMany({ orderBy: { rarity: 'asc' } });
    const owned = await this.prisma.studentBadge.findMany({
      where: { studentId },
      select: { badgeId: true, awardedAt: true },
    });
    const ownedMap = new Map(owned.map((o) => [o.badgeId, o.awardedAt]));
    return all.map((b) => ({
      ...this.toBadgeDto(b),
      owned: ownedMap.has(b.id),
      awardedAt: ownedMap.get(b.id) ?? null,
    }));
  }

  getXpHistory(studentId: string, take = 30) {
    return this.prisma.xpLog.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  private toBadgeDto(b: {
    id: string;
    code: string;
    name: string;
    description: string;
    iconUrl: string;
    rarity: string;
  }): BadgeDto {
    return {
      id: b.id,
      code: b.code,
      name: b.name,
      description: b.description,
      iconUrl: b.iconUrl,
      rarity: b.rarity as BadgeDto['rarity'],
    };
  }
}
