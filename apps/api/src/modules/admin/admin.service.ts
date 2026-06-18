import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

/** Tổng hợp dữ liệu vận hành cho Admin Panel. */
@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const [students, parents, lessons, conversations, completedRecords, activeToday] =
      await Promise.all([
        this.prisma.student.count(),
        this.prisma.parent.count(),
        this.prisma.lesson.count(),
        this.prisma.aiConversation.count(),
        this.prisma.learningRecord.count({ where: { completed: true } }),
        this.prisma.student.count({
          where: { lastActiveKey: { not: null } },
        }),
      ]);
    return {
      students,
      parents,
      lessons,
      aiConversations: conversations,
      lessonsCompleted: completedRecords,
      activeStudents: activeToday,
    };
  }

  async listStudents(p: PaginationDto) {
    const [data, total] = await Promise.all([
      this.prisma.student.findMany({
        skip: p.skip,
        take: p.take,
        include: { parent: { include: { user: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.student.count(),
    ]);
    return { data, meta: { page: p.page, pageSize: p.pageSize, total } };
  }

  async listUsers(p: PaginationDto) {
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: p.skip,
        take: p.take,
        select: {
          id: true,
          email: true,
          role: true,
          fullName: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);
    return { data, meta: { page: p.page, pageSize: p.pageSize, total } };
  }

  setUserActive(userId: string, isActive: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: { id: true, isActive: true },
    });
  }

  recentAuditLogs(take = 50) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      include: { user: { select: { email: true, role: true } } },
    });
  }
}
