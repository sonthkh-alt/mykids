import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import {
  CreateChallengeDto,
  CreateFamilyGroupDto,
  LogChallengeProgressDto,
} from './dto/family.dto';

/**
 * Family Challenge: thử thách "Bố và con", "Mẹ và con", "Cả gia đình".
 * Ví dụ: đọc sách cùng nhau, trò chuyện tiếng Anh, vận động.
 */
@Injectable()
export class FamilyService {
  constructor(private readonly prisma: PrismaService) {}

  private async parentIdOf(userId: string): Promise<string> {
    const parent = await this.prisma.parent.findUnique({ where: { userId } });
    if (!parent) throw new ForbiddenException('Tài khoản không phải phụ huynh.');
    return parent.id;
  }

  /** Tạo nhóm gia đình + tự thêm phụ huynh làm thành viên. */
  async createGroup(userId: string, dto: CreateFamilyGroupDto) {
    const parentId = await this.parentIdOf(userId);
    return this.prisma.familyGroup.create({
      data: {
        name: dto.name,
        members: { create: { role: 'PARENT', parentId } },
      },
      include: { members: true },
    });
  }

  async listGroups(userId: string) {
    const parentId = await this.parentIdOf(userId);
    return this.prisma.familyGroup.findMany({
      where: { members: { some: { parentId } } },
      include: {
        members: true,
        challenges: { include: { progress: true }, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  createChallenge(dto: CreateChallengeDto) {
    return this.prisma.familyChallenge.create({
      data: {
        groupId: dto.groupId,
        kind: dto.kind,
        title: dto.title,
        description: dto.description,
        goalType: dto.goalType,
        targetValue: dto.targetValue,
        rewardXp: dto.rewardXp ?? 30,
      },
    });
  }

  listChallenges(groupId: string) {
    return this.prisma.familyChallenge.findMany({
      where: { groupId },
      include: { progress: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Ghi nhận tiến độ; tự chuyển sang COMPLETED khi đạt mục tiêu. */
  async logProgress(challengeId: string, dto: LogChallengeProgressDto) {
    const challenge = await this.prisma.familyChallenge.findUnique({
      where: { id: challengeId },
      include: { progress: true },
    });
    if (!challenge) throw new NotFoundException('Không tìm thấy thử thách.');

    const entry = await this.prisma.familyChallengeProgress.create({
      data: {
        challengeId,
        studentId: dto.studentId ?? null,
        value: dto.value,
        note: dto.note,
      },
    });

    const total =
      challenge.progress.reduce((acc, p) => acc + p.value, 0) + dto.value;
    if (total >= challenge.targetValue && challenge.status === 'ACTIVE') {
      await this.prisma.familyChallenge.update({
        where: { id: challengeId },
        data: { status: 'COMPLETED' },
      });
    }
    return { entry, total, target: challenge.targetValue };
  }
}
