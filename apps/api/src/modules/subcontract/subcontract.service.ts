import { Injectable } from '@nestjs/common';

interface SubcontractRow {
  contractAmount: number;
  contractFileId?: string;
  contractReviewId?: string;
  id: string;
  projectId: string;
  status: 'active' | 'completed' | 'terminated';
  subcontractorName: string;
  tenantId: string;
  workScope: string;
}

interface EvaluationRow {
  cooperation: number;
  createdAt: Date;
  overall: number;
  quality: number;
  safety: number;
  schedule: number;
  settlement: number;
  subcontractId: string;
  tenantId: string;
}

const subcontracts = new Map<string, SubcontractRow>();
const evaluations: EvaluationRow[] = [];
const blacklist = new Map<string, { reason: string; tenantId: string }>();

@Injectable()
export class SubcontractService {
  create(input: { contractAmount: number; contractFileId?: string; projectId: string; subcontractorName: string; tenantId: string; workScope: string }): { reviewRequired: boolean; row: SubcontractRow; warning?: string } {
    const warning = this.checkBlacklist(input.tenantId, input.subcontractorName);
    const row: SubcontractRow = { contractAmount: input.contractAmount, contractFileId: input.contractFileId, contractReviewId: input.contractFileId ? `m14-review-${crypto.randomUUID()}` : undefined, id: crypto.randomUUID(), projectId: input.projectId, status: 'active', subcontractorName: input.subcontractorName, tenantId: input.tenantId, workScope: input.workScope };
    subcontracts.set(row.id, row);
    return { reviewRequired: Boolean(input.contractFileId), row, warning };
  }

  evaluate(subcontractId: string, scores: { cooperation: number; quality: number; safety: number; schedule: number; settlement: number }, tenantId = 'mock-tenant'): EvaluationRow {
    const overall = Number(((scores.quality + scores.schedule + scores.safety + scores.cooperation + scores.settlement) / 5).toFixed(2));
    const row: EvaluationRow = { ...scores, createdAt: new Date(), overall, subcontractId, tenantId };
    evaluations.push(row);
    return row;
  }

  addToBlacklist(tenantId: string, subcontractorName: string, reason: string): { reason: string; subcontractorName: string; tenantId: string } {
    blacklist.set(`${tenantId}:${subcontractorName}`, { reason, tenantId });
    return { reason, subcontractorName, tenantId };
  }

  checkBlacklist(tenantId: string, subcontractorName: string): string | undefined {
    return blacklist.get(`${tenantId}:${subcontractorName}`)?.reason;
  }

  list(projectId: string, tenantId: string): SubcontractRow[] {
    return [...subcontracts.values()].filter((row) => row.projectId === projectId && row.tenantId === tenantId);
  }
}
