import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type {
  MarketSignal,
  MarketSignalSource,
  MarketSignalTag,
  MarketSignalUnlockLog,
  MarketSignalSimulation,
  MarketSignalReport,
  MarketSignalFeedback,
  MarketSignalGenerationLog,
} from '@prisma/client';
import { NotFoundError, type ErrorCode } from '@tongqian/errors';
import { AiConfidenceLevel, AiOutputTier } from '@tongqian/types';
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
  SignalType,
  OpportunityLevel,
  OwnerRiskLevel,
  SourceType,
} from '@tongqian/types';

import { BaseRepository } from '../../database/repository/base.repository.js';

@Injectable()
export class MarketSituationRepository extends BaseRepository {
  constructor(@Inject(PrismaClient) private readonly prisma: PrismaClient) {
    super();
  }

  async listSignals(
    tenantId: string,
    page: number,
    pageSize: number,
    filters: { region?: string; signalType?: string; riskLevel?: string },
  ): Promise<{ list: MarketSignalView[]; total: number }> {
    const where: Record<string, unknown> = {
      tenantId,
      deletedAt: null,
      isPublished: true,
    };

    if (filters.region) {
      where.region = filters.region;
    }
    if (filters.signalType) {
      where.signalType = filters.signalType;
    }
    if (filters.riskLevel) {
      where.riskLevel = filters.riskLevel;
    }

    const total = await this.prisma.marketSignal.count({ where: where as never });
    const skip = (page - 1) * pageSize;
    const rows = await this.prisma.marketSignal.findMany({
      where: where as never,
      skip,
      take: pageSize,
      orderBy: { publishedAt: 'desc' },
    });

    return {
      list: rows.map(r => this.toSignalView(r)),
      total,
    };
  }

  async listFeaturedSignals(tenantId: string): Promise<MarketSignalView[]> {
    const rows = await this.prisma.marketSignal.findMany({
      where: {
        tenantId,
        isPublished: true,
        isFeatured: true,
        deletedAt: null,
      },
      orderBy: { publishedAt: 'desc' },
    });
    return rows.map(r => this.toSignalView(r));
  }

  async findSignalById(tenantId: string, signalId: string): Promise<MarketSignalView> {
    const row = await this.prisma.marketSignal.findFirst({
      where: { id: signalId, tenantId, deletedAt: null },
    });
    if (!row) {
      throw new NotFoundError({
        code: 'MARKET_SIGNAL_NOT_FOUND' as ErrorCode,
        message: 'Market signal not found',
      });
    }
    return this.toSignalView(row);
  }

  async createSignal(tenantId: string, userId: string, dto: CreateMarketSignalDto): Promise<MarketSignalView> {
    const row = await this.prisma.marketSignal.create({
      data: {
        tenantId,
        userId,
        signalType: dto.signalType,
        title: dto.title,
        summary: dto.summary,
        region: dto.region,
        businessLine: dto.businessLine || null,
        riskLevel: dto.riskLevel || 'low',
        opportunityLevel: dto.opportunityLevel || 'medium',
        confidence: 'high',
        sourceUrl: dto.sourceUrl || null,
        rawData: dto.rawData ? (dto.rawData as never) : (null as never),
        tags: dto.tags ? (dto.tags as never) : [],
        isPublished: true,
        isFeatured: false,
        tierBadge: 1,
        unlockCredits: 50,
        viewCount: 0,
        feedbackCount: 0,
      },
    });
    return this.toSignalView(row);
  }

  async updateSignalViewCount(tenantId: string, signalId: string): Promise<void> {
    const row = await this.prisma.marketSignal.findFirst({
      where: { id: signalId, tenantId, deletedAt: null },
    });
    if (!row) {
      throw new NotFoundError({
        code: 'MARKET_SIGNAL_NOT_FOUND' as ErrorCode,
        message: 'Market signal not found',
      });
    }
    await this.prisma.marketSignal.update({
      where: { id: signalId },
      data: { viewCount: { increment: 1 } },
    });
  }

