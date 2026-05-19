import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

export interface AttributionRecord {
  readonly agentId: string;
  readonly boundAt: string;
  readonly clientId: string;
  readonly reason: 'invite-code' | 'manual-cs' | 'partner-code';
  readonly refCode: string;
}

@Injectable()
export class AttributionService {
  private readonly attributions = new Map<string, AttributionRecord>();

  /**
   * Binds a client to the first valid referral code and preserves first-touch attribution.
   *
   * @param clientId Tenant or user id.
   * @param refCode Referral code.
   */
  bind(clientId: string, refCode?: string): void {
    this.assertClient(clientId);
    if (refCode && !this.attributions.has(clientId)) {
      this.attributions.set(clientId, {
        agentId: `agent-${refCode}`,
        boundAt: new Date().toISOString(),
        clientId,
        reason: refCode.startsWith('partner-') ? 'partner-code' : 'invite-code',
        refCode,
      });
    }
  }

  /**
   * Rebinds attribution by customer service when a conflict migration is approved.
   *
   * @param clientId Tenant or user id.
   * @param agentId Target agent id.
   * @param operatorId Customer service operator.
   * @returns Updated attribution record.
   */
  rebindByCustomerService(clientId: string, agentId: string, operatorId: string): AttributionRecord {
    this.assertClient(clientId);
    if (!agentId || !operatorId) {
      throw new BusinessError({ code: ErrorCodes.PERM_ACTION_DENIED.code, message: 'Attribution rebind requires agent and operator.' });
    }
    const record: AttributionRecord = {
      agentId,
      boundAt: new Date().toISOString(),
      clientId,
      reason: 'manual-cs',
      refCode: `cs-${operatorId}`,
    };
    this.attributions.set(clientId, record);
    return record;
  }

  /**
   * Returns attribution for billing and dispatch priority.
   *
   * @param clientId Tenant or user id.
   * @returns Attribution record when bound.
   */
  get(clientId: string): AttributionRecord | undefined {
    this.assertClient(clientId);
    return this.attributions.get(clientId);
  }

  /**
   * Calculates attribution split between PARTNER and service agent.
   *
   * @param clientId Tenant or user id.
   * @param hasServiceAgent Whether a dispatch owner exists.
   * @returns Percent split summary.
   */
  revenueSplit(clientId: string, hasServiceAgent: boolean): { partnerPercent: number; serviceAgentPercent: number } {
    const record = this.get(clientId);
    const partnerPercent = record?.reason === 'partner-code' ? 5 : 0;
    return { partnerPercent, serviceAgentPercent: hasServiceAgent ? 30 : 0 };
  }

  /**
   * Lists current bindings for admin audit without exposing raw customer documents.
   *
   * @returns Attribution records.
   */
  list(): AttributionRecord[] {
    return [...this.attributions.values()];
  }

  private assertClient(clientId: string): void {
    if (!clientId) throw new BusinessError({ code: ErrorCodes.TENANT_NOT_FOUND.code, message: 'Attribution requires client context.' });
  }
}
