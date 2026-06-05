import assert from 'node:assert/strict';
import test from 'node:test';
import 'reflect-metadata';

import { BusinessError } from '@tongqian/errors';
import { AiConfidenceLevel } from '@tongqian/types';
import type { OwnerRiskCardView, OwnerRiskUnlockLogView, OwnerRiskReportView, OwnerRiskReportSectionView, OwnerRiskReportType, OwnerRiskLevel, OwnerRiskProfileView, CreateOwnerRiskProfileDto, UpdateOwnerRiskProfileDto, OwnerRiskReviewRequestView, ReviewType, OwnerRiskGenerationLogView, OwnerRiskGenerationType, OwnerGuaranteeRecordView, OwnerCompanyMixingRecordView, CounterpartyWatchlistView, CounterpartyRiskEventView, ReceivableRiskRecordView } from '@tongqian/types';

import type { TenantContextService } from '../../common/context/tenant-context.service.js';

import { OwnerRiskController } from './owner-risk.controller.js';
import { OwnerRiskService } from './owner-risk.service.js';

type CreateReportInput = {
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
  sections: OwnerRiskReportSectionView[];
  creditsCost: number;
  disclaimer: string;
};

const TENANT_A = 'tenant-a';
const TENANT_B = 'tenant-b';
const USER_ID = 'user-1';

const mockCard: OwnerRiskCardView = {
  cardKey: 'guarantee_overview',
  cardType: 'guarantee',
  confidence: AiConfidenceLevel.HIGH,
  createdAt: '2026-06-01T00:00:00.000Z',
  dataSnapshot: {},
  disclaimer: 'AI generated reference',
  id: 'card-1',
  isAiGenerated: true,
  isUnlocked: false,
  riskLevel: 'medium',
  summary: 'Test card summary',
  tenantId: TENANT_A,
  tierBadge: 3,
  title: 'Guarantee Overview',
  unlockCredits: 50,
  updatedAt: '2026-06-01T00:00:00.000Z',
  userId: USER_ID,
};

const unlockedCard: OwnerRiskCardView = { ...mockCard, isUnlocked: true };

/** Minimal mock credit service matching the methods OwnerRiskService.unlockCard calls. */
function mockCredits(initialBalance = 0) {
  let balance = initialBalance;
  return {
    balance: () => balance,
    preCharge: (input: { amount: number }): { balanceAfter: number } => {
      if (balance < input.amount) {
        throw new BusinessError({ code: 'CREDIT.DEDUCT.INSUFFICIENT', details: { balance, requested: input.amount }, message: 'Insufficient credits.' });
      }
      balance -= input.amount;
      return { balanceAfter: balance };
    },
    commit: (_input: { amount: number }): void => {
      // Already deducted in preCharge; commit just records
    },
    refund: (input: { amount: number }): void => {
      balance += input.amount;
    },
    topup: (input: { amount: number }): void => {
      balance += input.amount;
    },
  };
}

type MockCreditService = ReturnType<typeof mockCredits>;

type MockRepo = {
  createUnlockLog: (data: { cardId: string; status: string }) => Promise<void>;
  findCardById: (tenantId: string, cardId: string) => Promise<OwnerRiskCardView>;
  updateCardUnlock: (tenantId: string, cardId: string, isUnlocked: boolean) => Promise<void>;
  listCards?: (tenantId: string) => Promise<OwnerRiskCardView[]>;
  listUnlockLogs?: (tenantId: string) => Promise<OwnerRiskUnlockLogView[]>;
  listReports?: (tenantId: string, profileId: string) => Promise<OwnerRiskReportView[]>;
  findReportById?: (tenantId: string, reportId: string) => Promise<OwnerRiskReportView>;
  createReport?: (data: CreateReportInput) => Promise<OwnerRiskReportView>;
  listProfiles?: (tenantId: string, userId: string, page: number, pageSize: number) => Promise<{ list: OwnerRiskProfileView[]; total: number }>;
  createProfile?: (tenantId: string, userId: string, dto: CreateOwnerRiskProfileDto) => Promise<OwnerRiskProfileView>;
  findProfileById?: (tenantId: string, profileId: string) => Promise<OwnerRiskProfileView>;
  updateProfile?: (tenantId: string, profileId: string, dto: UpdateOwnerRiskProfileDto) => Promise<OwnerRiskProfileView>;
  createReviewRequest?: (tenantId: string, userId: string, profileId: string, reviewType: ReviewType) => Promise<OwnerRiskReviewRequestView>;
  listReviewRequests?: (tenantId: string) => Promise<OwnerRiskReviewRequestView[]>;
  createGenerationLog?: (tenantId: string, userId: string, profileId: string, generationType: OwnerRiskGenerationType, inputSnapshot?: Record<string, unknown>, outputSnapshot?: Record<string, unknown>, creditsCost?: number) => Promise<OwnerRiskGenerationLogView>;
  listGenerationLogs?: (tenantId: string) => Promise<OwnerRiskGenerationLogView[]>;
  listGuaranteeRecords?: (tenantId: string, profileId: string) => Promise<OwnerGuaranteeRecordView[]>;
  listMixingRecords?: (tenantId: string, profileId: string) => Promise<OwnerCompanyMixingRecordView[]>;
  listCounterpartyWatchlist?: (tenantId: string) => Promise<CounterpartyWatchlistView[]>;
  listCounterpartyRiskEvents?: (tenantId: string, counterpartyId: string) => Promise<CounterpartyRiskEventView[]>;
  listReceivableRecords?: (tenantId: string, profileId: string) => Promise<ReceivableRiskRecordView[]>;
};

