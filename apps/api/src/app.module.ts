import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';

import configuration from './core/config/configuration';
import { PrismaModule } from './core/prisma/prisma.module';
import { RedisModule } from './core/redis/redis.module';
import { AuditInterceptor } from './core/interceptors/audit.interceptor';

// Feature modules (được sinh ở các bước 5-10)
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { UsersModule } from './modules/users/users.module';
import { StudentsModule } from './modules/students/students.module';
import { ParentsModule } from './modules/parents/parents.module';
import { FamilyModule } from './modules/family/family.module';
import { LearningModule } from './modules/learning/learning.module';
import { AiModule } from './modules/ai/ai.module';
import { QuestsModule } from './modules/quests/quests.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      cache: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
        redact: ['req.headers.authorization', 'req.headers.cookie'],
      },
    }),
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.getOrThrow<number>('throttle.ttl') * 1000,
          limit: config.getOrThrow<number>('throttle.limit'),
        },
      ],
    }),
    PrismaModule,
    RedisModule,

    // Domain modules
    AuthModule,
    UsersModule,
    StudentsModule,
    ParentsModule,
    FamilyModule,
    LearningModule,
    AiModule,
    QuestsModule,
    GamificationModule,
    ReportsModule,
    AdminModule,
  ],
  providers: [
    // RBAC toàn cục: mọi route mặc định cần JWT, trừ @Public(); rồi kiểm tra @Roles().
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
