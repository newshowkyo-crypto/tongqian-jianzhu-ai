import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationThrottleService {
  private readonly dailyUrgency = new Map<string, string[]>();
  private readonly deliveryHashes = new Set<string>();
  private readonly userDaily = new Map<string, string[]>();

  check(input: { eventHash: string; eventId: string; scenario: string; userId: string }): { reason?: string; throttled: boolean } {
    if (this.deliveryHashes.has(input.eventHash)) return { reason: 'dedupe-hit', throttled: true };
    const today = new Date().toISOString().slice(0, 10);
    const userKey = `${input.userId}:${today}`;
    const userEvents = this.userDaily.get(userKey) ?? [];
    if (userEvents.length >= 50) return { reason: 'daily-total-cap', throttled: true };
    if (this.isUrgency(input.scenario)) {
      const urgencyEvents = this.dailyUrgency.get(userKey) ?? [];
      if (urgencyEvents.length >= 3) return { reason: 'urgency-cap-3-per-day', throttled: true };
      this.dailyUrgency.set(userKey, [...urgencyEvents, input.eventId]);
    }
    this.userDaily.set(userKey, [...userEvents, input.scenario]);
    return { throttled: false };
  }

  commit(eventHash: string): void {
    this.deliveryHashes.add(eventHash);
  }

  stats(userId: string): Record<string, unknown> {
    const today = new Date().toISOString().slice(0, 10);
    const key = `${userId}:${today}`;
    return {
      dedupeHashCount: this.deliveryHashes.size,
      totalToday: this.userDaily.get(key)?.length ?? 0,
      urgencyRemainingToday: Math.max(0, 3 - (this.dailyUrgency.get(key)?.length ?? 0)),
      userId,
    };
  }

  resetForTest(userId?: string): void {
    if (!userId) {
      this.dailyUrgency.clear();
      this.deliveryHashes.clear();
      this.userDaily.clear();
      return;
    }
    const prefix = `${userId}:`;
    for (const key of [...this.dailyUrgency.keys()]) if (key.startsWith(prefix)) this.dailyUrgency.delete(key);
    for (const key of [...this.userDaily.keys()]) if (key.startsWith(prefix)) this.userDaily.delete(key);
  }

  private isUrgency(scenario: string): boolean {
    return ['urgent', 'deadline', 'risk_red_light', 'tender_deadline', 'qualification_expiring'].some((keyword) => scenario.includes(keyword));
  }
}
