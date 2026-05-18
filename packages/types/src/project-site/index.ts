export type ProjectSiteStatus = 'completed' | 'ongoing' | 'suspended';

export interface ProjectSiteView {
  contractId?: string;
  expectedEndAt?: string;
  id: string;
  meta?: Record<string, unknown>;
  name: string;
  pmUserId?: string;
  region?: string;
  startAt?: string;
  status: ProjectSiteStatus;
  tenantId: string;
  type?: string;
}

export interface ConstructionLogView {
  aiSummary: string;
  aiTaskId: string;
  createdAt: string;
  createdBy: string;
  id: string;
  logDate: string;
  photosUrls: string[];
  projectId: string;
  tags: Array<{ type: 'issue' | 'part' | 'process'; value: string }>;
  userInput: string;
}

export interface ContactLetterView {
  aiTaskId: string;
  approvalFlowId?: string;
  content: string;
  id: string;
  pdfUrl?: string;
  projectId: string;
  status: 'approved' | 'draft' | 'sent';
  type: string;
}

export interface ArchiveChecklistView {
  aiTaskId: string;
  id: string;
  missingItems: string[];
  projectId: string;
  projectType: string;
  region: string;
  requiredItems: string[];
  uploadedItems: string[];
}
