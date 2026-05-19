import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

export type LadderEvent = 'cancel' | 'downgrade' | 'payment_failed' | 'renewal_success' | 'upgrade';

export interface LadderState {
  readonly consecutiveMonths: number;
  readonly discountRate: number;
  readonly planCode: string;
  readonly status: 'active' | 'canceled' | 'grace' | 'trial';
}

@Injectable()
export class LadderService {
  /**
   * Advances ladder state after successful renewal.
   *
   * @param currentCounter Current consecutive renewal count.
   * @returns Renewal counter and discount.
   */
  onRenewalSuccess(currentCounter: number): { consecutiveMonths: number; discountRate: number } {
    if (currentCounter < 0) throw new BusinessError({ code: ErrorCodes.SUB_PLAN_UNAVAILABLE.code, message: 'Renewal counter is invalid.' });
    const consecutiveMonths = currentCounter + 1;
    return { consecutiveMonths, discountRate: this.resolveDiscount(consecutiveMonths) };
  }

  /**
   * Resets ladder state after cancellation or long payment failure.
   *
   * @returns Reset state.
   */
  reset(): { consecutiveMonths: 0; discountRate: 1 } {
    return { consecutiveMonths: 0, discountRate: 1 };
  }

  /**
   * Resolves the five-stage ladder discount.
   *
   * @param consecutiveMonths Consecutive successful renewal count.
   * @returns Discount rate.
   */
  resolveDiscount(consecutiveMonths: number): number {
    if (consecutiveMonths >= 12) return 0.7;
    if (consecutiveMonths >= 6) return 0.8;
    if (consecutiveMonths >= 3) return 0.85;
    return 1;
  }

  /**
   * Applies a subscription lifecycle event to ladder state.
   *
   * @param state Current ladder state.
   * @param event Lifecycle event.
   * @param toPlan Optional target plan.
   * @returns Next ladder state.
   */
  transition(state: LadderState, event: LadderEvent, toPlan?: string): LadderState {
    this.validateState(state);
    if (event === 'renewal_success') {
      const next = this.onRenewalSuccess(state.consecutiveMonths);
      return { ...state, consecutiveMonths: next.consecutiveMonths, discountRate: next.discountRate, status: 'active' };
    }
    if (event === 'payment_failed') return { ...state, status: 'grace' };
    if (event === 'cancel') return { ...state, ...this.reset(), status: 'canceled' };
    if (event === 'upgrade' || event === 'downgrade') return { ...state, planCode: toPlan ?? state.planCode, status: 'active' };
    return state;
  }

  /**
   * Explains ladder stage for admin and customer success.
   *
   * @param consecutiveMonths Consecutive paid months.
   * @returns Stage metadata.
   */
  stage(consecutiveMonths: number): { nextAt?: number; rate: number; stage: 'S0' | 'S1' | 'S2' | 'S3' | 'S4' } {
    const rate = this.resolveDiscount(consecutiveMonths);
    if (consecutiveMonths >= 12) return { rate, stage: 'S4' };
    if (consecutiveMonths >= 6) return { nextAt: 12, rate, stage: 'S3' };
    if (consecutiveMonths >= 3) return { nextAt: 6, rate, stage: 'S2' };
    if (consecutiveMonths >= 1) return { nextAt: 3, rate, stage: 'S1' };
    return { nextAt: 1, rate, stage: 'S0' };
  }

  /**
   * Returns audit row for ladder transitions.
   *
   * @param state Current state.
   * @param event Lifecycle event.
   * @returns Audit row.
   */
  toAudit(state: LadderState, event: LadderEvent): Record<string, number | string> {
    return { action: 'SUB_LADDER_TRANSITION', consecutiveMonths: state.consecutiveMonths, event, planCode: state.planCode, status: state.status };
  }

  private validateState(state: LadderState): void {
    if (!state.planCode || state.consecutiveMonths < 0) {
      throw new BusinessError({ code: ErrorCodes.SUB_PLAN_UNAVAILABLE.code, message: 'Subscription ladder state is invalid.' });
    }
  }
}
