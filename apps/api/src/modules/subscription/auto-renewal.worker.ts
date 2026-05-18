import { Inject, Injectable } from '@nestjs/common';

import { SubscriptionService } from './subscription.service.js';

@Injectable()
export class AutoRenewalWorker {
  constructor(@Inject(SubscriptionService) private readonly subscriptions: SubscriptionService) {}

  runOnce(): { pastDue: string[]; renewed: string[]; reminders: Array<{ daysBeforeDue: number; subscriptionId: string }> } {
    const renewed: string[] = [];
    const pastDue: string[] = [];
    for (const subscription of this.subscriptions.listDueForRenewal()) {
      try {
        renewed.push(this.subscriptions.renew(subscription.id).subscription.id);
      } catch {
        pastDue.push(this.subscriptions.markPastDue(subscription.id).id);
      }
    }
    return { pastDue, reminders: [], renewed };
  }
}
