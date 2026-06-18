import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

/** Reward Store: đổi XP lấy phần thưởng (avatar, theme, power-up, thực tế). */
@Injectable()
export class RewardsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.reward.findMany({
      where: { isActive: true },
      orderBy: { costXp: 'asc' },
    });
  }

  /**
   * Đổi thưởng: trừ XP nguyên tử (chống chi vượt), tạo redemption.
   * Phần thưởng thực tế cần phụ huynh duyệt (status PENDING).
   */
  async redeem(studentId: string, rewardId: string) {
    return this.prisma.$transaction(async (tx) => {
      const [student, reward] = await Promise.all([
        tx.student.findUniqueOrThrow({ where: { id: studentId } }),
        tx.reward.findUnique({ where: { id: rewardId } }),
      ]);
      if (!reward || !reward.isActive) throw new NotFoundException('Phần thưởng không tồn tại.');
      if (reward.stock !== null && reward.stock <= 0)
        throw new BadRequestException('Phần thưởng đã hết.');
      if (student.xp < reward.costXp)
        throw new BadRequestException('Không đủ XP để đổi phần thưởng này.');

      await tx.student.update({
        where: { id: studentId },
        data: { xp: { decrement: reward.costXp } },
      });
      if (reward.stock !== null) {
        await tx.reward.update({
          where: { id: rewardId },
          data: { stock: { decrement: 1 } },
        });
      }

      // Avatar/theme: cấp ngay; phần thưởng thực tế: chờ duyệt.
      const status = reward.kind === 'REAL_WORLD' ? 'PENDING' : 'FULFILLED';
      const redemption = await tx.rewardRedemption.create({
        data: { studentId, rewardId, costXp: reward.costXp, status },
      });

      if (reward.kind === 'AVATAR' && reward.payload) {
        const payload = reward.payload as { avatarId?: string };
        if (payload.avatarId) {
          await tx.studentAvatar.upsert({
            where: { studentId_avatarId: { studentId, avatarId: payload.avatarId } },
            update: {},
            create: { studentId, avatarId: payload.avatarId },
          });
        }
      }
      return redemption;
    });
  }

  listRedemptions(studentId: string) {
    return this.prisma.rewardRedemption.findMany({
      where: { studentId },
      include: { reward: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
