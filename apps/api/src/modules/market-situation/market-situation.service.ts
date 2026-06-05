import { Inject, Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';
import { AiTaskType } from '@tongqian/types';
import type {
  MarketSignalView,
  MarketSignalSourceView,
  MarketSignalTagView,
  MarketSignalUnlockLogView,
  MarketSignalSimulationView,
  MarketSignalReportView,
  MarketSignalFeedbackView,
  MarketSignalGenerationLogView,
  CreateMarketSignalDto,
  UnlockType,
  SimulationType,
  MarketSignalReportType,
  FeedbackType,
  MarketSignalGenerationType,
  AiResponse,
} from '@tongqian/types';

import { AiGatewayService } from '../../ai-gateway/ai-gateway.service.js';
import { CreditService } from '../credit/credit.service.js';

import { MarketSituationRepository } from './market-situation.repository.js';

const GENERATION_TYPE_TO_TASK_TYPE: Record<MarketSignalGenerationType, AiTaskType> = {
  summary: AiTaskType.MARKET_SIGNAL_SUMMARY,
  impact_analysis: AiTaskType.MARKET_SIGNAL_IMPACT_ANALYSIS,
  simulation: AiTaskType.MARKET_SIGNAL_SIMULATION,
  report: AiTaskType.MARKET_SITUATION_REPORT,
};

const GENERATION_TYPE_TO_CREDITS_COST: Record<MarketSignalGenerationType, number> = {
  summary: 100,
  impact_analysis: 200,
  simulation: 200,
  report: 500,
};

@Injectable()
export class MarketSituationService {
  constructor(
    @Inject(MarketSituationRepository) private readonly repo: MarketSituationRepository,
    @Inject(CreditService) private readonly creditService: CreditService,
    @Inject(AiGatewayService) private readonly aiGateway: AiGatewayService,
  ) {}

  async listSignals(
    tenantId: string,
    userId: string,
    page: number,
    pageSize: number,
    filters: { region?: string; signalType?: string; riskLevel?: string },
  ): Promise<{ list: MarketSignalView[]; total: number }> {
    return this.repo.listSignals(tenantId, page, pageSize, filters);
  }

  async listFeaturedSignals(tenantId: string): Promise<MarketSignalView[]> {
    return this.repo.listFeaturedSignals(tenantId);
  }

  async getSignal(tenantId: string, id: string): Promise<MarketSignalView> {
    return this.repo.findSignalById(tenantId, id);
  }

  async createSignal(tenantId: string, userId: string, dto: CreateMarketSignalDto): Promise<MarketSignalView> {
    // Verification: 无 sourceUrl/sourceId/rawData 中至少一种来源时，不允许发布或创建 published signal，抛 MARKET_SIGNAL.SOURCE.UNVERIFIED
    if (!dto.sourceUrl && (!dto.rawData || Object.keys(dto.rawData).length === 0)) {
      throw new BusinessError(ErrorCodes.MARKET_SIGNAL_UNVERIFIED_SOURCE);
    }
    return this.repo.createSignal(tenantId, userId, dto);
  }

  async unlockSignal(tenantId: string, userId: string, id: string, unlockType: UnlockType): Promise<MarketSignalView> {
    const signal = await this.repo.findSignalById(tenantId, id);

    const traceId = crypto.randomUUID();
    const idempotencyKey = `unlock:market:${tenantId}:${id}:${unlockType}`;

    // Pre-charge credits (throws BusinessError if insufficient)
    try {
      await this.creditService.preCharge({
        amount: signal.unlockCredits,
        idempotencyKey,
        tenantId,
        traceId,
        userId,
      });
    } catch (err: unknown) {
      if (err instanceof BusinessError) {
        throw new BusinessError(ErrorCodes.MARKET_SIGNAL_INSUFFICIENT_CREDITS);
      }
      throw err;
    }

    // Create unlock log in DB
    try {
      await this.repo.createUnlockLog(tenantId, userId, id, unlockType, signal.unlockCredits, traceId, 'success');
    } catch (err: unknown) {
      // Rollback pre-charge on DB failure
      try {
        await this.creditService.refund({
          amount: signal.unlockCredits,
          idempotencyKey: `refund:${idempotencyKey}`,
          tenantId,
          traceId,
          userId,
        });
      } catch {
        // swallow
      }
      throw err;
    }

    // Commit credit transaction
    await this.creditService.commit({
      amount: signal.unlockCredits,
      idempotencyKey,
      tenantId,
      traceId,
      userId,
    });

    return signal;
  }

  async generateAnalysis(
    tenantId: string,
    userId: string,
    signalId: string,
    generationType: MarketSignalGenerationType,
  ): Promise<MarketSignalGenerationLogView> {
    // 1. Ensure signal exists (tenant-isolated)
    await this.repo.findSignalById(tenantId, signalId);

    const traceId = crypto.randomUUID();
    const idempotencyKey = `generate-analysis:market:${tenantId}:${signalId}:${generationType}:${traceId}`;
    const creditsCost = GENERATION_TYPE_TO_CREDITS_COST[generationType];

    // 2. Pre-charge credits (throws BusinessError if insufficient)
    await this.creditService.preCharge({ amount: creditsCost, idempotencyKey, tenantId, traceId, userId });

    // 3. Invoke AI Gateway (prompt assembly, sanitizer, safety filter handled inside)
    let aiResponse: AiResponse<Record<string, unknown>>;
    try {
      aiResponse = await this.aiGateway.invoke<Record<string, unknown>>({
        taskType: GENERATION_TYPE_TO_TASK_TYPE[generationType],
        tenantId,
        userId,
        input: { signalId },
        context: {},
        options: { idempotencyKey },
      });
    } catch (err: unknown) {
      // AI failure → refund (spec §8: AI 失败必须回滚点数)
      try {
        await this.creditService.refund({ amount: creditsCost, idempotencyKey, tenantId, traceId, userId });
      } catch (refundErr) {
        void refundErr;
      }
      throw err;
    }

    // 4. Persist generation log
    let log: MarketSignalGenerationLogView;
    try {
      await this.repo.updateSignalViewCount(tenantId, signalId);
      log = await this.repo.createGenerationLog(tenantId, userId, signalId, generationType, creditsCost, traceId, 'success');
    } catch (err: unknown) {
      // DB failure → refund
      try {
        await this.creditService.refund({ amount: creditsCost, idempotencyKey, tenantId, traceId, userId });
      } catch (refundErr) {
        void refundErr;
      }
      throw err;
    }

    // 5. Commit the credit charge
    await this.creditService.commit({ amount: creditsCost, idempotencyKey, sourceResource: `market-situation/signals/${signalId}/${generationType}`, tenantId, traceId, userId });

    void aiResponse;
    return log;
  }

  async listSimulations(tenantId: string, signalId: string): Promise<MarketSignalSimulationView[]> {
    return this.repo.listSimulations(tenantId, signalId);
  }

  async createSimulation(
    tenantId: string,
    userId: string,
    signalId: string,
    simulationType: SimulationType,
    inputParams: Record<string, unknown>,
  ): Promise<MarketSignalSimulationView> {
    // Ensure signal exists
    await this.repo.findSignalById(tenantId, signalId);
    return this.repo.createSimulation(tenantId, userId, signalId, simulationType, inputParams);
  }

  async getSimulation(tenantId: string, id: string): Promise<MarketSignalSimulationView> {
    return this.repo.findSimulationById(tenantId, id);
  }

  async listReports(tenantId: string, signalId: string): Promise<MarketSignalReportView[]> {
    return this.repo.listReports(tenantId, signalId);
  }

  async createReport(
    tenantId: string,
    userId: string,
    signalId: string,
    reportType: MarketSignalReportType,
  ): Promise<{ reportId: string }> {
    // Ensure signal exists
    await this.repo.findSignalById(tenantId, signalId);
    const report = await this.repo.createReport(tenantId, userId, signalId, reportType);
    return { reportId: report.id };
  }

  async getReport(tenantId: string, id: string): Promise<MarketSignalReportView> {
    return this.repo.findReportById(tenantId, id);
  }

  async createFeedback(
    tenantId: string,
    userId: string,
    signalId: string,
    feedbackType: FeedbackType,
    rating: number,
    comment?: string,
  ): Promise<MarketSignalFeedbackView> {
    return this.repo.createFeedback(tenantId, userId, signalId, feedbackType, rating, comment);
  }

  async listFeedbacks(tenantId: string, signalId: string): Promise<MarketSignalFeedbackView[]> {
    return this.repo.listFeedbacks(tenantId, signalId);
  }

  async listSources(): Promise<MarketSignalSourceView[]> {
    return this.repo.listSources();
  }

  async listTags(): Promise<MarketSignalTagView[]> {
    return this.repo.listTags();
  }

  async listUnlockLogs(tenantId: string): Promise<MarketSignalUnlockLogView[]> {
    return this.repo.listUnlockLogs(tenantId);
  }

  async listGenerationLogs(tenantId: string): Promise<MarketSignalGenerationLogView[]> {
    return this.repo.listGenerationLogs(tenantId);
  }
}