function createService(
  repoStubs: Partial<MockRepo>,
  credit: MockCreditService,
  aiGatewayStubs?: unknown,
): OwnerRiskService {
  const repo: MockRepo = {
    createUnlockLog: repoStubs.createUnlockLog ?? (async () => undefined),
    findCardById: repoStubs.findCardById ?? (async (_tenantId: string) => mockCard),
    updateCardUnlock: repoStubs.updateCardUnlock ?? (async () => undefined),
    listCards: repoStubs.listCards ?? (async () => []),
    listUnlockLogs: repoStubs.listUnlockLogs ?? (async () => []),
    listReports: repoStubs.listReports ?? (async () => []),
    findReportById: repoStubs.findReportById ?? (async () => {
      throw Object.assign(new Error('Owner risk report not found.'), { code: 'OWNER_RISK_REPORT_NOT_FOUND' });
    }),
    createReport: repoStubs.createReport ?? (async (data: CreateReportInput) => {
      return {
        id: 'mock-report-id',
        profileId: data.profileId,
        tenantId: data.tenantId,
        userId: data.userId,
        reportType: data.reportType as OwnerRiskReportType,
        title: data.title,
        tierBadge: data.tierBadge,
        confidence: data.confidence as AiConfidenceLevel,
        riskLevel: data.riskLevel as OwnerRiskLevel,
        executiveSummary: data.executiveSummary,
        dataSnapshot: data.dataSnapshot,
        sections: data.sections,
        creditsCost: data.creditsCost,
        disclaimer: data.disclaimer,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }),
    listProfiles: repoStubs.listProfiles ?? (async () => ({ list: [], total: 0 })),
    createProfile: repoStubs.createProfile ?? (async (tenantId, userId, dto) => ({
      id: 'mock-profile-id',
      tenantId,
      userId,
      ownerName: dto.ownerName,
      idCardMasked: dto.idCardMasked,
      creditCode: dto.creditCode,
      overallRiskLevel: 'medium',
      guaranteeRiskLevel: 'medium',
      mixingRiskLevel: 'medium',
      counterpartyRiskLevel: 'medium',
      receivableRiskLevel: 'medium',
      riskScore: 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
    findProfileById: repoStubs.findProfileById ?? (async (tenantId, id) => ({
      id,
      tenantId,
      userId: USER_ID,
      ownerName: 'Mock Owner',
      overallRiskLevel: 'medium',
      guaranteeRiskLevel: 'medium',
      mixingRiskLevel: 'medium',
      counterpartyRiskLevel: 'medium',
      receivableRiskLevel: 'medium',
      riskScore: 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
    updateProfile: repoStubs.updateProfile ?? (async (tenantId, id, dto) => ({
      id,
      tenantId,
      userId: USER_ID,
      ownerName: dto.ownerName ?? 'Mock Owner',
      overallRiskLevel: 'medium',
      guaranteeRiskLevel: 'medium',
      mixingRiskLevel: 'medium',
      counterpartyRiskLevel: 'medium',
      receivableRiskLevel: 'medium',
      riskScore: 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
    createReviewRequest: repoStubs.createReviewRequest ?? (async (tenantId, userId, profileId, reviewType) => ({
      id: 'mock-review-id',
      profileId,
      tenantId,
      userId,
      reviewType,
      status: 'pending',
      creditsCost: 200,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
    listReviewRequests: repoStubs.listReviewRequests ?? (async () => []),
    createGenerationLog: repoStubs.createGenerationLog ?? (async (tenantId, userId, profileId, generationType, inputSnapshot, outputSnapshot, creditsCost) => ({
      id: 'mock-gen-id',
      profileId,
      tenantId,
      userId,
      generationType,
      inputSnapshot: inputSnapshot ?? {},
      outputSnapshot,
      creditsCost: creditsCost ?? 0,
      status: 'success',
      traceId: 'mock-trace-id',
      createdAt: new Date().toISOString(),
    })),
    listGenerationLogs: repoStubs.listGenerationLogs ?? (async () => []),
    listGuaranteeRecords: repoStubs.listGuaranteeRecords ?? (async () => []),
    listMixingRecords: repoStubs.listMixingRecords ?? (async () => []),
    listCounterpartyWatchlist: repoStubs.listCounterpartyWatchlist ?? (async () => []),
    listCounterpartyRiskEvents: repoStubs.listCounterpartyRiskEvents ?? (async () => []),
    listReceivableRecords: repoStubs.listReceivableRecords ?? (async () => []),
  };

  const aiGateway = aiGatewayStubs ?? {
    invoke: async () => ({
      data: {},
      cost: 0,
      provider: 'mock',
      traceId: 'mock-trace-id',
    }),
  };

  const svc = new OwnerRiskService(credit as never, repo as never, aiGateway as never);
  return svc;
}

test('unlockCard happy path: sufficient credits, unlocks card and writes log', async () => {
  let cardUpdated = false;
  let logWritten = false;
  let currentCard = { ...mockCard }; // start locked

  const credit = mockCredits(100); // sufficient balance

  const service = createService({
    findCardById: async () => currentCard,
    updateCardUnlock: async () => {
      cardUpdated = true;
      currentCard = { ...unlockedCard }; // now unlocked
    },
    createUnlockLog: async () => { logWritten = true; },
  }, credit);

  const result = await service.unlockCard(TENANT_A, USER_ID, 'card-1');

  assert.ok(result.isUnlocked, 'Card should be unlocked');
  assert.equal(result.id, 'card-1');
  assert.equal(cardUpdated, true);
  assert.equal(logWritten, true);
});

test('unlockCard insufficient credits: throws BusinessError, card stays locked', async () => {
  const credit = mockCredits(0); // zero balance

  let cardUpdated = false;

  const service = createService({
    findCardById: async () => mockCard,
    updateCardUnlock: async () => { cardUpdated = true; },
  }, credit);

  await assert.rejects(
    () => service.unlockCard(TENANT_A, USER_ID, 'card-1'),
    (err: unknown) => {
      const e = err as Error & { code: string };
      assert.equal(e.code, 'OWNER_RISK.CREDIT.INSUFFICIENT');
      return true;
    },
  );

  assert.equal(cardUpdated, false, 'Card should NOT be updated when credits are insufficient');
});

test('unlockCard tenant isolation: tenant B cannot unlock tenant As card', async () => {
  const credit = mockCredits(200);

  const service = createService({
    findCardById: async (tenantId: string) => {
      if (tenantId !== mockCard.tenantId) {
        throw Object.assign(new Error('Owner risk card not found.'), { code: 'OWNER_RISK_CARD_NOT_FOUND' });
      }
      return mockCard;
    },
  }, credit);

  await assert.rejects(
    () => service.unlockCard(TENANT_B, USER_ID, 'card-1'),
    (err: unknown) => {
      const e = err as Error & { code: string };
      assert.equal(e.code, 'OWNER_RISK_CARD_NOT_FOUND');
      return true;
    },
  );
});

test('unlockCard already unlocked: returns card as-is without credit deduction', async () => {
  const credit = mockCredits(0); // zero balance but shouldn't matter

  let cardUpdated = false;
  let logWritten = false;

  const service = createService({
    findCardById: async () => unlockedCard, // Already unlocked
    updateCardUnlock: async () => { cardUpdated = true; },
    createUnlockLog: async () => { logWritten = true; },
  }, credit);

  const result = await service.unlockCard(TENANT_A, USER_ID, 'card-1');

  assert.ok(result.isUnlocked, 'Card should remain unlocked');
  assert.equal(result.id, 'card-1');
  assert.equal(cardUpdated, false, 'Card should NOT be updated when already unlocked');
  assert.equal(logWritten, false, 'No unlock log should be written when already unlocked');

  assert.equal(credit.balance(), 0, 'No credits should be deducted');
});

test('listCards returns only current tenant cards', async () => {
  const credit = mockCredits(0);

  const otherCard = { ...mockCard, id: 'card-2', tenantId: TENANT_B } as OwnerRiskCardView;

  const service = createService({
    listCards: async (tenantId: string) => [mockCard, otherCard].filter(c => c.tenantId === tenantId),
  }, credit);

  const list = await service.listCards(TENANT_A);
  assert.equal(list.length, 1);
  const firstCard = list[0];
  assert.ok(firstCard);
  assert.equal(firstCard.tenantId, TENANT_A);
});

test('getCard throws OWNER_RISK_CARD_NOT_FOUND for other tenant', async () => {
  const credit = mockCredits(0);

  const service = createService({
    findCardById: async (tenantId: string) => {
      if (tenantId !== mockCard.tenantId) throw Object.assign(new Error('Owner risk card not found.'), { code: 'OWNER_RISK_CARD_NOT_FOUND' });
      return mockCard;
    },
  }, credit);

  await assert.rejects(
    () => service.getCard(TENANT_B, 'card-1'),
    (err: unknown) => {
      const e = err as Error & { code: string };
      assert.equal(e.code, 'OWNER_RISK_CARD_NOT_FOUND');
      return true;
    },
  );
});

test('listUnlockLogs returns only current tenant logs', async () => {
  const credit = mockCredits(0);

  const logs: OwnerRiskUnlockLogView[] = [
    { id: 'log-1', profileId: 'p1', tenantId: TENANT_A, userId: USER_ID, cardId: 'card-1', cardKey: 'k', creditsCharged: 50, status: 'success', traceId: 't1', createdAt: '2026-06-01T00:00:00.000Z' },
    { id: 'log-2', profileId: 'p2', tenantId: TENANT_B, userId: USER_ID, cardId: 'card-2', cardKey: 'k2', creditsCharged: 30, status: 'success', traceId: 't2', createdAt: '2026-06-02T00:00:00.000Z' },
  ];

  const service = createService({
    listUnlockLogs: async (tenantId: string) => logs.filter(l => l.tenantId === tenantId),
  }, credit);

  const result = await service.listUnlockLogs(TENANT_A);
  assert.equal(result.length, 1);
  const firstLog = result[0];
  assert.ok(firstLog);
  assert.equal(firstLog.tenantId, TENANT_A);
});

test('listReports returns only current tenant/profile reports', async () => {
  const credit = mockCredits(0);

  const reports: OwnerRiskReportView[] = [
    { id: 'r1', profileId: 'p1', tenantId: TENANT_A, userId: USER_ID, reportType: 'overview', title: 'R1', tierBadge: 3, confidence: AiConfidenceLevel.HIGH, riskLevel: 'medium', executiveSummary: 's', dataSnapshot: {}, sections: [], creditsCost: 10, disclaimer: 'd', createdAt: '2026-06-01T00:00:00.000Z', updatedAt: '2026-06-01T00:00:00.000Z' },
    { id: 'r2', profileId: 'p2', tenantId: TENANT_B, userId: USER_ID, reportType: 'overview', title: 'R2', tierBadge: 3, confidence: AiConfidenceLevel.HIGH, riskLevel: 'low', executiveSummary: 's2', dataSnapshot: {}, sections: [], creditsCost: 5, disclaimer: 'd', createdAt: '2026-06-02T00:00:00.000Z', updatedAt: '2026-06-02T00:00:00.000Z' },
  ];

  const service = createService({
    listReports: async (tenantId: string, profileId: string) => reports.filter(r => r.tenantId === tenantId && r.profileId === profileId),
  }, credit);

  const list = await service.listReports(TENANT_A, 'p1');
  assert.equal(list.length, 1);
  const first = list[0];
  assert.ok(first);
  assert.equal(first.tenantId, TENANT_A);
  assert.equal(first.profileId, 'p1');
});

test('getReport returns report for current tenant', async () => {
  const credit = mockCredits(0);
  const report: OwnerRiskReportView = { id: 'r1', profileId: 'p1', tenantId: TENANT_A, userId: USER_ID, reportType: 'overview', title: 'R1', tierBadge: 3, confidence: AiConfidenceLevel.HIGH, riskLevel: 'medium', executiveSummary: 's', dataSnapshot: {}, sections: [], creditsCost: 10, disclaimer: 'd', createdAt: '2026-06-01T00:00:00.000Z', updatedAt: '2026-06-01T00:00:00.000Z' };

  const service = createService({
    findReportById: async (tenantId: string, reportId: string) => {
      if (tenantId !== report.tenantId) throw Object.assign(new Error('Owner risk report not found.'), { code: 'OWNER_RISK_REPORT_NOT_FOUND' });
      return report;
    },
  }, credit);

  const res = await service.getReport(TENANT_A, 'r1');
  assert.equal(res.id, 'r1');
  assert.equal(res.tenantId, TENANT_A);
});

test('getReport throws OWNER_RISK_REPORT_NOT_FOUND for other tenant', async () => {
  const credit = mockCredits(0);

  const service = createService({
    findReportById: async (tenantId: string) => {
      throw Object.assign(new Error('Owner risk report not found.'), { code: 'OWNER_RISK_REPORT_NOT_FOUND' });
    },
  }, credit);

  await assert.rejects(
    () => service.getReport(TENANT_B, 'r1'),
    (err: unknown) => {
      const e = err as Error & { code: string };
      assert.equal(e.code, 'OWNER_RISK_REPORT_NOT_FOUND');
      return true;
    },
  );
});

test('createReport persists report through repository and returns reportId', async () => {
  const credit = mockCredits(0);
  let createdReportData: CreateReportInput | null = null;

  const service = createService({
    createReport: async (data: CreateReportInput) => {
      createdReportData = data;
      return { id: 'generated-id-123' } as unknown as OwnerRiskReportView;
    },
  }, credit);

  const res = await service.createReport(TENANT_A, USER_ID, 'profile-1', 'overview');
  assert.equal(res.reportId, 'generated-id-123');
  const reportData1 = createdReportData as CreateReportInput | null;
  if (!reportData1) {
    throw new Error('createdReportData is null');
  }
  assert.equal(reportData1.tenantId, TENANT_A);
  assert.equal(reportData1.userId, USER_ID);
  assert.equal(reportData1.profileId, 'profile-1');
  assert.equal(reportData1.reportType, 'overview');
});

test('createReport includes required AI metadata: tierBadge, confidence, disclaimer, creditsCost', async () => {
  const credit = mockCredits(0);
  let createdReportData: CreateReportInput | null = null;

  const service = createService({
    createReport: async (data: CreateReportInput) => {
      createdReportData = data;
      return { id: 'generated-id-123' } as unknown as OwnerRiskReportView;
    },
  }, credit);

  await service.createReport(TENANT_A, USER_ID, 'profile-1', 'overview');
  const reportData2 = createdReportData as CreateReportInput | null;
  if (!reportData2) {
    throw new Error('createdReportData is null');
  }
  assert.equal(reportData2.tierBadge, 1); // TIER_1 = 1
  assert.equal(reportData2.confidence, 'high'); // HIGH = 'high'
  assert.equal(reportData2.disclaimer, 'This is an AI-generated report');
  assert.equal(reportData2.creditsCost, 150);
});

test('listReports after createReport can read created report if using mock repo state', async () => {
  const credit = mockCredits(0);
  const repoReports: OwnerRiskReportView[] = [];

  const service = createService({
    createReport: async (data: CreateReportInput) => {
      const newReport: OwnerRiskReportView = {
        id: 'report-id-999',
        profileId: data.profileId,
        tenantId: data.tenantId,
        userId: data.userId,
        reportType: data.reportType as OwnerRiskReportType,
        title: data.title,
        tierBadge: data.tierBadge,
        confidence: data.confidence as AiConfidenceLevel,
        riskLevel: data.riskLevel as OwnerRiskLevel,
        executiveSummary: data.executiveSummary,
        dataSnapshot: data.dataSnapshot,
        sections: data.sections,
        creditsCost: data.creditsCost,
        disclaimer: data.disclaimer,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      repoReports.push(newReport);
      return newReport;
    },
    listReports: async (tenantId: string, profileId: string) => {
      return repoReports.filter(r => r.tenantId === tenantId && r.profileId === profileId);
    },
  }, credit);

  await service.createReport(TENANT_A, USER_ID, 'profile-1', 'overview');
  const reports = await service.listReports(TENANT_A, 'profile-1');
  assert.equal(reports.length, 1);
  const first = reports[0];
  assert.ok(first);
  assert.equal(first.id, 'report-id-999');
  assert.equal(first.tenantId, TENANT_A);
  assert.equal(first.profileId, 'profile-1');
});

test('createProfile persists through repository', async () => {
  const credit = mockCredits(0);
  let createdProfileDto: CreateOwnerRiskProfileDto | null = null;

  const service = createService({
    createProfile: async (tenantId: string, userId: string, dto: CreateOwnerRiskProfileDto) => {
      createdProfileDto = dto;
      return {
        id: 'p-1',
        tenantId,
        userId,
        ownerName: dto.ownerName,
        idCardMasked: dto.idCardMasked,
        creditCode: dto.creditCode,
        overallRiskLevel: 'medium',
        guaranteeRiskLevel: 'medium',
        mixingRiskLevel: 'medium',
        counterpartyRiskLevel: 'medium',
        receivableRiskLevel: 'medium',
        riskScore: 50,
        createdAt: '2026-06-01T00:00:00.000Z',
        updatedAt: '2026-06-01T00:00:00.000Z',
      };
    },
  }, credit);

  const dto: CreateOwnerRiskProfileDto = { ownerName: 'Alice', creditCode: '91310000X' };
  const res = await service.createProfile(TENANT_A, USER_ID, dto);
  assert.equal(res.id, 'p-1');
  assert.equal(res.ownerName, 'Alice');
  const profileDto = createdProfileDto as CreateOwnerRiskProfileDto | null;
  if (!profileDto) {
    throw new Error('createdProfileDto is null');
  }
  assert.equal(profileDto.ownerName, 'Alice');
  assert.equal(profileDto.creditCode, '91310000X');
});

test('listProfiles filters by tenant and user with pagination', async () => {
  const credit = mockCredits(0);
  const profiles: OwnerRiskProfileView[] = [
    { id: 'p1', tenantId: TENANT_A, userId: USER_ID, ownerName: 'A1', overallRiskLevel: 'medium', guaranteeRiskLevel: 'medium', mixingRiskLevel: 'medium', counterpartyRiskLevel: 'medium', receivableRiskLevel: 'medium', riskScore: 50, createdAt: '2026-06-01T00:00:00.000Z', updatedAt: '2026-06-01T00:00:00.000Z' },
    { id: 'p2', tenantId: TENANT_A, userId: 'user-2', ownerName: 'A2', overallRiskLevel: 'medium', guaranteeRiskLevel: 'medium', mixingRiskLevel: 'medium', counterpartyRiskLevel: 'medium', receivableRiskLevel: 'medium', riskScore: 50, createdAt: '2026-06-02T00:00:00.000Z', updatedAt: '2026-06-02T00:00:00.000Z' },
    { id: 'p3', tenantId: TENANT_B, userId: USER_ID, ownerName: 'B1', overallRiskLevel: 'medium', guaranteeRiskLevel: 'medium', mixingRiskLevel: 'medium', counterpartyRiskLevel: 'medium', receivableRiskLevel: 'medium', riskScore: 50, createdAt: '2026-06-03T00:00:00.000Z', updatedAt: '2026-06-03T00:00:00.000Z' },
  ];

  const service = createService({
    listProfiles: async (tenantId: string, userId: string, page: number, pageSize: number) => {
      const filtered = profiles.filter(p => p.tenantId === tenantId && p.userId === userId);
      const skip = (page - 1) * pageSize;
      const list = filtered.slice(skip, skip + pageSize);
      return { list, total: filtered.length };
    },
  }, credit);

  const res = await service.listProfiles(TENANT_A, USER_ID, 1, 10);
  assert.equal(res.total, 1);
  assert.equal(res.list.length, 1);
  const firstProfile = res.list[0];
  assert.ok(firstProfile);
  assert.equal(firstProfile.id, 'p1');
});

test('getProfile returns current tenant profile', async () => {
  const credit = mockCredits(0);
  const profile: OwnerRiskProfileView = { id: 'p1', tenantId: TENANT_A, userId: USER_ID, ownerName: 'A1', overallRiskLevel: 'medium', guaranteeRiskLevel: 'medium', mixingRiskLevel: 'medium', counterpartyRiskLevel: 'medium', receivableRiskLevel: 'medium', riskScore: 50, createdAt: '2026-06-01T00:00:00.000Z', updatedAt: '2026-06-01T00:00:00.000Z' };

  const service = createService({
    findProfileById: async (tenantId: string, profileId: string) => {
      if (tenantId !== profile.tenantId || profileId !== profile.id) {
        throw Object.assign(new Error('Profile not found.'), { code: 'OWNER_RISK_PROFILE_NOT_FOUND' });
      }
      return profile;
    },
  }, credit);

  const res = await service.getProfile(TENANT_A, 'p1');
  assert.equal(res.id, 'p1');
  assert.equal(res.tenantId, TENANT_A);
});

test('getProfile throws OWNER_RISK_PROFILE_NOT_FOUND for other tenant', async () => {
  const credit = mockCredits(0);

  const service = createService({
    findProfileById: async () => {
      throw Object.assign(new Error('Profile not found.'), { code: 'OWNER_RISK_PROFILE_NOT_FOUND' });
    },
  }, credit);

  await assert.rejects(
    () => service.getProfile(TENANT_B, 'p1'),
    (err: unknown) => {
      const e = err as Error & { code: string };
      assert.equal(e.code, 'OWNER_RISK_PROFILE_NOT_FOUND');
      return true;
    },
  );
});

test('updateProfile updates current tenant profile', async () => {
  const credit = mockCredits(0);
  let updatedDto: UpdateOwnerRiskProfileDto | null = null;
  const profile: OwnerRiskProfileView = { id: 'p1', tenantId: TENANT_A, userId: USER_ID, ownerName: 'A1', overallRiskLevel: 'medium', guaranteeRiskLevel: 'medium', mixingRiskLevel: 'medium', counterpartyRiskLevel: 'medium', receivableRiskLevel: 'medium', riskScore: 50, createdAt: '2026-06-01T00:00:00.000Z', updatedAt: '2026-06-01T00:00:00.000Z' };

  const service = createService({
    updateProfile: async (tenantId: string, profileId: string, dto: UpdateOwnerRiskProfileDto) => {
      updatedDto = dto;
      return { ...profile, ownerName: dto.ownerName ?? profile.ownerName };
    },
  }, credit);

  const res = await service.updateProfile(TENANT_A, 'p1', { ownerName: 'Alice Updated' });
  assert.equal(res.ownerName, 'Alice Updated');
  const profileUpdateDto = updatedDto as UpdateOwnerRiskProfileDto | null;
  if (!profileUpdateDto) {
    throw new Error('updatedDto is null');
  }
  assert.equal(profileUpdateDto.ownerName, 'Alice Updated');
});

test('updateProfile throws OWNER_RISK_PROFILE_NOT_FOUND for other tenant', async () => {
  const credit = mockCredits(0);

  const service = createService({
    updateProfile: async () => {
      throw Object.assign(new Error('Profile not found.'), { code: 'OWNER_RISK_PROFILE_NOT_FOUND' });
    },
  }, credit);

  await assert.rejects(
    () => service.updateProfile(TENANT_B, 'p1', { ownerName: 'Bob' }),
    (err: unknown) => {
      const e = err as Error & { code: string };
      assert.equal(e.code, 'OWNER_RISK_PROFILE_NOT_FOUND');
      return true;
    },
  );
});

test('createReviewRequest persists through repository', async () => {
  const credit = mockCredits(0);
  let createdReviewType: ReviewType | null = null;

  const service = createService({
    createReviewRequest: async (tenantId: string, userId: string, profileId: string, reviewType: ReviewType) => {
      createdReviewType = reviewType;
      return {
        id: 'review-1',
        profileId,
        tenantId,
        userId,
        reviewType,
        status: 'pending',
        creditsCost: 200,
        createdAt: '2026-06-01T00:00:00.000Z',
        updatedAt: '2026-06-01T00:00:00.000Z',
      };
    },
  }, credit);

  const res = await service.createReviewRequest(TENANT_A, USER_ID, 'profile-1', 'human_review');
  assert.equal(res.id, 'review-1');
  assert.equal(res.profileId, 'profile-1');
  assert.equal(createdReviewType, 'human_review');
});

test('listReviewRequests returns only current tenant requests', async () => {
  const credit = mockCredits(0);
  const requests: OwnerRiskReviewRequestView[] = [
    { id: 'r1', tenantId: TENANT_A, userId: USER_ID, profileId: 'p1', reviewType: 'human_review', status: 'pending', creditsCost: 200, createdAt: '2026-06-01T00:00:00.000Z', updatedAt: '2026-06-01T00:00:00.000Z' },
    { id: 'r2', tenantId: TENANT_B, userId: USER_ID, profileId: 'p2', reviewType: 'human_review', status: 'pending', creditsCost: 200, createdAt: '2026-06-02T00:00:00.000Z', updatedAt: '2026-06-02T00:00:00.000Z' },
  ];

  const service = createService({
    listReviewRequests: async (tenantId: string) => {
      return requests.filter(r => r.tenantId === tenantId);
    },
  }, credit);

  const res = await service.listReviewRequests(TENANT_A);
  assert.equal(res.length, 1);
  const first = res[0];
  assert.ok(first);
  assert.equal(first.id, 'r1');
  assert.equal(first.tenantId, TENANT_A);
});

test('createReviewRequest includes status pending, creditsCost, timestamps', async () => {
  const credit = mockCredits(0);
  let createdReq: OwnerRiskReviewRequestView | null = null;

  const service = createService({
    createReviewRequest: async (tenantId: string, userId: string, profileId: string, reviewType: ReviewType) => {
      createdReq = {
        id: 'review-123',
        profileId,
        tenantId,
        userId,
        reviewType,
        status: 'pending',
        creditsCost: 200,
        createdAt: '2026-06-01T00:00:00.000Z',
        updatedAt: '2026-06-01T00:00:00.000Z',
      };
      return createdReq;
    },
  }, credit);

  const res = await service.createReviewRequest(TENANT_A, USER_ID, 'profile-1', 'human_review');
  assert.equal(res.id, 'review-123');
  const req = createdReq as OwnerRiskReviewRequestView | null;
  if (!req) {
    throw new Error('createdReq is null');
  }
  assert.equal(req.status, 'pending');
  assert.equal(req.creditsCost, 200);
  assert.equal(req.createdAt, '2026-06-01T00:00:00.000Z');
  assert.equal(req.updatedAt, '2026-06-01T00:00:00.000Z');
});

test('generateAnalysis persists generation log through repository', async () => {
  const credit = mockCredits(1000);
  let createdType: OwnerRiskGenerationType | null = null;

  const service = createService({
    createGenerationLog: async (tenantId: string, userId: string, profileId: string, generationType: OwnerRiskGenerationType) => {
      createdType = generationType;
      return {
        id: 'gen-1',
        profileId,
        tenantId,
        userId,
        generationType,
        inputSnapshot: {},
        outputSnapshot: {},
        creditsCost: 100,
        status: 'success',
        traceId: 'trace-1',
        createdAt: '2026-06-01T00:00:00.000Z',
      };
    },
  }, credit);

  const res = await service.generateAnalysis(TENANT_A, USER_ID, 'profile-1', 'overview');
  assert.equal(res.id, 'gen-1');
  assert.equal(res.profileId, 'profile-1');
  assert.equal(createdType, 'overview');
});

test('listGenerationLogs returns only current tenant logs', async () => {
  const credit = mockCredits(0);
  const logs: OwnerRiskGenerationLogView[] = [
    { id: 'g1', tenantId: TENANT_A, userId: USER_ID, profileId: 'p1', generationType: 'overview', inputSnapshot: {}, outputSnapshot: {}, creditsCost: 100, status: 'success', traceId: 't1', createdAt: '2026-06-01T00:00:00.000Z' },
    { id: 'g2', tenantId: TENANT_B, userId: USER_ID, profileId: 'p2', generationType: 'overview', inputSnapshot: {}, outputSnapshot: {}, creditsCost: 100, status: 'success', traceId: 't2', createdAt: '2026-06-02T00:00:00.000Z' },
  ];

  const service = createService({
    listGenerationLogs: async (tenantId: string) => {
      return logs.filter(l => l.tenantId === tenantId);
    },
  }, credit);

  const res = await service.listGenerationLogs(TENANT_A);
  assert.equal(res.length, 1);
  const first = res[0];
  assert.ok(first);
  assert.equal(first.id, 'g1');
  assert.equal(first.tenantId, TENANT_A);
});

test('generateAnalysis includes generationType, status success, creditsCost, traceId, timestamps', async () => {
  const credit = mockCredits(1000);
  let createdLog: OwnerRiskGenerationLogView | null = null;

  const service = createService({
    createGenerationLog: async (tenantId: string, userId: string, profileId: string, generationType: OwnerRiskGenerationType, inputSnapshot, outputSnapshot, creditsCost) => {
      createdLog = {
        id: 'gen-123',
        profileId,
        tenantId,
        userId,
        generationType,
        inputSnapshot: inputSnapshot ?? {},
        outputSnapshot,
        creditsCost: creditsCost ?? 0,
        status: 'success',
        traceId: 'trace-123456',
        createdAt: '2026-06-01T00:00:00.000Z',
      };
      return createdLog;
    },
  }, credit);

  const res = await service.generateAnalysis(TENANT_A, USER_ID, 'profile-1', 'overview');
  assert.equal(res.id, 'gen-123');
  const log = createdLog as OwnerRiskGenerationLogView | null;
  if (!log) {
    throw new Error('createdLog is null');
  }
  assert.equal(log.generationType, 'overview');
  assert.equal(log.status, 'success');
  assert.equal(log.creditsCost, 100);
  assert.equal(log.traceId, 'trace-123456');
  assert.equal(log.createdAt, '2026-06-01T00:00:00.000Z');
});

test('generateAnalysis transaction flow: happy path', async () => {
  let preCharged = false;
  let aiInvoked = false;
  let logSaved = false;
  let committed = false;

  const credit = {
    balance: () => 1000,
    preCharge: (input: { amount: number }) => {
      preCharged = true;
      assert.equal(input.amount, 100);
      return { balanceAfter: 900 };
    },
    commit: (input: { amount: number }) => {
      committed = true;
      assert.equal(input.amount, 100);
    },
    refund: () => {},
  };

  const aiGateway = {
    invoke: async (request: unknown) => {
      aiInvoked = true;
      const r = request as { taskType: string };
      assert.equal(r.taskType, 'owner_risk.summary'); // overview
      return {
        data: { risk: 'high' },
        cost: { credits: 100, rmb: 1 },
        modelUsed: 'qwen',
        providerUsed: 'ali',
        disclaimer: 'Disclaimer',
        tier: 1,
        confidence: 'high',
      };
    },
  };

  const service = createService({
    createGenerationLog: async (tenantId, userId, profileId, generationType, inputSnapshot, outputSnapshot, creditsCost) => {
      logSaved = true;
      assert.equal(creditsCost, 100);
      assert.deepEqual(outputSnapshot, { risk: 'high' });
      return {
        id: 'gen-ok',
        profileId,
        tenantId,
        userId,
        generationType,
        inputSnapshot: inputSnapshot ?? {},
        outputSnapshot: outputSnapshot ?? {},
        creditsCost: creditsCost ?? 0,
        status: 'success',
        traceId: 'trace-ok',
        createdAt: '2026-06-01T00:00:00.000Z',
      };
    },
  }, credit as never, aiGateway);

  const res = await service.generateAnalysis(TENANT_A, USER_ID, 'profile-1', 'overview');
  assert.equal(res.id, 'gen-ok');
  assert.ok(preCharged);
  assert.ok(aiInvoked);
  assert.ok(logSaved);
  assert.ok(committed);
});

test('generateAnalysis transaction flow: AI Gateway failure triggers refund', async () => {
  let preCharged = false;
  let refunded = false;
  let committed = false;
  let logSaved = false;

  const credit = {
    balance: () => 1000,
    preCharge: (input: { amount: number }) => {
      preCharged = true;
      return { balanceAfter: 900 };
    },
    commit: () => {
      committed = true;
    },
    refund: (input: { amount: number }) => {
      refunded = true;
      assert.equal(input.amount, 100);
    },
  };

  const aiGateway = {
    invoke: async () => {
      throw new Error('AI Gateway error');
    },
  };

  const service = createService({
    createGenerationLog: async () => {
      logSaved = true;
      return {} as never;
    },
  }, credit as never, aiGateway);

  await assert.rejects(
    () => service.generateAnalysis(TENANT_A, USER_ID, 'profile-1', 'overview'),
    /AI Gateway error/,
  );

  assert.ok(preCharged);
  assert.ok(refunded);
  assert.ok(!committed);
  assert.ok(!logSaved);
});

test('generateAnalysis transaction flow: tenant isolation and profile missing', async () => {
  let preCharged = false;
  let aiInvoked = false;

  const credit = {
    balance: () => 1000,
    preCharge: () => {
      preCharged = true;
      return { balanceAfter: 900 };
    },
    commit: () => {},
    refund: () => {},
  };

  const aiGateway = {
    invoke: async () => {
      aiInvoked = true;
      return {} as never;
    },
  };

  const service = createService({
    findProfileById: async () => {
      throw Object.assign(new Error('Profile not found.'), { code: 'OWNER_RISK_PROFILE_NOT_FOUND' });
    },
  }, credit as never, aiGateway);

  await assert.rejects(
    () => service.generateAnalysis(TENANT_B, USER_ID, 'profile-1', 'overview'),
    (err: unknown) => {
      const e = err as { code: string };
      assert.equal(e.code, 'OWNER_RISK_PROFILE_NOT_FOUND');
      return true;
    },
  );

  assert.ok(!preCharged);
  assert.ok(!aiInvoked);
});

test('generateAnalysis mappings: analysisType to AiTaskType', async () => {
  const taskTypesInvoked: string[] = [];

  const credit = mockCredits(1000);
  const aiGateway = {
    invoke: async (request: unknown) => {
      const r = request as { taskType: string };
      taskTypesInvoked.push(r.taskType);
      return { data: {} };
    },
  };

  const service = createService({}, credit as never, aiGateway);

  await service.generateAnalysis(TENANT_A, USER_ID, 'profile-1', 'guarantee_analysis');
  await service.generateAnalysis(TENANT_A, USER_ID, 'profile-1', 'report');

  assert.equal(taskTypesInvoked.length, 2);
  assert.equal(taskTypesInvoked[0], 'owner_risk.guarantee_risk_analysis');
  assert.equal(taskTypesInvoked[1], 'owner_risk.report_generation');
});

function mockContextService(tenantId: string, userId: string) {
  return {
    get: () => ({
      tenantId,
      userId,
      roles: [],
      positionTags: [],
      traceId: 'mock-trace-id',
      scopeType: 'tenant',
    }),
  } as unknown as TenantContextService;
}

test('OwnerRiskController: createProfile invalid body is rejected by validation', async () => {
  const credit = mockCredits(100);
  const service = createService({}, credit);
  const context = mockContextService(TENANT_A, USER_ID);
  const controller = new OwnerRiskController(service, context);

  const invalidBody = {
    idCardMasked: '12345***',
  };

  await assert.rejects(
    () => controller.createProfile(invalidBody),
    (err: unknown) => {
      const e = err as { issues: Array<{ path: string[] }> };
      assert.ok(e.issues);
      assert.equal(e.issues[0]?.path[0], 'ownerName');
      return true;
    },
  );
});

test('OwnerRiskController: generateAnalysis uses correct tenant/user context from TenantContextService', async () => {
  let invokedTenantId = '';
  let invokedUserId = '';

  const credit = mockCredits(1000);
  const service = createService({
    findProfileById: async (tenantId, id) => {
      return { id } as never;
    },
  }, credit);

  service.generateAnalysis = async (tenantId, userId, profileId, analysisType) => {
    invokedTenantId = tenantId;
    invokedUserId = userId;
    return { id: 'mock-gen-log' } as never;
  };

  const context = mockContextService(TENANT_A, USER_ID);
  const controller = new OwnerRiskController(service, context);

  await controller.generateAnalysis('profile-1', { analysisType: 'overview' });

  assert.equal(invokedTenantId, TENANT_A);
  assert.equal(invokedUserId, USER_ID);
});

test('OwnerRiskController: unlockCard has RequirePermission decorator with owner-risk:unlock', () => {
  const permission = Reflect.getMetadata('requiredPermission', OwnerRiskController.prototype.unlockCard);
  assert.equal(permission, 'owner-risk:unlock');
});

test('OwnerRiskController: listProfiles does not accept naked headers but uses TenantContextService', async () => {
  let invokedTenantId = '';
  let invokedUserId = '';

  const credit = mockCredits(100);
  const service = createService({}, credit);

  service.listProfiles = async (tenantId, userId) => {
    invokedTenantId = tenantId;
    invokedUserId = userId;
    return { list: [], total: 0 };
  };

  const context = mockContextService(TENANT_B, 'custom-user');
  const controller = new OwnerRiskController(service, context);

  await controller.listProfiles('1', '20');

  assert.equal(invokedTenantId, TENANT_B);
  assert.equal(invokedUserId, 'custom-user');
});


test('listGuaranteeRecords reads through repository with tenant + profile scope (no in-memory Map)', async () => {
  let scope: { profileId: string; tenantId: string } | undefined;
  const sample: OwnerGuaranteeRecordView = {
    id: 'g1', profileId: 'p1', tenantId: TENANT_A, guaranteedCompany: 'ACME', guaranteeAmount: 1000,
    guaranteeType: 'mortgage' as OwnerGuaranteeRecordView['guaranteeType'], status: 'active' as OwnerGuaranteeRecordView['status'],
    riskLevel: 'medium' as OwnerGuaranteeRecordView['riskLevel'], createdAt: '2026-06-01T00:00:00.000Z', updatedAt: '2026-06-01T00:00:00.000Z',
  };
  const svc = createService({ listGuaranteeRecords: async (tenantId, profileId) => { scope = { profileId, tenantId }; return [sample]; } }, mockCredits(500));
  const rows = await svc.listGuaranteeRecords(TENANT_A, 'p1');
  assert.deepEqual(scope, { profileId: 'p1', tenantId: TENANT_A });
  assert.equal(rows.length, 1);
  assert.equal(rows[0]?.id, 'g1');
});

test('listCounterpartyWatchlist + risk events + mixing + receivable all delegate to repository', async () => {
  const calls: string[] = [];
  const svc = createService({
    listMixingRecords: async () => { calls.push('mixing'); return []; },
    listCounterpartyWatchlist: async () => { calls.push('watchlist'); return []; },
    listCounterpartyRiskEvents: async () => { calls.push('events'); return []; },
    listReceivableRecords: async () => { calls.push('receivable'); return []; },
  }, mockCredits(500));
  await svc.listMixingRecords(TENANT_A, 'p1');
  await svc.listCounterpartyWatchlist(TENANT_A);
  await svc.listCounterpartyRiskEvents(TENANT_A, 'cp1');
  await svc.listReceivableRecords(TENANT_A, 'p1');
  assert.deepEqual(calls, ['mixing', 'watchlist', 'events', 'receivable']);
});
