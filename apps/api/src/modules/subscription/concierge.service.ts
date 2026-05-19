import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

interface ConsultantLoad {
  industry?: string;
  region?: string;
  userId: string;
  workload: number;
}

@Injectable()
export class ConciergeService {
  private readonly consultants: ConsultantLoad[] = [
    { industry: 'construction', region: 'east', userId: 'consult-east-1', workload: 0 },
    { industry: 'construction', region: 'south', userId: 'consult-south-1', workload: 0 },
  ];

  /**
   * Assigns an exclusive consultant for flagship subscribers with 30-customer cap.
   *
   * @param input Plan, region and industry matching hints.
   * @returns Consultant id for flagship plan, otherwise undefined.
   */
  assign(input: { industry?: string; planCode: string; region?: string }): string | undefined {
    if (input.planCode !== 'flag') return undefined;
    const consultant = this.consultants
      .filter((item) => item.workload < 30)
      .sort((a, b) => Number(b.region === input.region) - Number(a.region === input.region) || a.workload - b.workload)[0];
    if (!consultant) {
      throw new BusinessError({ code: ErrorCodes.SUB_PLAN_UNAVAILABLE.code, details: { region: input.region }, message: 'No concierge consultant is currently available.' });
    }
    consultant.workload += 1;
    return consultant.userId;
  }

  /**
   * Releases a customer from a consultant when subscription is canceled or downgraded.
   *
   * @param consultantUserId Consultant id.
   * @returns Updated workload.
   */
  release(consultantUserId: string): { consultantUserId: string; workload: number } {
    const consultant = this.findConsultant(consultantUserId);
    consultant.workload = Math.max(consultant.workload - 1, 0);
    return { consultantUserId, workload: consultant.workload };
  }

  /**
   * Returns load ratio for capacity alerts.
   *
   * @param consultantUserId Consultant id.
   * @returns Load information.
   */
  load(consultantUserId: string): { capacity: 30; loadRatio: number; workload: number } {
    const consultant = this.findConsultant(consultantUserId);
    return { capacity: 30, loadRatio: consultant.workload / 30, workload: consultant.workload };
  }

  /**
   * Lists all consultants for admin operations.
   *
   * @returns Consultant load rows.
   */
  list(): ConsultantLoad[] {
    return this.consultants.map((item) => ({ ...item }));
  }

  /**
   * Adds a consultant capacity row idempotently by user id.
   *
   * @param input Consultant metadata.
   * @returns Consultant load row.
   */
  upsert(input: { industry?: string; region?: string; userId: string }): ConsultantLoad {
    if (!input.userId) throw new BusinessError({ code: ErrorCodes.SUB_PLAN_UNAVAILABLE.code, message: 'Consultant user id is required.' });
    const existing = this.consultants.find((item) => item.userId === input.userId);
    if (existing) {
      existing.industry = input.industry ?? existing.industry;
      existing.region = input.region ?? existing.region;
      return { ...existing };
    }
    const row = { industry: input.industry, region: input.region, userId: input.userId, workload: 0 };
    this.consultants.push(row);
    return { ...row };
  }

  /**
   * Builds audit metadata for concierge assignment.
   *
   * @param input Assignment input.
   * @param consultantUserId Consultant id.
   * @returns Audit row.
   */
  toAudit(input: { industry?: string; planCode: string; region?: string }, consultantUserId?: string): Record<string, string | undefined> {
    return { action: 'SUB_CONCIERGE_ASSIGN', consultantUserId, industry: input.industry, planCode: input.planCode, region: input.region };
  }

  private findConsultant(consultantUserId: string): ConsultantLoad {
    const consultant = this.consultants.find((item) => item.userId === consultantUserId);
    if (!consultant) throw new BusinessError({ code: ErrorCodes.SUB_PLAN_UNAVAILABLE.code, message: 'Consultant is not registered.' });
    return consultant;
  }
}
