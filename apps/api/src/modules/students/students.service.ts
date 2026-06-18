import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { getLevelProgress } from '@ai-academy/utils';
import type {
  Role,
  StudentPersona,
  StudentProfileDto,
} from '@ai-academy/types';
import { PrismaService } from '../../core/prisma/prisma.service';
import { StudentsRepository, StudentWithInterests } from './students.repository';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import type { AuthUser } from '../../common/types/auth-user';

@Injectable()
export class StudentsService {
  constructor(
    private readonly repo: StudentsRepository,
    private readonly prisma: PrismaService,
  ) {}

  /** Kiểm tra quyền truy cập học sinh theo RBAC + quan hệ phụ huynh-con. */
  async assertCanAccess(user: AuthUser, studentId: string): Promise<StudentWithInterests> {
    const student = await this.repo.findById(studentId);
    if (!student) throw new NotFoundException('Không tìm thấy học sinh.');

    if (user.role === ('ADMIN' satisfies Role)) return student;
    if (user.role === ('STUDENT' satisfies Role) && user.studentId === studentId)
      return student;
    if (user.role === ('PARENT' satisfies Role)) {
      const parent = await this.prisma.parent.findUnique({
        where: { userId: user.userId },
      });
      if (parent && student.parentId === parent.id) return student;
    }
    throw new ForbiddenException('Bạn không có quyền truy cập học sinh này.');
  }

  async getProfile(user: AuthUser, studentId: string): Promise<StudentProfileDto> {
    const s = await this.assertCanAccess(user, studentId);
    return this.toProfile(s);
  }

  async listForParent(parentUserId: string): Promise<StudentProfileDto[]> {
    const parent = await this.prisma.parent.findUnique({
      where: { userId: parentUserId },
    });
    if (!parent) return [];
    const students = await this.repo.findByParent(parent.id);
    return students.map((s) => this.toProfile(s));
  }

  async createForParent(
    parentUserId: string,
    dto: CreateStudentDto,
  ): Promise<StudentProfileDto> {
    const parent = await this.prisma.parent.findUnique({
      where: { userId: parentUserId },
    });
    if (!parent) throw new ForbiddenException('Tài khoản không phải phụ huynh.');

    const student = await this.repo.create({
      displayName: dto.displayName,
      grade: dto.grade,
      learningStyle: dto.learningStyle ?? 'VISUAL',
      englishLevel: dto.englishLevel ?? 'BEGINNER',
      mathLevel: dto.mathLevel ?? 'BEGINNER',
      parent: { connect: { id: parent.id } },
      interests: dto.interests?.length
        ? { create: dto.interests.map((topic) => ({ topic })) }
        : undefined,
    });
    const full = await this.repo.findById(student.id);
    return this.toProfile(full!);
  }

  async update(
    user: AuthUser,
    studentId: string,
    dto: UpdateStudentDto,
  ): Promise<StudentProfileDto> {
    await this.assertCanAccess(user, studentId);
    const { interests, ...rest } = dto;
    await this.repo.update(studentId, rest);
    if (interests) await this.repo.replaceInterests(studentId, interests);
    const full = await this.repo.findById(studentId);
    return this.toProfile(full!);
  }

  /** Xây "persona context" để cá nhân hóa prompt AI (Robot, Minecraft...). */
  async getPersona(studentId: string): Promise<StudentPersona> {
    const s = await this.repo.findById(studentId);
    if (!s) throw new NotFoundException('Không tìm thấy học sinh.');
    return {
      displayName: s.displayName,
      grade: s.grade,
      interests: s.interests.map((i) => i.topic),
      englishLevel: s.englishLevel,
      mathLevel: s.mathLevel,
      learningStyle: s.learningStyle,
    };
  }

  private toProfile(s: StudentWithInterests): StudentProfileDto {
    const progress = getLevelProgress(s.xp);
    return {
      id: s.id,
      displayName: s.displayName,
      grade: s.grade,
      avatarId: s.avatarId ?? undefined,
      interests: s.interests.map((i) => i.topic),
      englishLevel: s.englishLevel,
      mathLevel: s.mathLevel,
      learningStyle: s.learningStyle,
      level: progress.level,
      xp: s.xp,
      streakDays: s.streakDays,
      goal: s.goal ?? undefined,
    };
  }
}
