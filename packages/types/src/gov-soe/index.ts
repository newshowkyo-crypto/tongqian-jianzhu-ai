export interface GovDocumentDraftView {
  aiTaskId: string;
  content: string;
  createdAt: string;
  docType: string;
  id: string;
  watermark: string;
}

export interface GovProjectSourcingView {
  contactRevealed: boolean;
  id: string;
  industry: string;
  maskedSummary: string;
  region: string;
  status: 'matched' | 'published' | 'revealed';
  title: string;
}

export interface GovConsultIntentView {
  amountEstimateCny?: number;
  assignedConsultId?: string;
  consultingOrderId?: string;
  id: string;
  status: 'assigned' | 'pending' | 'triaged';
  topic: string;
}

export interface PolicyFundView {
  aiSummary: string;
  authority: string;
  category: 'INDUSTRY_FUND' | 'MINISTRY_SPECIAL' | 'NATIONAL_COMPREHENSIVE' | 'POLICY_LOAN' | 'PROVINCIAL_SPECIAL';
  code: string;
  id: string;
  nameShort: string;
  nameZh: string;
  rolloutPct: number;
  status: 'draft' | 'pending_expert' | 'published' | 'retired' | 'rolling_out';
}
