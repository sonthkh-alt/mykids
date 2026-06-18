import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AiTutorService } from './ai-tutor.service';
import { AiTutorRequestDto } from './dto/ai-tutor.dto';
import { StudentsService } from '../students/students.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/types/auth-user';

@ApiTags('ai-tutor')
@ApiBearerAuth()
@Controller('ai/tutor')
export class AiController {
  constructor(
    private readonly tutor: AiTutorService,
    private readonly students: StudentsService,
  ) {}

  /** Chat với AI Tutor — giới hạn tần suất riêng để kiểm soát chi phí. */
  @Post('chat')
  @Roles('STUDENT', 'PARENT', 'ADMIN')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  async chat(@CurrentUser() user: AuthUser, @Body() dto: AiTutorRequestDto) {
    await this.students.assertCanAccess(user, dto.studentId);
    return this.tutor.chat(dto.studentId, dto.subject, dto.message, dto.conversationId);
  }

  @Get('conversations/:studentId')
  @Roles('STUDENT', 'PARENT', 'ADMIN')
  async list(@CurrentUser() user: AuthUser, @Param('studentId') studentId: string) {
    await this.students.assertCanAccess(user, studentId);
    return this.tutor.listConversations(studentId);
  }

  @Get('conversation/:id')
  @Roles('STUDENT', 'PARENT', 'ADMIN')
  getOne(@Param('id') id: string) {
    return this.tutor.getConversation(id);
  }
}
