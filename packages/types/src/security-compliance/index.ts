export type FraudLevel = 'high' | 'low' | 'medium';

export type EmergencyType = 'data_leak' | 'fund_anomaly' | 'mass_unauthorized' | 'model_account_stolen';

export interface AuditLogView {
  action: string;
  after?: Record<string, unknown>;
  before?: Record<string, unknown>;
  createdAt: string;
  id: string;
  ip?: string;
  resource: string;
  resourceId?: string;
  tenantId?: string;
  traceId: string;
  userAgent?: string;
  userId?: string;
}

export interface FraudSignalView {
  createdAt: string;
  evidence: Record<string, unknown>;
  id: string;
  level: FraudLevel;
  status: 'confirmed' | 'dismissed' | 'investigated' | 'open';
  subjectId: string;
  type: string;
}

export interface ComplianceSelfCheckView {
  createdAt: string;
  items: Array<{ name: string; notes?: string; status: 'deferred' | 'done' | 'risk' }>;
  quarter: string;
}

export interface EmergencyIncidentView {
  id: string;
  servicePaused: boolean;
  severity: 'critical' | 'high';
  triggeredAt: string;
  type: EmergencyType;
}
