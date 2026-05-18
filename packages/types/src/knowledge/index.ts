export type KnowledgeStatus = 'pending_review' | 'published' | 'rejected';
export type KnowledgeType = 'contract_clause' | 'performance' | 'policy' | 'tender_structure';

export interface PolicyView {
  aiSummary: string;
  id: string;
  level: string;
  publishDate: string;
  publishOrg: string;
  status: KnowledgeStatus;
  title: string;
  topics: string[];
  vectorId?: string;
}

export interface PerformanceView {
  amountCny: number;
  id: string;
  industry: string;
  region: string;
  sourceUrl: string;
  status: KnowledgeStatus;
  vectorId?: string;
  winnerCompany: string;
}

export interface ContractClauseView {
  category: string;
  clauseText: string;
  id: string;
  riskLevel: 'green' | 'red' | 'yellow';
  standardWording: string;
  status: KnowledgeStatus;
  suggestion: string;
  type: string;
  vectorId?: string;
}

export interface TenderStructureView {
  id: string;
  industry: string;
  projectType: string;
  scoringTemplate: Record<string, unknown>;
  status: KnowledgeStatus;
  templateOutline: string[];
  vectorId?: string;
}

export interface KnowledgeRetrievalItem {
  id: string;
  score: number;
  snippet: string;
  title: string;
  type: KnowledgeType;
}

export interface CrawlJobView {
  endedAt?: string;
  error?: string;
  fetchedCount: number;
  id: string;
  source: string;
  startedAt: string;
  status: 'failed' | 'running' | 'succeeded';
  type: 'performance' | 'policy' | 'tender';
}
