import { Inject, Injectable } from '@nestjs/common';

import { ConciergeService } from './concierge.service.js';
import { DiscountRebateService } from './discount-rebate.service.js';
import { InvoiceService, type InvoiceView } from './invoice.service.js';
import { LadderService } from './ladder.service.js';
import { PlanService } from './plans/plan.service.js';
import { transitionSubscriptionStatus } from './status-machine.js';
import type { PlanCode, SubscriptionRecord } from './subscription-types.js';

@Injectable()
export class SubscriptionService {
  private readonly subscriptions = new Map<string, SubscriptionRecord>();

  constructor(
    @Inject(ConciergeService) private readonly concierge: ConciergeService,
    @Inject(DiscountRebateService) private readonly rebates: DiscountRebateService,
    @Inject(InvoiceService) private readonly invoices: InvoiceService,
    @Inject(LadderService) private readonly ladder: LadderService,
    @Inject(PlanService) private readonly plans: PlanService,
  ) {}

  create(input: { planCode: PlanCode; tenantId: string }): { invoice?: InvoiceView; rebateCredits: number; subscription: SubscriptionRecord } {
    const plan = this.plans.get(input.planCode);
    const now = new Date();
    const subscription: SubscriptionRecord = {
      autoRenew: true,
      conciergeUserId: this.concierge.assign({ planCode: input.planCode }),
      consecutiveMonths: input.planCode === 'trial' ? 0 : 1,
      currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60_000).toISOString(),
      currentPeriodStart: now.toISOString(),
      id: crypto.randomUUID(),
      planCode: input.planCode,
      status: input.planCode === 'trial' ? 'trial' : 'active',
      tenantId: input.tenantId,
      totalPaid: input.planCode === 'trial' ? 0 : plan.monthlyPriceCny,
      totalPaidMonths: input.planCode === 'trial' ? 0 : 1,
    };
    this.subscriptions.set(subscription.id, subscription);
    const invoice = plan.monthlyPriceCny > 0 ? this.invoices.issue({ amount: plan.monthlyPriceCny, subscriptionId: subscription.id, tenantId: input.tenantId }) : undefined;
    return { invoice, rebateCredits: 0, subscription };
  }

  getByTenant(tenantId: string): SubscriptionRecord | undefined {
    return [...this.subscriptions.values()].find((subscription) => subscription.tenantId === tenantId);
  }

  changePlan(id: string, toPlan: PlanCode): SubscriptionRecord {
    const subscription = this.get(id);
    subscription.planCode = toPlan;
    subscription.conciergeUserId = this.concierge.assign({ planCode: toPlan }) ?? subscription.conciergeUserId;
    if (subscription.status === 'trial') {
      subscription.status = transitionSubscriptionStatus(subscription.status, 'first_payment_succeeded');
    }
    return subscription;
  }

  renew(id: string): { invoice: InvoiceView; rebateCredits: number; subscription: SubscriptionRecord } {
    const subscription = this.get(id);
    const plan = this.plans.get(subscription.planCode);
    const ladder = this.ladder.onRenewalSuccess(subscription.consecutiveMonths);
    subscription.consecutiveMonths = ladder.consecutiveMonths;
    subscription.status = subscription.status === 'past_due' ? transitionSubscriptionStatus(subscription.status, 'manual_renewal_succeeded') : subscription.status;
    subscription.totalPaid += plan.monthlyPriceCny;
    subscription.totalPaidMonths += 1;
    const invoice = this.invoices.issue({ amount: plan.monthlyPriceCny, subscriptionId: subscription.id, tenantId: subscription.tenantId });
    return { invoice, rebateCredits: this.rebates.calculateCredits(plan.monthlyPriceCny, ladder.discountRate), subscription };
  }

  markPastDue(id: string): SubscriptionRecord {
    const subscription = this.get(id);
    subscription.status = transitionSubscriptionStatus(subscription.status, 'auto_renewal_failed_three_times');
    subscription.pastDueSince = new Date().toISOString();
    return subscription;
  }

  reactivate(id: string): SubscriptionRecord {
    const subscription = this.get(id);
    subscription.status = transitionSubscriptionStatus(subscription.status, 'resubscribe_within_reactivation_window');
    return subscription;
  }

  cancel(id: string): SubscriptionRecord {
    const subscription = this.get(id);
    subscription.status = 'canceled';
    subscription.canceledAt = new Date().toISOString();
    return subscription;
  }

  setAutoRenewal(id: string, autoRenew: boolean): SubscriptionRecord {
    const subscription = this.get(id);
    subscription.autoRenew = autoRenew;
    return subscription;
  }

  listDueForRenewal(now = new Date()): SubscriptionRecord[] {
    return [...this.subscriptions.values()].filter((subscription) => subscription.autoRenew && subscription.status === 'active' && new Date(subscription.currentPeriodEnd) <= now);
  }

  private get(id: string): SubscriptionRecord {
    const subscription = this.subscriptions.get(id);
    if (!subscription) throw new Error('SUB.NOT_FOUND');
    return subscription;
  }
}
