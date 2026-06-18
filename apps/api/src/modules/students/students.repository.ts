import { Injectable } from '@nestjs/common';
import { Prisma, Student } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';

export type StudentWithInterests = Prisma.StudentGetPayload<{
  include: { interests: true; avatar: true };
}>;

/** Repository Pattern: cô lập truy cập dữ liệu Student khỏi tầng application. */
@Injectable()
export class StudentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<StudentWithInterests | null> {
    return this.prisma.student.findUnique({
      where: { id },
      include: { interests: true, avatar: true },
    });
  }

  findByParent(parentId: string): Promise<StudentWithInterests[]> {
    return this.prisma.student.findMany({
      where: { parentId },
      include: { interests: true, avatar: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  create(data: Prisma.StudentCreateInput): Promise<Student> {
    return this.prisma.student.create({ data });
  }

  update(id: string, data: Prisma.StudentUpdateInput): Promise<Student> {
    return this.prisma.student.update({ where: { id }, data });
  }

  async replaceInterests(studentId: string, topics: string[]): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.studentInterest.deleteMany({ where: { studentId } }),
      this.prisma.studentInterest.createMany({
        data: topics.map((topic) => ({ studentId, topic })),
        skipDuplicates: true,
      }),
    ]);
  }
}
