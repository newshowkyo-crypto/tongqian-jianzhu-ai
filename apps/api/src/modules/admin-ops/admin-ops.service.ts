import { Injectable } from '@nestjs/common';
import type { AdminKpiDashboardView, CredentialConfigView, FeatureFlagView, RedLineAlertView, SystemConfigView } from '@tongqian/types';

const LOCKED_KEYS = new Set(['subscription.plans.v1', 'agent.commission_rates', 'credentials.payment.wechat']);

@Injectable()
export class AdminOpsService {
  private readonly credentials = new Map<string, CredentialConfigView>();
  private readonly flags = new Map<string, FeatureFlagView>();
  private readonly histories = new Map<string, Array<Record<string, unknown>>>();
  private readonly redLines = new Map<string, RedLineAlertView>();
  private readonly systemConfigs = new Map<string, SystemConfigView>();

  constructor() {
    this.seed();
  }

  kpis(): AdminKpiDashboardView {
    return { aiUnitCostCny: 0.018, alertsOpen: [...this.redLines.values()].filter((item) => item.status === 'open').length, refundRate: 0.012, subscriptions: 128 };
  }

  configs(): SystemConfigView[] {
    return [...this.systemConfigs.values()];
  }

  setConfig(input: { approvalFlowId?: string; key: string; reason: string; updatedBy: string; value: unknown }): SystemConfigView {
    if (LOCKED_KEYS.has(input.key) && !input.approvalFlowId) throw new Error('ADMIN.CONFIG_KEY_LOCKED');
    const prev = this.systemConfigs.get(input.key);
    const next: SystemConfigView = { category: prev?.category ?? 'ops', description: prev?.description, isActive: true, key: input.key, updatedAt: new Date().toISOString(), value: input.value };
    this.systemConfigs.set(input.key, next);
    this.histories.set(input.key, [...(this.histories.get(input.key) ?? []), { changedAt: next.updatedAt, changedBy: input.updatedBy, newValue: input.value, prevValue: prev?.value, reason: input.reason }]);
    return next;
  }

  configHistory(key: string): Array<Record<string, unknown>> {
    return this.histories.get(key) ?? [];
  }

  credentialList(): CredentialConfigView[] {
    return [...this.credentials.values()];
  }

  upsertCredential(input: { key: string; mode: 'mock' | 'real'; operatorId: string; provider: string; reason: string }): CredentialConfigView {
    const status = input.mode === 'real' ? 'pending_approval' : 'active';
    const current = this.credentials.get(input.key);
    const next: CredentialConfigView = { auditCount: (current?.auditCount ?? 0) + 1, key: input.key, mode: input.mode, provider: input.provider, status, updatedAt: new Date().toISOString() };
    this.credentials.set(input.key, next);
    this.histories.set(input.key, [...(this.histories.get(input.key) ?? []), { action: 'credential.upsert', changedBy: input.operatorId, reason: input.reason, status }]);
    return next;
  }

  redLineStatus(): RedLineAlertView[] {
    return [...this.redLines.values()];
  }

  runRedLineScan(): RedLineAlertView[] {
    for (const item of [{ actualValue: 31_000, key: 'gift_credit_monthly_pool_cny', threshold: 30_000 }]) {
      this.redLines.set(item.key, { actualValue: item.actualValue, id: crypto.randomUUID(), redLineKey: item.key, status: 'open', threshold: item.threshold, triggeredAt: new Date().toISOString() });
    }
    return this.redLineStatus();
  }

  featureFlags(): FeatureFlagView[] {
    return [...this.flags.values()];
  }

  setFlag(input: { enabled: boolean; flagKey: string; nameZh: string; rolloutPct: number; rolloutStrategy?: Record<string, unknown> }): FeatureFlagView {
    const next: FeatureFlagView = { enabled: input.enabled, flagKey: input.flagKey, nameZh: input.nameZh, rolloutPct: input.rolloutPct, rolloutStrategy: input.rolloutStrategy ?? {} };
    this.flags.set(input.flagKey, next);
    return next;
  }

  reviewQueues(): Record<string, unknown> {
    return { agentReview: 4, caseReview: 7, financeApprovals: 3, policyFundPending: 5 };
  }

  private seed(): void {
    this.systemConfigs.set('credentials.payment.wechat', { category: 'credentials', description: 'admin.credentials.wechatPay', isActive: true, key: 'credentials.payment.wechat', updatedAt: new Date().toISOString(), value: { mode: 'mock' } });
    this.credentials.set('WECHAT_PAY_MCH_ID', { auditCount: 0, key: 'WECHAT_PAY_MCH_ID', mode: 'mock', provider: 'wechat_pay', status: 'active', updatedAt: new Date().toISOString() });
    this.flags.set('agent.partner.enabled', { enabled: false, flagKey: 'agent.partner.enabled', nameZh: 'PARTNER 推荐角色', rolloutPct: 0, rolloutStrategy: { phase: 'M4' } });
  }
}
