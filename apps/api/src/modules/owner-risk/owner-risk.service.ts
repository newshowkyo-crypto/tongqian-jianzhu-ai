import { Inject, Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';
import { AiConfidenceLevel, AiOutputTier, AiTaskType } from '@tongqian/types';
import type {
  OwnerRiskReportType,
  OwnerRiskProfileView,
  OwnerRiskCardView,
  OwnerGuaranteeRecordView,
  OwnerCompanyMixingRecordView,
  CounterpartyWatchlistView,
  CounterpartyRiskEventView,
  ReceivableRiskRecordView,
  OwnerRiskReportView,
  OwnerRiskUnlockLogView,
  OwnerRiskReviewRequestView,
  OwnerRiskGenerationLogView,
  OwnerRiskReportSectionView,
  CreateOwnerRiskProfileDto,
  UpdateOwnerRiskProfileDto,
  OwnerRiskGenerationType,
  ReviewType,
  AiResponse,
} from '@tongqian/types';

import { AiGatewayService } from '../../ai-gateway/ai-gateway.service.js';
import { CreditService } from '../credit/credit.service.js';

import { OwnerRiskRepository } from './owner-risk.repository.js';

const ANALYSIS_TYPE_TO_TASK_TYPE: Record<OwnerRiskGenerationType, AiTaskType> = {
  overview: AiTaskType.OWNER_RISK_SUMMARY,
  guarantee_analysis: AiTaskType.OWNER_GUARANTEE_RISK_ANALYSIS,
  mixing_analysis: AiTaskType.OWNER_COMPANY_MIXING_RISK_ANALYSIS,
  counterparty_analysis: AiTaskType.COUNTERPARTY_RISK_ANALYSIS,
  receivable_analysis: AiTaskType.RECEIVABLE_RISK_ANALYSIS,
  report: AiTaskType.OWNER_RISK_REPORT_GENERATION,
};

const ANALYSIS_TYPE_TO_CREDITS_COST: Record<OwnerRiskGenerationType, number> = {
  overview: 100,
  guarantee_analysis: 200,
  mixing_analysis: 200,
  counterparty_analysis: 200,
  receivable_analysis: 200,
  report: 500,
};

@Injectable()
export class OwnerRiskService {
  constructor(
    @Inject(CreditService) private readonly creditService: CreditService,
    @Inject(OwnerRiskRepository) private readonly repo: OwnerRiskRepository,
    @Inject(AiGatewayService) private readonly aiGateway: AiGatewayService,
  ) {}

  async listProfiles(tenantId: string, userId: string, page: number, pageSize: number): Promise<{ list: OwnerRiskProfileView[]; total: number }> {
    return this.repo.listProfiles(tenantId, userId, page, pageSize);
  }

  async createProfile(tenantId: string, userId: string, dto: CreateOwnerRiskProfileDto): Promise<OwnerRiskProfileView> {
    return this.repo.createProfile(tenantId, userId, dto);
  }

  async getProfile(tenantId: string, id: string): Promise<OwnerRiskProfileView> {
    return this.repo.findProfileById(tenantId, id);
  }

  async updateProfile(tenantId: string, id: string, dto: UpdateOwnerRiskProfileDto): Promise<OwnerRiskProfileView> {
    return this.repo.updateProfile(tenantId, id, dto);
  }

  async listCards(tenantId: string): Promise<OwnerRiskCardView[]> {
    return this.repo.listCards(tenantId);
  }

  async getCard(tenantId: string, id: string): Promise<OwnerRiskCardView> {
    return this.repo.findCardById(tenantId, id);
  }

  async unlockCard(tenantId: string, userId: string, cardId: string): Promise<OwnerRiskCardView> {
    // 1. Find card via repository (tenant-isolated)
    const card = await this.repo.findCardById(tenantId, cardId);

    // 2. Already unlocked → idempotent success (409-style but return card as-is)
    if (card.isUnlocked) {
      return card;
    }

    // 3. Pre-charge credits (throws BusinessError if insufficient)
    const traceId = crypto.randomUUID();
    const idempotencyKey = `unlock:${tenantId}:${cardId}`;
    try {
      this.creditService.preCharge({
        amount: card.unlockCredits,
        idempotencyKey,
        tenantId,
        traceId,
        userId,
      });
    } catch (err: unknown) {
      if (err instanceof BusinessError) {
        throw new BusinessError({
          code: ErrorCodes.OWNER_RISK_INSUFFICIENT_CREDITS.code,
          details: { balance: 0, requested: card.unlockCredits },
          message: 'Insufficient credits for this operation.',
        });
      }
      throw err;
    }

    // 4. Update card in DB (unlock)
    try {
      await this.repo.updateCardUnlock(tenantId, cardId, true);
    } catch {
      // Rollback pre-charge on DB failure
      try {
        this.creditService.refund({ amount: card.unlockCredits, idempotencyKey: `refund:${idempotencyKey}`, tenantId, traceId, userId });
      } catch {
        // Log but swallow — refund failure should not break user-facing response
      }
      throw new BusinessError({
        code: ErrorCodes.OWNER_RISK_CREDIT_DEDUCT_FAILED.code,
        message: 'Credit deduction failed. Unable to unlock card.',
      });
    }

    // 5. Write unlock log
    const profileId = card.id; // cards don't directly hold profileId; we use the card's userId scope
    try {
      await this.repo.createUnlockLog({
        cardId: card.id,
        cardKey: card.cardKey,
        creditsCharged: card.unlockCredits,
        idempotencyKey,
        profileId,
        status: 'success',
        tenantId,
        traceId,
        userId,
      });
    } catch {
      // Log write failure — best-effort, card is already unlocked
    }

    // 6. Commit credit deduction
    try {
      this.creditService.commit({
        amount: card.unlockCredits,
        idempotencyKey,
        sourceResource: `owner-risk/cards/${cardId}/unlock`,
        tenantId,
        traceId,
        userId,
      });
    } catch {
      // Pre-charge was already deducted from balance; commit is the permanent record
      // If commit fails, refund is attempted
      try {
        this.creditService.refund({ amount: card.unlockCredits, idempotencyKey: `refund-commit:${idempotencyKey}`, tenantId, traceId, userId });
        await this.repo.updateCardUnlock(tenantId, cardId, false);
      } catch {
        // Worst case: card stays unlocked but credits not committed; manual reconciliation needed
      }
      throw new BusinessError({
        code: ErrorCodes.OWNER_RISK_CREDIT_DEDUCT_FAILED.code,
        message: 'Credit commit failed. Card unlock rolled back.',
      });
    }

    // 7. Return unlocked card (re-fetch from repo for latest state)
    return this.repo.findCardById(tenantId, cardId);
  }

  async listGuaranteeRecords(tenantId: string, profileId: string): Promise<OwnerGuaranteeRecordView[]> {
    return this.repo.listGuaranteeRecords(tenantId, profileId);
  }

  async listMixingRecords(tenantId: string, profileId: string): Promise<OwnerCompanyMixingRecordView[]> {
    return this.repo.listMixingRecords(tenantId, profileId);
  }

  async listCounterpartyWatchlist(tenantId: string): Promise<CounterpartyWatchlistView[]> {
    return this.repo.listCounterpartyWatchlist(tenantId);
  }

  async listCounterpartyRiskEvents(tenantId: string, counterpartyId: string): Promise<CounterpartyRiskEventView[]> {
    return this.repo.listCounterpartyRiskEvents(tenantId, counterpartyId);
  }

  async listReceivableRecords(tenantId: string, profileId: string): Promise<ReceivableRiskRecordView[]> {
    return this.repo.listReceivableRecords(tenantId, profileId);
  }

  async listReports(tenantId: string, profileId: string): Promise<OwnerRiskReportView[]> {
    return this.repo.listReports(tenantId, profileId);
  }

  async getReport(tenantId: string, id: string): Promise<OwnerRiskReportView> {
    return this.repo.findReportById(tenantId, id);
  }

  async generateAnalysis(tenantId: string, userId: string, profileId: string, analysisType: OwnerRiskGenerationType): Promise<OwnerRiskGenerationLogView> {
    // 1. Validate profile existence and tenant isolation
    await this.getProfile(tenantId, profileId);

    const traceId = crypto.randomUUID();
    const idempotencyKey = `generate-analysis:${tenantId}:${profileId}:${analysisType}:${traceId}`;
    const creditsCost = ANALYSIS_TYPE_TO_CREDITS_COST[analysisType];

    // 2. Pre-charge credits (throws BusinessError if insufficient)
    this.creditService.preCharge({
      amount: creditsCost,
      idempotencyKey,
      tenantId,
      traceId,
      userId,
    });

    let aiResponse: AiResponse<Record<string, unknown>>;
    try {
      // 3. Invoke AI Gateway (underlying prompt/safety sanitizer is handled inside the gateway)
      aiResponse = await this.aiGateway.invoke<Record<string, unknown>>({
        taskType: ANALYSIS_TYPE_TO_TASK_TYPE[analysisType],
        tenantId,
        userId,
        input: { profileId },
        context: {},
        options: { idempotencyKey },
      });
    } catch (err: unknown) {
      // Refund if AI Gateway fails
      try {
        this.creditService.refund({
          amount: creditsCost,
          idempotencyKey,
          tenantId,
          traceId,
          userId,
        });
      } catch (refundErr) {
        void refundErr;
      }
      throw err;
    }

    let log: OwnerRiskGenerationLogView;
    try {
      // 4. Save generation log to database
      log = await this.repo.createGenerationLog(
        tenantId,
        userId,
        profileId,
        analysisType,
        { profileId },
        (aiResponse.data ?? {}) as Record<string, unknown>,
        creditsCost,
      );
    } catch (err: unknown) {
      // Refund if database save fails
      try {
        this.creditService.refund({
          amount: creditsCost,
          idempotencyKey,
          tenantId,
          traceId,
          userId,
        });
      } catch (refundErr) {
        void refundErr;
      }
      throw err;
    }

    // 5. Commit transaction
    this.creditService.commit({
      amount: creditsCost,
      idempotencyKey,
      tenantId,
      traceId,
      userId,
    });

    return log;
  }

  async createReport(tenantId: string, userId: string, profileId: string, reportType: OwnerRiskReportType): Promise<{ reportId: string }> {
    const sections: OwnerRiskReportSectionView[] = [{ sectionKey: 'summary', title: 'Summary', content: 'Analysis complete' }];
    const createdReport = await this.repo.createReport({
      tenantId,
      userId,
      profileId,
      reportType,
      title: 'Risk Report',
      tierBadge: AiOutputTier.TIER_1,
      confidence: AiConfidenceLevel.HIGH,
      riskLevel: 'medium',
      executiveSummary: 'Analysis complete',
      dataSnapshot: {},
      sections,
      creditsCost: 150,
      disclaimer: 'This is an AI-generated report',
    });
    return { reportId: createdReport.id };
  }

  async createReviewRequest(tenantId: string, userId: string, profileId: string, reviewType: ReviewType): Promise<OwnerRiskReviewRequestView> {
    return this.repo.createReviewRequest(tenantId, userId, profileId, reviewType);
  }

  async listReviewRequests(tenantId: string): Promise<OwnerRiskReviewRequestView[]> {
    return this.repo.listReviewRequests(tenantId);
  }

  async listUnlockLogs(tenantId: string): Promise<OwnerRiskUnlockLogView[]> {
    return this.repo.listUnlockLogs(tenantId);
  }

  async listGenerationLogs(tenantId: string): Promise<OwnerRiskGenerationLogView[]> {
    return this.repo.listGenerationLogs(tenantId);
  }
}