  async createUnlockLog(
    tenantId: string,
    userId: string,
    signalId: string,
    unlockType: UnlockType,
    creditsCharged: number,
    traceId: string,
    status: 'success' | 'failed' | 'refunded' = 'success',
  ): Promise<MarketSignalUnlockLogView> {
    const row = await this.prisma.marketSignalUnlockLog.create({
      data: {
        tenantId,
        userId,
        signalId,
        unlockType,
        creditsCharged,
        traceId,
        status,
      },
    });
    return this.toUnlockLogView(row);
  }

  async listUnlockLogs(tenantId: string): Promise<MarketSignalUnlockLogView[]> {
    const rows = await this.prisma.marketSignalUnlockLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(r => this.toUnlockLogView(r));
  }

  async createSimulation(
    tenantId: string,
    userId: string,
    signalId: string,
    simulationType: SimulationType,
    inputParams: Record<string, unknown>,
  ): Promise<MarketSignalSimulationView> {
    const row = await this.prisma.marketSignalSimulation.create({
      data: {
        tenantId,
        userId,
        signalId,
        simulationType,
        inputParams: inputParams as never,
        simulationResult: {} as never,
        confidence: 'high',
        tierBadge: 1,
        creditsCost: 80,
      },
    });
    return this.toSimulationView(row);
  }

