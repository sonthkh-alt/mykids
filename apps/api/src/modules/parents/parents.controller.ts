import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ParentsService } from './parents.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/types/auth-user';

@ApiTags('parents')
@ApiBearerAuth()
@Controller('parents')
export class ParentsController {
  constructor(private readonly parents: ParentsService) {}

  @Get('dashboard')
  @Roles('PARENT')
  dashboard(@CurrentUser() user: AuthUser) {
    return this.parents.getDashboard(user);
  }
}
