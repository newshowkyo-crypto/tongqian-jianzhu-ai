import { Injectable } from '@nestjs/common';
import { DEFAULT_SUBSCRIPTION_PLANS } from '@tongqian/constants';

import type { PlanCode, SubscriptionPlanView } from '../subscription-types.js';

@Injectable()
export class PlanService {
  list(): SubscriptionPlanView[] {
    return DEFAULT_SUBSCRIPTION_PLANS.map((plan) => ({
      code: plan.code as PlanCode,
      creditsPerMonth: plan.limits.monthlyCredits,
      features: plan.features,
      isActive: plan.isActive,
      monthlyPriceCny: plan.monthlyPriceCny,
      name: plan.displayName,
      yearlyPriceCny: 'yearlyPriceCny' in plan ? plan.yearlyPriceCny : undefined,
    }));
  }

  get(code: PlanCode): SubscriptionPlanView {
    const plan = this.list().find((item) => item.code === code);
    if (!plan) throw new Error('SUB.PLAN.NOT_FOUND');
    return plan;
  }
}
