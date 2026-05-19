import { Injectable } from '@nestjs/common';
import { DEFAULT_SUBSCRIPTION_PLANS } from '@tongqian/constants';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

import type { PlanCode, SubscriptionPlanView } from '../subscription-types.js';

@Injectable()
export class PlanService {
  /**
   * Lists active and system subscription plans.
   *
   * @returns Plan views.
   */
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

  /**
   * Gets a subscription plan by code.
   *
   * @param code Plan code.
   * @returns Plan view.
   */
  get(code: PlanCode): SubscriptionPlanView {
    const plan = this.list().find((item) => item.code === code);
    if (!plan) throw new BusinessError({ code: ErrorCodes.SUB_PLAN_UNAVAILABLE.code, details: { code }, message: 'Subscription plan is not available.' });
    return plan;
  }

  /**
   * Calculates monthly and yearly checkout price after ladder discount.
   *
   * @param code Plan code.
   * @param discountRate Ladder discount rate.
   * @returns Pricing summary.
   */
  price(code: PlanCode, discountRate = 1): { code: PlanCode; monthlyPayableCny: number; yearlyPayableCny?: number } {
    if (discountRate <= 0 || discountRate > 1) throw new BusinessError({ code: ErrorCodes.SUB_PLAN_UNAVAILABLE.code, message: 'Plan discount rate is invalid.' });
    const plan = this.get(code);
    return {
      code,
      monthlyPayableCny: Math.round(plan.monthlyPriceCny * discountRate * 100) / 100,
      yearlyPayableCny: plan.yearlyPriceCny === undefined ? undefined : Math.round(plan.yearlyPriceCny * discountRate * 100) / 100,
    };
  }

  /**
   * Checks whether one plan can access a tiered AI output.
   *
   * @param code Plan code.
   * @param tier Output tier.
   * @returns Access decision.
   */
  canAccessTier(code: PlanCode, tier: number): { allowed: boolean; reason: string } {
    const source = DEFAULT_SUBSCRIPTION_PLANS.find((plan) => plan.code === code);
    if (!source) throw new BusinessError({ code: ErrorCodes.SUB_PLAN_UNAVAILABLE.code, details: { code }, message: 'Subscription plan is not available.' });
    const tierAccess: readonly number[] = source.limits.tierAccess;
    return tierAccess.includes(tier) ? { allowed: true, reason: 'tier-in-plan' } : { allowed: false, reason: 'upgrade-required' };
  }

  /**
   * Recommends the smallest active plan that satisfies usage needs.
   *
   * @param input Usage needs.
   * @returns Recommended plan.
   */
  recommend(input: { monthlyCredits: number; projects: number; users: number }): SubscriptionPlanView {
    const candidates = DEFAULT_SUBSCRIPTION_PLANS.filter((plan) => plan.isActive && plan.limits.monthlyCredits >= input.monthlyCredits)
      .filter((plan) => plan.limits.maxProjects === undefined || plan.limits.maxProjects >= input.projects)
      .filter((plan) => plan.limits.maxUsers === undefined || plan.limits.maxUsers >= input.users)
      .sort((a, b) => a.monthlyPriceCny - b.monthlyPriceCny);
    return this.get((candidates[0]?.code ?? 'flag') as PlanCode);
  }

  /**
   * Builds audit metadata for plan selection and change.
   *
   * @param tenantId Tenant id.
   * @param fromPlan Previous plan.
   * @param toPlan Target plan.
   * @returns Audit row.
   */
  toAudit(tenantId: string, fromPlan: PlanCode | undefined, toPlan: PlanCode): Record<string, string | undefined> {
    if (!tenantId) throw new BusinessError({ code: ErrorCodes.TENANT_NOT_FOUND.code, message: 'Plan change requires tenant scope.' });
    return { action: 'SUB_PLAN_CHANGE', fromPlan, tenantId, toPlan };
  }
}
