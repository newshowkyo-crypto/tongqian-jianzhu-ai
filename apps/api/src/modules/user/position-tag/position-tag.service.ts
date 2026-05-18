import { Injectable } from '@nestjs/common';

@Injectable()
export class PositionTagService {
  private readonly assignments = new Map<string, string[]>();

  assign(userId: string, tags: string[]): { tags: string[]; userId: string } {
    this.assignments.set(userId, tags);
    return { tags, userId };
  }
}
