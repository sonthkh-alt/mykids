import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FamilyService } from './family.service';
import {
  CreateChallengeDto,
  CreateFamilyGroupDto,
  LogChallengeProgressDto,
} from './dto/family.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/types/auth-user';

@ApiTags('family')
@ApiBearerAuth()
@Controller('family')
export class FamilyController {
  constructor(private readonly family: FamilyService) {}

  @Post('groups')
  @Roles('PARENT', 'ADMIN')
  createGroup(@CurrentUser() user: AuthUser, @Body() dto: CreateFamilyGroupDto) {
    return this.family.createGroup(user.userId, dto);
  }

  @Get('groups')
  @Roles('PARENT', 'ADMIN')
  listGroups(@CurrentUser() user: AuthUser) {
    return this.family.listGroups(user.userId);
  }

  @Post('challenges')
  @Roles('PARENT', 'ADMIN')
  createChallenge(@Body() dto: CreateChallengeDto) {
    return this.family.createChallenge(dto);
  }

  @Get('groups/:groupId/challenges')
  @Roles('PARENT', 'ADMIN', 'STUDENT')
  listChallenges(@Param('groupId') groupId: string) {
    return this.family.listChallenges(groupId);
  }

  @Post('challenges/:id/progress')
  @Roles('PARENT', 'ADMIN', 'STUDENT')
  logProgress(
    @Param('id') id: string,
    @Body() dto: LogChallengeProgressDto,
  ) {
    return this.family.logProgress(id, dto);
  }
}
