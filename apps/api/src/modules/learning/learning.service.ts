import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { Subject } from '@ai-academy/types';
import { PrismaService } from '../../core/prisma/prisma.service';
import { StudentsService } from '../students/students.service';
import { AiContentService } from '../ai/ai-content.service';
import { GamificationService } from '../gamification/gamification.service';
import { SubmitExerciseDto } from './dto/submit-exercise.dto';
import { LESSON_COMPLETED, type LessonCompletedEvent } from './events';

@Injectable()
export class LearningService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly students: StudentsService,
    private readonly aiContent: AiContentService,
    private readonly gamification: GamificationService,
    private readonly events: EventEmitter2,
  ) {}

  /** Danh sách khóa học theo môn (mỗi "World" là 1 subject). */
  listCourses(subject?: Subject, grade?: number) {
    return this.prisma.course.findMany({
      where: {
        isPublished: true,
        ...(subject ? { subject } : {}),
        ...(grade ? { gradeMin: { lte: grade }, gradeMax: { gte: grade } } : {}),
      },
      include: { lessons: { where: { isPublished: true }, orderBy: { orderIndex: 'asc' } } },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async getLesson(lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        exercises: {
          orderBy: { orderIndex: 'asc' },
          include: {
            questions: {
              orderBy: { orderIndex: 'asc' },
              include: { answerOptions: { orderBy: { orderIndex: 'asc' } } },
            },
          },
        },
      },
    });
    if (!lesson) throw new NotFoundException('Không tìm thấy bài học.');
    return lesson;
  }

  /**
   * Nộp bài tập: chấm điểm, lưu câu trả lời + learning record (transaction),
   * rồi phát LessonCompleted để gamification cộng XP & cập nhật streak.
   */
  async submitExercise(exerciseId: string, dto: SubmitExerciseDto) {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: {
        lesson: { include: { course: true } },
        questions: { include: { answerOptions: true } },
      },
    });
    if (!exercise) throw new NotFoundException('Không tìm thấy bài tập.');

    // Chấm điểm
    let correct = 0;
    const answerRows = dto.answers.map((ans) => {
      const q = exercise.questions.find((x) => x.id === ans.questionId);
      let isCorrect = false;
      if (q) {
        const correctOption = q.answerOptions.find((o) => o.isCorrect);
        if (correctOption) {
          isCorrect = ans.response === correctOption.id || ans.response === correctOption.text;
        } else if (q.correctAnswer) {
          isCorrect =
            ans.response.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
        }
      }
      if (isCorrect) correct += 1;
      return {
        studentId: dto.studentId,
        exerciseId,
        questionId: ans.questionId,
        response: ans.response,
        isCorrect,
        timeSpentMs: ans.timeSpentMs ?? null,
      };
    });

    const total = exercise.questions.length || 1;
    const accuracy = correct / total;
    const subject = exercise.lesson.course.subject;
    const minutes = exercise.lesson.estMinutes;
    const xpEarned = Math.round(exercise.xpReward + accuracy * exercise.lesson.xpReward);

    await this.prisma.$transaction(async (tx) => {
      await tx.studentAnswer.createMany({ data: answerRows });
      await tx.learningRecord.upsert({
        where: {
          studentId_lessonId: { studentId: dto.studentId, lessonId: exercise.lessonId },
        },
        update: {
          completed: true,
          accuracy,
          minutes: { increment: minutes },
          xpEarned: { increment: xpEarned },
          completedAt: new Date(),
        },
        create: {
          studentId: dto.studentId,
          lessonId: exercise.lessonId,
          subject,
          completed: true,
          accuracy,
          minutes,
          xpEarned,
          completedAt: new Date(),
        },
      });
    });

    // Phát domain event (cho các listener khác trong tương lai: report, thông báo...)
    this.events.emit(LESSON_COMPLETED, {
      studentId: dto.studentId,
      lessonId: exercise.lessonId,
      subject,
      accuracy,
      minutes,
      baseXp: xpEarned,
    } satisfies LessonCompletedEvent);

    // Cộng XP đồng bộ để trả kết quả ăn mừng (level-up, huy hiệu) ngay cho UI.
    const reward = await this.gamification.grantXp(
      dto.studentId,
      xpEarned,
      'LESSON_COMPLETED',
      { type: 'lesson', id: exercise.lessonId },
    );

    return { correct, total, accuracy, ...reward };
  }

  /** Math World: gợi ý từng bước (không lộ đáp án trừ khi reveal). */
  async getMathHints(studentId: string, problem: string, reveal = false) {
    const persona = await this.students.getPersona(studentId);
    return this.aiContent.generateMathHints(problem, persona, reveal);
  }

  /** Reading World: AI sinh câu hỏi đọc hiểu từ đoạn văn. */
  async generateReadingQuiz(studentId: string, passage: string) {
    const persona = await this.students.getPersona(studentId);
    return this.aiContent.generateReadingQuiz(passage, persona);
  }

  /** Reading/Story: AI sáng tạo truyện cá nhân hóa. */
  async generateStory(studentId: string, theme: string, language: 'vi' | 'en') {
    const persona = await this.students.getPersona(studentId);
    return this.aiContent.generateStory(theme, persona, language);
  }
}
