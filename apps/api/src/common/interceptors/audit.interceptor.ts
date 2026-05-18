import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{ method: string; path?: string; url: string }>();
    return next.handle().pipe(
      tap(() => {
        if (request.method !== 'GET') {
          void { action: request.method, resource: request.path ?? request.url };
        }
      }),
    );
  }
}
