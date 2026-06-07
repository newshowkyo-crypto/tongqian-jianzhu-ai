import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient, type Prisma } from '@prisma/client';
import { BusinessError, NotFoundError, type ErrorCode } from '@tongqian/errors';
import type { OwnerRiskCardView, OwnerRiskUnlockLogView, OwnerRiskReportView, CreateOwnerRiskProfileDto, UpdateOwnerRiskProfileDto, OwnerRiskProfileView, OwnerRiskReviewRequestView, ReviewType, OwnerRiskGenerationLogView, OwnerRiskGenerationType, OwnerGuaranteeRecordView, OwnerCompanyMixingRecordView, CounterpartyWatchlistView, CounterpartyRiskEventView, ReceivableRiskRecordView } from '@tongqian/types';

import { BaseRepository } from '../../database/repository/base.repository.js';

@Injectable()
export class OwnerRiskRepository extends BaseRepository {
  constructor(@Inject(PrismaClient) private readonly prisma: PrismaClient) {
    super();
  }

  async findCardById(tenantId: string, cardId: string): Promise<OwnerRiskCardView> {
    const row = await this.prisma.ownerRiskCard.findFirst({
      where: { id: cardId, tenantId, deletedAt: null },
    });
    if (!row) {
      throw new NotFoundError({ code: 'OWNER_RISK_CARD_NOT_FOUND' as ErrorCode, message: 'Owner risk card not found.' });
    }
    return this.toCardView(row);
  }

  async listCards(tenantId: string): Promise<OwnerRiskCardView[]> {
    const rows = await this.prisma.ownerRiskCard.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(r => this.toCardView(r as unknown as Awaited<ReturnType<typeof this.prisma.ownerRiskCard.findFirst>>));
  }

  async updateCardUnlock(tenantId: string, cardId: string, isUnlocked: boolean): Promise<void> {
    const row = await this.prisma.ownerRiskCard.findFirst({
      where: { id: cardId, tenantId, deletedAt: null },
    });
    if (!row) {
      throw new NotFoundError({ code: 'OWNER_RISK_CARD_NOT_FOUND' as ErrorCode, message: 'Owner risk card not found.' });
    }
    await this.prisma.ownerRiskCard.update({
      data: { isUnlocked, updatedAt: new Date() },
      where: { id: cardId },
    });
  }

  async createUnlockLog(data: {
    cardId: string;
    cardKey?: string;
    creditsCharged: number;
    idempotencyKey?: string;
    profileId: string;
    status: 'success' | 'failed' | 'refunded';
    tenantId: string;
    traceId: string;
    userId: string;
  }): Promise<void> {
    await this.prisma.ownerRiskUnlockLog.create({
      data: {
        cardId: data.cardId,
        cardKey: data.cardKey,
        creditsCharged: data.creditsCharged,
        idempotencyKey: data.idempotencyKey,
        profileId: data.profileId,
        status: data.status,
        tenantId: data.tenantId,
        traceId: data.traceId,
        userId: data.userId,
      },
    });
  }

