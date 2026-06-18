import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GamificationService } from './gamification.service';
import { RewardsService } from './rewards.service';
import { StudentsService } from '../students/students.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/types/auth-user';

@ApiTags('gamification')
@ApiBearerAuth()
@Controller('gamification')
export class GamificationController {
  constructor(
    private readonly gamification: GamificationService,
    private readonly rewards: RewardsService,
    private readonly students: StudentsService,
  ) {}

  @Get('badges/:studentId')
  @Roles('STUDENT', 'PARENT', 'ADMIN')
  async badges(@CurrentUser() user: AuthUser, @Param('studentId') studentId: string) {
    await this.students.assertCanAccess(user, studentId);
    return this.gamification.getBadges(studentId);
  }

  @Get('xp-history/:studentId')
  @Roles('STUDENT', 'PARENT', 'ADMIN')
  async xpHistory(@CurrentUser() user: AuthUser, @Param('studentId') studentId: string) {
    await this.students.assertCanAccess(user, studentId);
    return this.gamification.getXpHistory(studentId);
  }

  @Get('rewards')
  @Roles('STUDENT', 'PARENT', 'ADMIN')
  listRewards() {
    return this.rewards.list();
  }

  @Post('rewards/:rewardId/redeem')
  @Roles('STUDENT', 'PARENT', 'ADMIN')
  async redeem(
    @CurrentUser() user: AuthUser,
    @Param('rewardId') rewardId: string,
    @Body() body: { studentId: string },
  ) {
    await this.students.assertCanAccess(user, body.studentId);
    return this.rewards.redeem(body.studentId, rewardId);
  }

  @Get('redemptions/:studentId')
  @Roles('STUDENT', 'PARENT', 'ADMIN')
  async redemptions(@CurrentUser() user: AuthUser, @Param('studentId') studentId: string) {
    await this.students.assertCanAccess(user, studentId);
    return this.rewards.listRedemptions(studentId);
  }
}
