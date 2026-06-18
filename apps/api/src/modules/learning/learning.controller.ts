import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Subject } from '@ai-academy/types';
import { LearningService } from './learning.service';
import {
  MathHintRequestDto,
  SubmitExerciseDto,
} from './dto/submit-exercise.dto';
import { StudentsService } from '../students/students.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/types/auth-user';

@ApiTags('learning')
@ApiBearerAuth()
@Controller('learning')
export class LearningController {
  constructor(
    private readonly learning: LearningService,
    private readonly students: StudentsService,
  ) {}

  @Get('courses')
  @Roles('STUDENT', 'PARENT', 'ADMIN')
  listCourses(
    @Query('subject') subject?: Subject,
    @Query('grade') grade?: string,
  ) {
    return this.learning.listCourses(subject, grade ? Number(grade) : undefined);
  }

  /** Lộ trình học (path) theo môn + lớp, kèm trạng thái mở khóa. */
  @Get('path')
  @Roles('STUDENT', 'PARENT', 'ADMIN')
  async path(
    @CurrentUser() user: AuthUser,
    @Query('subject') subject: Subject,
    @Query('grade') grade: string,
    @Query('studentId') studentId: string,
  ) {
    await this.students.assertCanAccess(user, studentId);
    return this.learning.getPath(studentId, subject, Number(grade));
  }

  @Get('lessons/:id')
  @Roles('STUDENT', 'PARENT', 'ADMIN')
  getLesson(@Param('id') id: string) {
    return this.learning.getLesson(id);
  }

  @Post('exercises/:id/submit')
  @Roles('STUDENT', 'PARENT', 'ADMIN')
  async submit(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: SubmitExerciseDto,
  ) {
    await this.students.assertCanAccess(user, dto.studentId);
    return this.learning.submitExercise(id, dto);
  }

  // --- AI-powered endpoints (rate-limited) ---

  @Post('math/hints')
  @Roles('STUDENT', 'PARENT', 'ADMIN')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  async mathHints(@CurrentUser() user: AuthUser, @Body() dto: MathHintRequestDto) {
    await this.students.assertCanAccess(user, dto.studentId);
    return this.learning.getMathHints(dto.studentId, dto.problem, dto.reveal ?? false);
  }

  @Post('reading/quiz')
  @Roles('STUDENT', 'PARENT', 'ADMIN')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  async readingQuiz(
    @CurrentUser() user: AuthUser,
    @Body() body: { studentId: string; passage: string },
  ) {
    await this.students.assertCanAccess(user, body.studentId);
    return this.learning.generateReadingQuiz(body.studentId, body.passage);
  }

  @Post('reading/story')
  @Roles('STUDENT', 'PARENT', 'ADMIN')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60_000, limit: 6 } })
  async story(
    @CurrentUser() user: AuthUser,
    @Body() body: { studentId: string; theme: string; language?: 'vi' | 'en' },
  ) {
    await this.students.assertCanAccess(user, body.studentId);
    return this.learning.generateStory(body.studentId, body.theme, body.language ?? 'vi');
  }
}
