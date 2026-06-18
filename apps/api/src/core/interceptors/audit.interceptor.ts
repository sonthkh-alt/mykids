import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { AUDIT_KEY, AuditMeta } from '../../common/decorators/audit.decorator';
import { AuthUser } from '../../common/types/auth-user';

/** Ghi audit log cho các handler được đánh dấu @Audit(). */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const meta = this.reflector.get<AuditMeta | undefined>(
      AUDIT_KEY,
      context.getHandler(),
    );
    if (!meta) return next.handle();

    const req = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const user = req.user;

    return next.handle().pipe(
      tap((result) => {
        const rawId =
          (result as { id?: string } | undefined)?.id ?? req.params?.id;
        const resourceId = typeof rawId === 'string' ? rawId : null;
        void this.prisma.auditLog
          .create({
            data: {
              userId: user?.userId ?? null,
              action: meta.action,
              resource: meta.resource,
              resourceId,
              ipAddress: req.ip ?? null,
              metadata: { method: req.method, path: req.path },
            },
          })
          .catch(() => undefined); // audit không được làm hỏng request chính
      }),
    );
  }
}