  async listSimulations(tenantId: string, signalId: string): Promise<MarketSignalSimulationView[]> {
    const rows = await this.prisma.marketSignalSimulation.findMany({
      where: { tenantId, signalId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(r => this.toSimulationView(r));
  }

  async findSimulationById(tenantId: string, id: string): Promise<MarketSignalSimulationView> {
    const row = await this.prisma.marketSignalSimulation.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!row) {
      throw new NotFoundError({
        code: 'MARKET_SIGNAL_SIMULATION_NOT_FOUND' as ErrorCode,
        message: 'Simulation not found',
      });
    }
    return this.toSimulationView(row);
  }

  async createReport(
    tenantId: string,
    userId: string,
    signalId: string,
    reportType: MarketSignalReportType,
  ): Promise<MarketSignalReportView> {
    const row = await this.prisma.marketSignalReport.create({
      data: {
        tenantId,
        userId,
        signalId,
        reportType,
        title: 'Market Signal Report',
        tierBadge: 1,
        confidence: 'high',
        executiveSummary: 'Analysis complete',
        dataSnapshot: {} as never,
        creditsCost: 120,
        disclaimer: 'This is an AI-generated report',
      },
    });
    return this.toReportView(row);
  }

  async listReports(tenantId: string, signalId: string): Promise<MarketSignalReportView[]> {
    const rows = await this.prisma.marketSignalReport.findMany({
      where: { tenantId, signalId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(r => this.toReportView(r));
  }

  async findReportById(tenantId: string, id: string): Promise<MarketSignalReportView> {
    const row = await this.prisma.marketSignalReport.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!row) {
      throw new NotFoundError({
        code: 'MARKET_SIGNAL_REPORT_NOT_FOUND' as ErrorCode,
        message: 'Report not found',
      });
    }
    return this.toReportView(row);
  }

  async createFeedback(
    tenantId: string,
    userId: string,
    signalId: string,
    feedbackType: FeedbackType,
    rating: number,
    comment?: string,
  ): Promise<MarketSignalFeedbackView> {
    // Check if signal exists and increment feedbackCount
    await this.findSignalById(tenantId, signalId);

    const row = await this.prisma.marketSignalFeedback.create({
      data: {
        tenantId,
        userId,
        signalId,
        feedbackType,
        rating,
        comment: comment || null,
      },
    });

    await this.prisma.marketSignal.update({
      where: { id: signalId },
      data: { feedbackCount: { increment: 1 } },
    });

    return this.toFeedbackView(row);
  }

  async listFeedbacks(tenantId: string, signalId: string): Promise<MarketSignalFeedbackView[]> {
    const rows = await this.prisma.marketSignalFeedback.findMany({
      where: { tenantId, signalId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(r => this.toFeedbackView(r));
  }

  async listSources(): Promise<MarketSignalSourceView[]> {
    const rows = await this.prisma.marketSignalSource.findMany({
      where: { isActive: true },
      orderBy: { sourceName: 'asc' },
    });
    return rows.map(r => this.toSourceView(r));
  }

  async listTags(): Promise<MarketSignalTagView[]> {
    const rows = await this.prisma.marketSignalTag.findMany({
      orderBy: { tagName: 'asc' },
    });
    return rows.map(r => this.toTagView(r));
  }

  async createGenerationLog(
    tenantId: string,
    userId: string,
    signalId: string,
    generationType: string,
    creditsCost: number,
    traceId: string,
    status: string = 'success',
  ): Promise<MarketSignalGenerationLogView> {
    const row = await this.prisma.marketSignalGenerationLog.create({
      data: {
        tenantId,
        userId,
        signalId,
        generationType,
        creditsCost,
        traceId,
        status,
        inputSnapshot: {} as never,
        outputSnapshot: {} as never,
      },
    });
    return this.toGenerationLogView(row);
  }

  async listGenerationLogs(tenantId: string): Promise<MarketSignalGenerationLogView[]> {
    const rows = await this.prisma.marketSignalGenerationLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(r => this.toGenerationLogView(r));
  }

  // Mappers
  private toSignalView(row: MarketSignal): MarketSignalView {
    let parsedTags: string[] = [];
    if (row.tags) {
      if (typeof row.tags === 'string') {
        parsedTags = JSON.parse(row.tags);
      } else if (Array.isArray(row.tags)) {
        parsedTags = row.tags as string[];
      }
    }

    return {
      id: row.id,
      tenantId: row.tenantId,
      userId: row.userId,
      signalType: row.signalType as SignalType,
      title: row.title,
      summary: row.summary,
      region: row.region,
      businessLine: row.businessLine || undefined,
      riskLevel: row.riskLevel as OwnerRiskLevel,
      opportunityLevel: row.opportunityLevel as OpportunityLevel,
      confidence: (row.confidence === 'high' ? AiConfidenceLevel.HIGH : row.confidence === 'medium' ? AiConfidenceLevel.MEDIUM : AiConfidenceLevel.LOW),
      sourceId: row.sourceId || undefined,
      sourceUrl: row.sourceUrl || undefined,
      rawData: row.rawData ? (row.rawData as Record<string, unknown>) : undefined,
      impactAnalysis: row.impactAnalysis ? (row.impactAnalysis as never) : undefined,
      isPublished: row.isPublished,
      isFeatured: row.isFeatured,
      tierBadge: row.tierBadge === 1 ? AiOutputTier.TIER_1 : row.tierBadge === 2 ? AiOutputTier.TIER_2 : row.tierBadge === 3 ? AiOutputTier.TIER_3 : AiOutputTier.TIER_4,
      unlockCredits: row.unlockCredits,
      viewCount: row.viewCount,
      feedbackCount: row.feedbackCount,
      tags: parsedTags,
      publishedAt: row.publishedAt.toISOString(),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private toUnlockLogView(row: MarketSignalUnlockLog): MarketSignalUnlockLogView {
    return {
      id: row.id,
      signalId: row.signalId,
      tenantId: row.tenantId,
      userId: row.userId,
      unlockType: row.unlockType as UnlockType,
      creditsCharged: row.creditsCharged,
      status: row.status as 'success' | 'failed' | 'refunded',
      traceId: row.traceId,
      createdAt: row.createdAt.toISOString(),
    };
  }

  private toSimulationView(row: MarketSignalSimulation): MarketSignalSimulationView {
    return {
      id: row.id,
      signalId: row.signalId,
      tenantId: row.tenantId,
      userId: row.userId,
      simulationType: row.simulationType as SimulationType,
      inputParams: row.inputParams as Record<string, unknown>,
      simulationResult: row.simulationResult as Record<string, unknown>,
      confidence: (row.confidence === 'high' ? AiConfidenceLevel.HIGH : row.confidence === 'medium' ? AiConfidenceLevel.MEDIUM : AiConfidenceLevel.LOW),
      tierBadge: row.tierBadge === 1 ? AiOutputTier.TIER_1 : row.tierBadge === 2 ? AiOutputTier.TIER_2 : row.tierBadge === 3 ? AiOutputTier.TIER_3 : AiOutputTier.TIER_4,
      aiTaskId: row.aiTaskId || undefined,
      creditsCost: row.creditsCost,
      createdAt: row.createdAt.toISOString(),
    };
  }

  private toReportView(row: MarketSignalReport): MarketSignalReportView {
    return {
      id: row.id,
      signalId: row.signalId,
      tenantId: row.tenantId,
      userId: row.userId,
      reportType: row.reportType as MarketSignalReportType,
      title: row.title,
      tierBadge: row.tierBadge === 1 ? AiOutputTier.TIER_1 : row.tierBadge === 2 ? AiOutputTier.TIER_2 : row.tierBadge === 3 ? AiOutputTier.TIER_3 : AiOutputTier.TIER_4,
      confidence: (row.confidence === 'high' ? AiConfidenceLevel.HIGH : row.confidence === 'medium' ? AiConfidenceLevel.MEDIUM : AiConfidenceLevel.LOW),
      executiveSummary: row.executiveSummary,
      dataSnapshot: row.dataSnapshot as Record<string, unknown>,
      h5Url: row.h5Url || undefined,
      pdfUrl: row.pdfUrl || undefined,
      aiTaskId: row.aiTaskId || undefined,
      reportId: row.reportId || undefined,
      creditsCost: row.creditsCost,
      disclaimer: row.disclaimer,
      createdAt: row.createdAt.toISOString(),
    };
  }

  private toFeedbackView(row: MarketSignalFeedback): MarketSignalFeedbackView {
    return {
      id: row.id,
      signalId: row.signalId,
      tenantId: row.tenantId,
      userId: row.userId,
      feedbackType: row.feedbackType as FeedbackType,
      rating: row.rating,
      comment: row.comment || undefined,
      createdAt: row.createdAt.toISOString(),
    };
  }

  private toSourceView(row: MarketSignalSource): MarketSignalSourceView {
    let parsedTypes: string[] = [];
    if (row.dataTypes) {
      if (typeof row.dataTypes === 'string') {
        parsedTypes = JSON.parse(row.dataTypes);
      } else if (Array.isArray(row.dataTypes)) {
        parsedTypes = row.dataTypes as string[];
      }
    }

    return {
      id: row.id,
      sourceName: row.sourceName,
      sourceType: row.sourceType as SourceType,
      sourceUrl: row.sourceUrl || undefined,
      region: row.region,
      dataTypes: parsedTypes,
      crawlIntervalMin: row.crawlIntervalMin,
      isActive: row.isActive,
      lastCrawledAt: row.lastCrawledAt ? row.lastCrawledAt.toISOString() : undefined,
      healthStatus: row.healthStatus as 'healthy' | 'degraded' | 'unknown',
      createdAt: new Date().toISOString(),
    };
  }

  private toTagView(row: MarketSignalTag): MarketSignalTagView {
    return {
      id: row.id,
      tagKey: row.tagKey,
      tagName: row.tagName,
      tagCategory: row.tagCategory as never,
      usageCount: row.usageCount,
      createdAt: row.createdAt.toISOString(),
    };
  }

  private toGenerationLogView(row: MarketSignalGenerationLog): MarketSignalGenerationLogView {
    return {
      id: row.id,
      signalId: row.signalId,
      tenantId: row.tenantId,
      userId: row.userId,
      generationType: row.generationType as never,
      aiTaskId: row.aiTaskId || undefined,
      inputSnapshot: row.inputSnapshot as Record<string, unknown>,
      outputSnapshot: row.outputSnapshot ? (row.outputSnapshot as Record<string, unknown>) : undefined,
      creditsCost: row.creditsCost,
      status: row.status as never,
      errorCode: row.errorCode || undefined,
      traceId: row.traceId,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
