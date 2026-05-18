import type { CanActivate, ExecutionContext} from '@nestjs/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AiRateLimitGuard implements CanActivate {
  private readonly counters = new Map<string, { count: number; resetAt: number }>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ ip?: string }>();
    const key = request.ip ?? 'anonymous';
    const now = Date.now();
    const counter = this.counters.get(key) ?? { count: 0, resetAt: now + 60_000 };
    if (counter.resetAt < now) {
      counter.count = 0;
      counter.resetAt = now + 60_000;
    }
    counter.count += 1;
    this.counters.set(key, counter);
    return counter.count <= 30;
  }
}
