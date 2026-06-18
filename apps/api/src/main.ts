import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './core/filters/all-exceptions.filter';
import { TransformInterceptor } from './core/interceptors/transform.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  const config = app.get(ConfigService);
  const prefix = config.getOrThrow<string>('apiPrefix');
  const corsOrigins = config.getOrThrow<string[]>('corsOrigins');

  app.setGlobalPrefix(prefix);
  app.use(helmet());
  app.enableCors({ origin: corsOrigins, credentials: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.enableShutdownHooks();

  // Swagger (chỉ bật ngoài production hoặc khi cần)
  if (config.get('nodeEnv') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('AI Academy API')
      .setDescription('API nền tảng giáo dục AI cho học sinh lớp 3-6')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const doc = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${prefix}/docs`, app, doc);
  }

  const port = config.getOrThrow<number>('port');
  await app.listen(port);
}

void bootstrap();
