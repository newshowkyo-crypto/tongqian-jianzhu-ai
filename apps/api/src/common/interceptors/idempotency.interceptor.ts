import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { ConflictException, Injectable } from '@nestjs/common';
import type { Observable } from 'rxjs';

const seenKeys = new Set<string>();

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string | string[] | undefined>; method: string }>();
    if (request.method !== 'GET') {
      const key = request.headers['idempotency-key'];
      const normalized = Array.isArray(key) ? key[0] : key;
      if (normalized && seenKeys.has(normalized)) {
        throw new ConflictException({ code: 'AUTH.IDEMPOTENCY.REPLAY', message: 'Duplicate idempotency key' });
      }
      if (normalized) {
        seenKeys.add(normalized);
      }
    }
    return next.handle();
  }
}
