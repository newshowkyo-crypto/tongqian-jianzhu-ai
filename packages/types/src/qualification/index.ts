export type QualificationNeedClass = 'A' | 'B';
export type QualificationStatus = 'active' | 'expired' | 'revoked';

export interface QualificationCertView {
  category: string;
  certNo: string;
  id: string;
  issuedAt: string;
  issuer: string;
  level: string;
  rawImageUrl: string;
  status: QualificationStatus;
  subType?: string;
  tenantId: string;
  validUntil: string;
}

export interface KeyPersonnelView {
  certNo: string;
  certType: string;
  certValidUntil: string;
  complianceWarnings: string[];
  id: string;
  idCardMasked: string;
  isAttached: boolean;
  name: string;
  role: string;
  tenantId: string;
}

export interface QualificationCheckupView {
  aiTaskId: string;
  completeness: number;
  createdAt: string;
  healthScore: number;
  id: string;
  reportId?: string;
  riskPoints: string[];
  tenantId: string;
  upgradePotential: number;
  validity: number;
}

export interface UpgradePathReportView {
  aiTaskId: string;
  category: string;
  fromLevel: string;
  gapAnalysis: string[];
  id: string;
  pathSteps: string[];
  reportId?: string;
  tenantId: string;
  tier: 1 | 2 | 3;
  toLevel: string;
}

export interface QualificationDispatchDecisionView {
  class: QualificationNeedClass;
  reason: string;
  route: 'agent_workspace' | 'tongqian_service';
}
