import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { StudentsService } from '../students/students.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/types/auth-user';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reports: ReportsService,
    private readonly students: StudentsService,
  ) {}

  @Post('weekly/:studentId')
  @Roles('PARENT', 'ADMIN')
  async generate(@CurrentUser() user: AuthUser, @Param('studentId') studentId: string) {
    await this.students.assertCanAccess(user, studentId);
    return this.reports.generateWeekly(studentId);
  }

  @Get(':studentId')
  @Roles('PARENT', 'ADMIN')
  async list(@CurrentUser() user: AuthUser, @Param('studentId') studentId: string) {
    await this.students.assertCanAccess(user, studentId);
    return this.reports.listForStudent(studentId);
  }
}
