import { createHash } from 'node:crypto';

import { Injectable } from '@nestjs/common';

@Injectable()
export class ExactCacheService {
  private readonly cache = new Map<string, unknown>();

  getKey(taskType: string, input: unknown): string {
    return createHash('sha256').update(JSON.stringify(input)).digest('hex').replace(/^/, `ai:cache:${taskType}:`);
  }

  lookup<T>(taskType: string, input: unknown): T | undefined {
    return this.cache.get(this.getKey(taskType, input)) as T | undefined;
  }

  set(taskType: string, input: unknown, value: unknown): void {
    this.cache.set(this.getKey(taskType, input), value);
  }
}
