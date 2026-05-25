import { Injectable } from '@nestjs/common';

interface ClaimInput {
  claimedAmountCny?: number;
  claimedTimeDays?: number;
  claimType: string;
  contractId: string;
  description: string;
  evidenceFiles: string[];
  projectId: string;
  status?: string;
  submitDeadline?: string;
  tenantId: string;
  title: string;
}

@Injectable()
export class ClaimRecordService {
  private readonly claims: Array<ClaimInput & { aiAnalysis: string; aiSuccessScore: number; id: string }> = [];

  create(input: ClaimInput): ClaimInput & { aiAnalysis: string; aiSuccessScore: number; id: string } {
    const evidenceScore = Math.min(0.35, input.evidenceFiles.length * 0.08);
    const deadlineScore = this.daysUntilDeadline(input.submitDeadline) >= 3 ? 0.2 : 0.05;
    const amountPenalty = (input.claimedAmountCny ?? 0) > 1000000 ? -0.08 : 0;
    const aiSuccessScore = Number(Math.max(0.15, Math.min(0.92, 0.42 + evidenceScore + deadlineScore + amountPenalty)).toFixed(2));
    const claim = { ...input, aiAnalysis: 'AI索赔成功率为经验估算，不保证业主认可或法律结果。', aiSuccessScore, id: crypto.randomUUID(), status: input.status ?? 'preparing' };
    this.claims.push(claim);
    return claim;
  }

  deadlineAlerts(projectId: string): Array<ClaimInput & { aiAnalysis: string; aiSuccessScore: number; alertLevel: '1' | '3' | '7'; id: string }> {
    return this.claims.flatMap((claim) => {
      if (claim.projectId !== projectId) return [];
      const days = this.daysUntilDeadline(claim.submitDeadline);
      const alertLevel = days <= 1 ? '1' : days <= 3 ? '3' : days <= 7 ? '7' : undefined;
      return alertLevel ? [{ ...claim, alertLevel }] : [];
    });
  }

  list(projectId: string): Array<ClaimInput & { aiAnalysis: string; aiSuccessScore: number; id: string }> {
    return this.claims.filter((claim) => claim.projectId === projectId);
  }

  private daysUntilDeadline(deadline?: string): number {
    if (!deadline) return 999;
    return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  }
}
