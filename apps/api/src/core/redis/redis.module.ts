import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT, RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.getOrThrow<string>('redis.url');
        const client = new Redis(url, { maxRetriesPerRequest: 3 });
        const logger = new Logger('Redis');
        client.on('connect', () => logger.log('✅ Kết nối Redis thành công'));
        client.on('error', (e) => logger.error(`Redis error: ${e.message}`));
        return client;
      },
    },
    RedisService,
  ],
  exports: [RedisService, REDIS_CLIENT],
})
export class RedisModule {}
