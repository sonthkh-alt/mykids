import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { ApiResponse } from '@ai-academy/types';

/** Bọc response thành công vào envelope { success, data, meta }. */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((payload): ApiResponse<T> => {
        // Cho phép handler trả sẵn { data, meta } để gắn phân trang.
        if (
          payload &&
          typeof payload === 'object' &&
          'data' in (payload as object) &&
          'meta' in (payload as object)
        ) {
          const p = payload as unknown as { data: T; meta: ApiResponse<T>['meta'] };
          return { success: true, data: p.data, meta: p.meta };
        }
        return { success: true, data: payload };
      }),
    );
  }
}
