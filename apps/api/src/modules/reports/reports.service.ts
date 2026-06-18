import { Injectable } from '@nestjs/common';
import type { PerformanceReportDto, Subject } from '@ai-academy/types';
import { PrismaService } from '../../core/prisma/prisma.service';
import { AiContentService } from '../ai/ai-content.service';

/** Sinh & lưu báo cáo hiệu suất học tập cho phụ huynh (Parent Report AI). */
@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiContent: AiContentService,
  ) {}

  async generateWeekly(studentId: string): Promise<PerformanceReportDto> {
    const student = await this.prisma.student.findUniqueOrThrow({
      where: { id: studentId },
    });
    const periodEnd = new Date();
    const periodStart = new Date(periodEnd.getTime() - 7 * 24 * 60 * 60 * 1000);

    const grouped = await this.prisma.learningRecord.groupBy({
      by: ['subject'],
      where: { studentId, updatedAt: { gte: periodStart } },
      _sum: { minutes: true },
      _avg: { accuracy: true },
    });

    const breakdown = grouped.map((g) => ({
      subject: g.subject as Subject,
      minutes: g._sum.minutes ?? 0,
      accuracy: Number((g._avg.accuracy ?? 0).toFixed(2)),
    }));
    const totalMinutes = breakdown.reduce((a, b) => a + b.minutes, 0);

    // Mặc định (khi chưa cấu hình AI)
    let summary = `${student.displayName} đã học ${totalMinutes} phút trong tuần qua.`;
    let strengths: string[] = breakdown.filter((b) => b.accuracy >= 0.7).map((b) => b.subject);
    let weaknesses: string[] = breakdown.filter((b) => b.accuracy < 0.5).map((b) => b.subject);

    if (this.aiContent.isConfigured && breakdown.length > 0) {
      try {
        const ai = await this.aiContent.generateParentReport(
          student.displayName,
          breakdown.map((b) => ({ subject: b.subject, minutes: b.minutes, accuracy: b.accuracy })),
          totalMinutes,
        );
        summary = ai.summary;
        strengths = ai.strengths;
        weaknesses = ai.weaknesses;
      } catch {
        // giữ giá trị mặc định
      }
    }

    const saved = await this.prisma.performanceReport.create({
      data: {
        studentId,
        periodStart,
        periodEnd,
        totalMinutes,
        strengths,
        weaknesses,
        aiSummary: summary,
        breakdown,
      },
    });

    return {
      studentId,
      periodStart: saved.periodStart.toISOString(),
      periodEnd: saved.periodEnd.toISOString(),
      totalMinutes,
      strengths,
      weaknesses,
      aiSummary: summary,
      subjectBreakdown: breakdown,
    };
  }

  listForStudent(studentId: string) {
    return this.prisma.performanceReport.findMany({
      where: { studentId },
      orderBy: { periodEnd: 'desc' },
      take: 12,
    });
  }
}
