import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AiPromptKey } from '@ai-academy/types';
import { AdminService } from './admin.service';
import { PromptService } from '../ai/prompt.service';
import { UpdatePromptDto } from '../ai/dto/update-prompt.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

/** Toàn bộ endpoint admin yêu cầu vai trò ADMIN (RolesGuard toàn cục). */
@ApiTags('admin')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly admin: AdminService,
    private readonly prompts: PromptService,
  ) {}

  @Get('overview')
  overview() {
    return this.admin.overview();
  }

  @Get('students')
  students(@Query() p: PaginationDto) {
    return this.admin.listStudents(p);
  }

  @Get('users')
  users(@Query() p: PaginationDto) {
    return this.admin.listUsers(p);
  }

  @Patch('users/:id/active')
  @Audit('UPDATE_ACTIVE', 'user')
  setActive(@Param('id') id: string, @Body() body: { isActive: boolean }) {
    return this.admin.setUserActive(id, body.isActive);
  }

  @Get('audit-logs')
  auditLogs() {
    return this.admin.recentAuditLogs();
  }

  // --- Prompt Management ---

  @Get('prompts')
  listPrompts() {
    return this.prompts.list();
  }

  @Patch('prompts/:key')
  @Audit('UPDATE', 'ai_prompt')
  updatePrompt(@Param('key') key: AiPromptKey, @Body() dto: UpdatePromptDto) {
    return this.prompts.updateByKey(key, dto);
  }
}
