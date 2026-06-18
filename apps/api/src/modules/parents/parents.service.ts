import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { StudentsService } from '../students/students.service';
import type { AuthUser } from '../../common/types/auth-user';

export interface ParentDashboardChild {
  studentId: string;
  displayName: string;
  level: number;
  xp: number;
  streakDays: number;
  weeklyMinutes: number;
  strengths: string[];
  weaknesses: string[];
  lastReportSummary?: string;
}

/** Tổng hợp dữ liệu cho Parent Dashboard: thời gian học, điểm mạnh/yếu, báo cáo AI. */
@Injectable()
export class ParentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly students: StudentsService,
  ) {}

  async getDashboard(user: AuthUser): Promise<ParentDashboardChild[]> {
    const parent = await this.prisma.parent.findUnique({
      where: { userId: user.userId },
    });
    if (!parent) throw new ForbiddenException('Tài khoản không phải phụ huynh.');

    const children = await this.prisma.student.findMany({
      where: { parentId: parent.id },
      include: {
        reports: { orderBy: { periodEnd: 'desc' }, take: 1 },
      },
    });

    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const since = new Date(Date.now() - sevenDaysMs);

    const result: ParentDashboardChild[] = [];
    for (const child of children) {
      const records = await this.prisma.learningRecord.groupBy({
        by: ['subject'],
        where: { studentId: child.id, updatedAt: { gte: since } },
        _sum: { minutes: true },
        _avg: { accuracy: true },
      });

      const weeklyMinutes = records.reduce(
        (acc, r) => acc + (r._sum.minutes ?? 0),
        0,
      );
      const sorted = [...records].sort(
        (a, b) => (b._avg.accuracy ?? 0) - (a._avg.accuracy ?? 0),
      );
      const strengths = sorted
        .filter((r) => (r._avg.accuracy ?? 0) >= 0.7)
        .map((r) => r.subject);
      const weaknesses = sorted
        .filter((r) => (r._avg.accuracy ?? 0) < 0.5)
        .map((r) => r.subject);

      result.push({
        studentId: child.id,
        displayName: child.displayName,
        level: child.level,
        xp: child.xp,
        streakDays: child.streakDays,
        weeklyMinutes,
        strengths,
        weaknesses,
        lastReportSummary: child.reports[0]?.aiSummary,
      });
    }
    return result;
  }
}
