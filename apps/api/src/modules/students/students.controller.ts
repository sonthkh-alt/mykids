import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/types/auth-user';

@ApiTags('students')
@ApiBearerAuth()
@Controller('students')
export class StudentsController {
  constructor(private readonly students: StudentsService) {}

  /** Phụ huynh xem danh sách con. */
  @Get()
  @Roles('PARENT', 'ADMIN')
  list(@CurrentUser() user: AuthUser) {
    return this.students.listForParent(user.userId);
  }

  @Post()
  @Roles('PARENT')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateStudentDto) {
    return this.students.createForParent(user.userId, dto);
  }

  @Get(':id')
  @Roles('PARENT', 'ADMIN', 'STUDENT')
  getOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.students.getProfile(user, id);
  }

  @Patch(':id')
  @Roles('PARENT', 'ADMIN', 'STUDENT')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.students.update(user, id, dto);
  }
}
