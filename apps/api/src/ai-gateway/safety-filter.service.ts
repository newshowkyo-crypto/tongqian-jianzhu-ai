import { Injectable } from '@nestjs/common';

const blocked = ['必须', '一定', '绝对'];

@Injectable()
export class SafetyFilterService {
  check(output: unknown): void {
    const text = JSON.stringify(output);
    if (blocked.some((word) => text.includes(word))) {
      throw new Error('AI.OUTPUT.SAFETY_BLOCKED');
    }
  }
}