  async listUnlockLogs(tenantId: string): Promise<OwnerRiskUnlockLogView[]> {
    const rows = await this.prisma.ownerRiskUnlockLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(r => ({
      id: r.id,
      profileId: r.profileId,
      tenantId: r.tenantId,
      userId: r.userId,
      cardId: r.cardId ?? undefined,
      cardKey: r.cardKey ?? undefined,
      creditsCharged: r.creditsCharged,
      status: r.status as OwnerRiskUnlockLogView['status'],
      traceId: r.traceId,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async listReports(tenantId: string, profileId: string): Promise<OwnerRiskReportView[]> {
    const rows = await this.prisma.ownerRiskReport.findMany({
      where: { tenantId, profileId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(r => this.toReportView(r as unknown as Awaited<ReturnType<typeof this.prisma.ownerRiskReport.findFirst>>));
  }

  async findReportById(tenantId: string, reportId: string): Promise<OwnerRiskReportView> {
    const row = await this.prisma.ownerRiskReport.findFirst({ where: { id: reportId, tenantId, deletedAt: null } });
    if (!row) {
      throw new NotFoundError({ code: 'OWNER_RISK_REPORT_NOT_FOUND' as ErrorCode, message: 'Owner risk report not found.' });
    }
    return this.toReportView(row as unknown as Awaited<ReturnType<typeof this.prisma.ownerRiskReport.findFirst>>);
  }

  async createReport(data: {
    tenantId: string;
    userId: string;
    profileId: string;
    reportType: string;
    title: string;
    tierBadge: number;
    confidence: string;
    riskLevel: string;
    executiveSummary: string;
    dataSnapshot: Record<string, unknown>;
    sections: Array<{
      sectionKey: string;
      title: string;
      content: string;
      riskLevel?: string;
      tierBadge?: number;
      confidence?: string;
      suggestedActions?: string[];
    }>;
    creditsCost: number;
    disclaimer: string;
  }): Promise<OwnerRiskReportView> {
    const row = await this.prisma.ownerRiskReport.create({
      data: {
        tenantId: data.tenantId,
        userId: data.userId,
        profileId: data.profileId,
        reportType: data.reportType,
        title: data.title,
        tierBadge: data.tierBadge,
        confidence: data.confidence,
        riskLevel: data.riskLevel,
        executiveSummary: data.executiveSummary,
        dataSnapshot: data.dataSnapshot as unknown as Prisma.InputJsonValue,
        sections: data.sections as unknown as Prisma.InputJsonValue,
        creditsCost: data.creditsCost,
        disclaimer: data.disclaimer,
      },
    });
    return this.toReportView(row as unknown as Awaited<ReturnType<typeof this.prisma.ownerRiskReport.findFirst>>);
  }

  async listProfiles(tenantId: string, userId: string, page: number, pageSize: number): Promise<{ list: OwnerRiskProfileView[]; total: number }> {
    const where = { tenantId, userId, deletedAt: null };
    const [rows, total] = await Promise.all([
      this.prisma.ownerRiskProfile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.ownerRiskProfile.count({ where }),
    ]);
    return {
      list: rows.map(r => this.toProfileView(r as unknown as Awaited<ReturnType<typeof this.prisma.ownerRiskProfile.findFirst>>)),
      total,
    };
  }

  async createProfile(tenantId: string, userId: string, dto: CreateOwnerRiskProfileDto): Promise<OwnerRiskProfileView> {
    const row = await this.prisma.ownerRiskProfile.create({
      data: {
        tenantId,
        userId,
        ownerName: dto.ownerName,
        idCardMasked: dto.idCardMasked ?? null,
        creditCode: dto.creditCode ?? null,
        overallRiskLevel: 'medium',
        guaranteeRiskLevel: 'medium',
        mixingRiskLevel: 'medium',
        counterpartyRiskLevel: 'medium',
        receivableRiskLevel: 'medium',
        riskScore: 50,
      },
    });
    return this.toProfileView(row as unknown as Awaited<ReturnType<typeof this.prisma.ownerRiskProfile.findFirst>>);
  }

  async findProfileById(tenantId: string, profileId: string): Promise<OwnerRiskProfileView> {
    const row = await this.prisma.ownerRiskProfile.findFirst({
      where: { id: profileId, tenantId, deletedAt: null },
    });
    if (!row) {
      throw new NotFoundError({ code: 'OWNER_RISK_PROFILE_NOT_FOUND' as ErrorCode, message: 'Profile not found.' });
    }
    return this.toProfileView(row as unknown as Awaited<ReturnType<typeof this.prisma.ownerRiskProfile.findFirst>>);
  }

  async updateProfile(tenantId: string, profileId: string, dto: UpdateOwnerRiskProfileDto): Promise<OwnerRiskProfileView> {
    await this.findProfileById(tenantId, profileId);
    const row = await this.prisma.ownerRiskProfile.update({
      where: { id: profileId },
      data: {
        ownerName: dto.ownerName !== undefined ? dto.ownerName : undefined,
        idCardMasked: dto.idCardMasked !== undefined ? dto.idCardMasked : undefined,
        creditCode: dto.creditCode !== undefined ? dto.creditCode : undefined,
        updatedAt: new Date(),
      },
    });
    return this.toProfileView(row as unknown as Awaited<ReturnType<typeof this.prisma.ownerRiskProfile.findFirst>>);
  }

  async createReviewRequest(tenantId: string, userId: string, profileId: string, reviewType: ReviewType): Promise<OwnerRiskReviewRequestView> {
    const row = await this.prisma.ownerRiskReviewRequest.create({
      data: {
        tenantId,
        userId,
        profileId,
        reviewType,
        status: 'pending',
        creditsCost: 200,
      },
    });
    return this.toReviewRequestView(row as unknown as Awaited<ReturnType<typeof this.prisma.ownerRiskReviewRequest.findFirst>>);
  }

  async listReviewRequests(tenantId: string): Promise<OwnerRiskReviewRequestView[]> {
    const rows = await this.prisma.ownerRiskReviewRequest.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(r => this.toReviewRequestView(r as unknown as Awaited<ReturnType<typeof this.prisma.ownerRiskReviewRequest.findFirst>>));
  }

  async createGenerationLog(
    tenantId: string,
    userId: string,
    profileId: string,
    generationType: OwnerRiskGenerationType,
    inputSnapshot?: Record<string, unknown>,
    outputSnapshot?: Record<string, unknown>,
    creditsCost?: number,
  ): Promise<OwnerRiskGenerationLogView> {
    const traceId = crypto.randomUUID();
    const row = await this.prisma.ownerRiskGenerationLog.create({
      data: {
        tenantId,
        userId,
        profileId,
        generationType,
        inputSnapshot: (inputSnapshot ?? {}) as unknown as Prisma.InputJsonValue,
        outputSnapshot: (outputSnapshot ?? null) as unknown as Prisma.InputJsonValue,
        creditsCost: creditsCost ?? 0,
        status: 'success',
        traceId,
      },
    });
    return this.toGenerationLogView(row as unknown as Awaited<ReturnType<typeof this.prisma.ownerRiskGenerationLog.findFirst>>);
  }

  async listGenerationLogs(tenantId: string): Promise<OwnerRiskGenerationLogView[]> {
    const rows = await this.prisma.ownerRiskGenerationLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(r => this.toGenerationLogView(r as unknown as Awaited<ReturnType<typeof this.prisma.ownerRiskGenerationLog.findFirst>>));
  }

  private toReviewRequestView(row: Awaited<ReturnType<typeof this.prisma.ownerRiskReviewRequest.findFirst>>): OwnerRiskReviewRequestView {
    if (!row) {
      throw new BusinessError({ code: 'OWNER_RISK.REPOSITORY.INVALID_ROW' as ErrorCode, message: 'Review request row is required' });
    }
    return {
      id: row.id,
      profileId: row.profileId,
      tenantId: row.tenantId,
      userId: row.userId,
      reportId: row.reportId ?? undefined,
      reviewType: row.reviewType as OwnerRiskReviewRequestView['reviewType'],
      status: row.status as OwnerRiskReviewRequestView['status'],
      ticketId: row.ticketId ?? undefined,
      assignedTo: row.assignedTo ?? undefined,
      reviewResult: row.reviewResult ?? undefined,
      creditsCost: row.creditsCost,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      completedAt: row.completedAt?.toISOString() ?? undefined,
    };
  }

  private toGenerationLogView(row: Awaited<ReturnType<typeof this.prisma.ownerRiskGenerationLog.findFirst>>): OwnerRiskGenerationLogView {
    if (!row) {
      throw new BusinessError({ code: 'OWNER_RISK.REPOSITORY.INVALID_ROW' as ErrorCode, message: 'Generation log row is required' });
    }
    return {
      id: row.id,
      profileId: row.profileId,
      tenantId: row.tenantId,
      userId: row.userId,
      generationType: row.generationType as OwnerRiskGenerationType,
      aiTaskId: row.aiTaskId ?? undefined,
      inputSnapshot: row.inputSnapshot as Record<string, unknown>,
      outputSnapshot: (row.outputSnapshot ?? undefined) as Record<string, unknown> | undefined,
      creditsCost: row.creditsCost,
      status: row.status as OwnerRiskGenerationLogView['status'],
      errorCode: row.errorCode ?? undefined,
      traceId: row.traceId,
      createdAt: row.createdAt.toISOString(),
    };
  }

  private toProfileView(row: Awaited<ReturnType<typeof this.prisma.ownerRiskProfile.findFirst>>): OwnerRiskProfileView {
    if (!row) {
      throw new BusinessError({ code: 'OWNER_RISK.REPOSITORY.INVALID_ROW' as ErrorCode, message: 'Profile row is required' });
    }
    return {
      id: row.id,
      tenantId: row.tenantId,
      userId: row.userId,
      ownerName: row.ownerName,
      idCardMasked: row.idCardMasked ?? undefined,
      creditCode: row.creditCode ?? undefined,
      overallRiskLevel: row.overallRiskLevel as OwnerRiskProfileView['overallRiskLevel'],
      guaranteeRiskLevel: row.guaranteeRiskLevel as OwnerRiskProfileView['guaranteeRiskLevel'],
      mixingRiskLevel: row.mixingRiskLevel as OwnerRiskProfileView['mixingRiskLevel'],
      counterpartyRiskLevel: row.counterpartyRiskLevel as OwnerRiskProfileView['counterpartyRiskLevel'],
      receivableRiskLevel: row.receivableRiskLevel as OwnerRiskProfileView['receivableRiskLevel'],
      riskScore: row.riskScore,
      lastAnalyzedAt: row.lastAnalyzedAt?.toISOString() ?? undefined,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private toCardView(row: Awaited<ReturnType<typeof this.prisma.ownerRiskCard.findFirst>>): OwnerRiskCardView {
    if (!row) {
      throw new BusinessError({ code: 'OWNER_RISK.REPOSITORY.INVALID_ROW' as ErrorCode, message: 'Card row is required' });
    }
    return {
      cardKey: row.cardKey,
      cardType: row.cardType as OwnerRiskCardView['cardType'],
      confidence: row.confidence as OwnerRiskCardView['confidence'],
      createdAt: row.createdAt.toISOString(),
      dataSnapshot: row.dataSnapshot as Record<string, unknown>,
      dataSource: (row.dataSource ?? undefined) as OwnerRiskCardView['dataSource'],
      disclaimer: row.disclaimer,
      id: row.id,
      isAiGenerated: row.isAiGenerated,
      isUnlocked: row.isUnlocked,
      riskLevel: row.riskLevel as OwnerRiskCardView['riskLevel'],
      sourceUrl: (row.sourceUrl ?? undefined) as OwnerRiskCardView['sourceUrl'],
      summary: row.summary,
      tenantId: row.tenantId,
      tierBadge: row.tierBadge as OwnerRiskCardView['tierBadge'],
      title: row.title,
      unlockCredits: row.unlockCredits,
      updatedAt: row.updatedAt.toISOString(),
      userId: row.userId,
    };
  }

  private toReportView(row: Awaited<ReturnType<typeof this.prisma.ownerRiskReport.findFirst>>): OwnerRiskReportView {
    if (!row) {
      throw new BusinessError({ code: 'OWNER_RISK.REPOSITORY.INVALID_ROW' as ErrorCode, message: 'Report row is required' });
    }
    return {
      id: row.id,
      profileId: row.profileId,
      tenantId: row.tenantId,
      userId: row.userId,
      reportType: row.reportType as OwnerRiskReportView['reportType'],
      title: row.title,
      tierBadge: row.tierBadge as OwnerRiskReportView['tierBadge'],
      confidence: row.confidence as OwnerRiskReportView['confidence'],
      riskLevel: row.riskLevel as OwnerRiskReportView['riskLevel'],
      executiveSummary: row.executiveSummary,
      dataSnapshot: row.dataSnapshot as Record<string, unknown>,
      sections: (row.sections ?? []) as unknown as OwnerRiskReportView['sections'],
      h5Url: row.h5Url ?? undefined,
      pdfUrl: row.pdfUrl ?? undefined,
      aiTaskId: row.aiTaskId ?? undefined,
      reportId: row.reportId ?? undefined,
      creditsCost: row.creditsCost,
      disclaimer: row.disclaimer,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async listGuaranteeRecords(tenantId: string, profileId: string): Promise<OwnerGuaranteeRecordView[]> {
    const rows = await this.prisma.ownerGuaranteeRecord.findMany({
      where: { tenantId, profileId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(r => ({
      id: r.id,
      profileId: r.profileId,
      tenantId: r.tenantId,
      guaranteedCompany: r.guaranteedCompany,
      guaranteeAmount: Number(r.guaranteeAmount),
      guaranteeType: r.guaranteeType as OwnerGuaranteeRecordView['guaranteeType'],
      startDate: r.startDate?.toISOString(),
      endDate: r.endDate?.toISOString(),
      status: r.status as OwnerGuaranteeRecordView['status'],
      riskLevel: r.riskLevel as OwnerGuaranteeRecordView['riskLevel'],
      aiAnalysis: r.aiAnalysis ?? undefined,
      documentUrl: r.documentUrl ?? undefined,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  async listMixingRecords(tenantId: string, profileId: string): Promise<OwnerCompanyMixingRecordView[]> {
    const rows = await this.prisma.ownerCompanyMixingRecord.findMany({
      where: { tenantId, profileId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(r => ({
      id: r.id,
      profileId: r.profileId,
      tenantId: r.tenantId,
      mixingType: r.mixingType as OwnerCompanyMixingRecordView['mixingType'],
      description: r.description,
      riskLevel: r.riskLevel as OwnerCompanyMixingRecordView['riskLevel'],
      evidence: (r.evidence ?? {}) as Record<string, unknown>,
      aiSuggestion: r.aiSuggestion ?? undefined,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  async listCounterpartyWatchlist(tenantId: string): Promise<CounterpartyWatchlistView[]> {
    const rows = await this.prisma.counterpartyWatchlist.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(r => ({
      id: r.id,
      profileId: r.profileId,
      tenantId: r.tenantId,
      counterpartyName: r.counterpartyName,
      counterpartyCode: r.counterpartyCode ?? undefined,
      counterpartyType: r.counterpartyType as CounterpartyWatchlistView['counterpartyType'],
      riskLevel: r.riskLevel as CounterpartyWatchlistView['riskLevel'],
      riskEvents: (r.riskEvents ?? []) as unknown as CounterpartyRiskEventView[],
      lastEventAt: r.lastEventAt?.toISOString(),
      aiAnalysis: r.aiAnalysis ?? undefined,
      isWatched: r.isWatched,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  async listCounterpartyRiskEvents(tenantId: string, counterpartyId: string): Promise<CounterpartyRiskEventView[]> {
    const rows = await this.prisma.counterpartyRiskEvent.findMany({
      where: { tenantId, counterpartyId },
      orderBy: { eventDate: 'desc' },
    });
    return rows.map(r => ({
      id: r.id,
      counterpartyId: r.counterpartyId,
      tenantId: r.tenantId,
      eventType: r.eventType as CounterpartyRiskEventView['eventType'],
      eventDate: r.eventDate.toISOString(),
      eventSummary: r.eventSummary,
      severity: r.severity as CounterpartyRiskEventView['severity'],
      source: r.source,
      sourceUrl: r.sourceUrl ?? undefined,
      aiInterpretation: r.aiInterpretation ?? undefined,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async listReceivableRecords(tenantId: string, profileId: string): Promise<ReceivableRiskRecordView[]> {
    const rows = await this.prisma.receivableRiskRecord.findMany({
      where: { tenantId, profileId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(r => ({
      id: r.id,
      profileId: r.profileId,
      tenantId: r.tenantId,
      debtorName: r.debtorName,
      debtorCode: r.debtorCode ?? undefined,
      amount: Number(r.amount),
      invoiceNo: r.invoiceNo ?? undefined,
      invoiceDate: r.invoiceDate?.toISOString(),
      dueDate: r.dueDate?.toISOString(),
      ageBucket: r.ageBucket as ReceivableRiskRecordView['ageBucket'],
      status: r.status as ReceivableRiskRecordView['status'],
      riskLevel: r.riskLevel as ReceivableRiskRecordView['riskLevel'],
      aiAnalysis: r.aiAnalysis ?? undefined,
      collectionSuggest: r.collectionSuggest ?? undefined,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }
}
