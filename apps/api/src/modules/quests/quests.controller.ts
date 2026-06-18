import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { QuestsService } from './quests.service';
import { StudentsService } from '../students/students.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/types/auth-user';

@ApiTags('quests')
@ApiBearerAuth()
@Controller('quests')
export class QuestsController {
  constructor(
    private readonly quests: QuestsService,
    private readonly students: StudentsService,
  ) {}

  @Get('today/:studentId')
  @Roles('STUDENT', 'PARENT', 'ADMIN')
  async today(@CurrentUser() user: AuthUser, @Param('studentId') studentId: string) {
    await this.students.assertCanAccess(user, studentId);
    return this.quests.getToday(studentId);
  }

  @Post(':id/complete')
  @Roles('STUDENT', 'PARENT', 'ADMIN')
  complete(@Param('id') id: string) {
    return this.quests.complete(id);
  }
}
