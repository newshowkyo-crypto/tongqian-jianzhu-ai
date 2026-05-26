import { Injectable } from '@nestjs/common';

const scenarios = ['inquiry_no_order', 'free_quota', 'renewal', 'payment_failed', 'report_unread'] as const;

@Injectable()
export class FollowupReminderService {
  list(agentId: string): Array<{ customerName: string; id: string; scenario: string; scriptHint: string }> {
    return scenarios.map((scenario) => ({
      customerName: `Customer ${scenario}`,
      id: crypto.randomUUID(),
      scenario,
      scriptHint: this.scriptFor(scenario, agentId),
    }));
  }

  scriptFor(scenario: string, agentId: string): string {
    return `Agent ${agentId} follow-up script for ${scenario}: focus on value, next step, and no pressure.`;
  }
}
