export interface SystemConfigView {
  category: string;
  description?: string;
  isActive: boolean;
  key: string;
  updatedAt: string;
  value: unknown;
}

export interface CredentialConfigView {
  auditCount: number;
  key: string;
  mode: 'mock' | 'real';
  provider: string;
  status: 'active' | 'pending_approval' | 'rejected';
  updatedAt: string;
}

export interface FeatureFlagView {
  enabled: boolean;
  flagKey: string;
  nameZh: string;
  rolloutPct: number;
  rolloutStrategy: Record<string, unknown>;
}

export interface RedLineAlertView {
  actualValue: number;
  id: string;
  redLineKey: string;
  status: 'open' | 'resolved';
  threshold: number;
  triggeredAt: string;
}

export interface AdminKpiDashboardView {
  aiUnitCostCny: number;
  alertsOpen: number;
  refundRate: number;
  subscriptions: number;
}
