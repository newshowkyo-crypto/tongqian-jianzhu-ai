import assert from 'node:assert/strict';
import test from 'node:test';
import 'reflect-metadata';

import { BusinessError } from '@tongqian/errors';
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
} from '@tongqian/types';

import type { TenantContextService } from '../../common/context/tenant-context.service.js';

import { MarketSituationController } from './market-situation.controller.js';
import { MarketSituationService } from './market-situation.service.js';

const TENANT_A = 'tenant-a';
const TENANT_B = 'tenant-b';
const USER_ID = 'user-1';

const mockSignal: MarketSignalView = {
  id: 'signal-1',
  tenantId: TENANT_A,
  userId: USER_ID,
  signalType: 'project_hot',
  title: 'Mock Project Hot Signal',
  summary: 'Something important in the project world',
  region: 'Zhejiang',
  riskLevel: 'low',
  opportunityLevel: 'high',
  confidence: AiConfidenceLevel.HIGH,
  sourceUrl: 'https://example.com/source',
  isPublished: true,
  isFeatured: true,
  tierBadge: AiOutputTier.TIER_1,
  unlockCredits: 50,
  viewCount: 0,
  feedbackCount: 0,
  tags: ['project', 'hot'],
  publishedAt: '2026-06-01T00:00:00.000Z',
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
};

function mockCredits(initialBalance = 100) {
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
    commit: (_input: { amount: number }): void => {},
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
  listSignals: (tenantId: string, page: number, pageSize: number, filters: { region?: string; signalType?: string; riskLevel?: string }) => Promise<{ list: MarketSignalView[]; total: number }>;
  listFeaturedSignals: (tenantId: string) => Promise<MarketSignalView[]>;
  findSignalById: (tenantId: string, signalId: string) => Promise<MarketSignalView>;
  createSignal: (tenantId: string, userId: string, dto: CreateMarketSignalDto) => Promise<MarketSignalView>;
  updateSignalViewCount: (tenantId: string, signalId: string) => Promise<void>;
  createUnlockLog: (tenantId: string, userId: string, signalId: string, unlockType: UnlockType, creditsCharged: number, traceId: string, status: 'success' | 'failed' | 'refunded') => Promise<MarketSignalUnlockLogView>;
  listUnlockLogs: (tenantId: string) => Promise<MarketSignalUnlockLogView[]>;
  createSimulation: (tenantId: string, userId: string, signalId: string, simulationType: SimulationType, inputParams: Record<string, unknown>) => Promise<MarketSignalSimulationView>;
  listSimulations: (tenantId: string, signalId: string) => Promise<MarketSignalSimulationView[]>;
  findSimulationById: (tenantId: string, id: string) => Promise<MarketSignalSimulationView>;
  createReport: (tenantId: string, userId: string, signalId: string, reportType: MarketSignalReportType) => Promise<MarketSignalReportView>;
  listReports: (tenantId: string, signalId: string) => Promise<MarketSignalReportView[]>;
  findReportById: (tenantId: string, id: string) => Promise<MarketSignalReportView>;
  createFeedback: (tenantId: string, userId: string, signalId: string, feedbackType: FeedbackType, rating: number, comment?: string) => Promise<MarketSignalFeedbackView>;
  listFeedbacks: (tenantId: string, signalId: string) => Promise<MarketSignalFeedbackView[]>;
  listSources: () => Promise<MarketSignalSourceView[]>;
  listTags: () => Promise<MarketSignalTagView[]>;
  createGenerationLog: (tenantId: string, userId: string, signalId: string, generationType: string, creditsCost: number, traceId: string, status?: string) => Promise<MarketSignalGenerationLogView>;
  listGenerationLogs: (tenantId: string) => Promise<MarketSignalGenerationLogView[]>;
};

function createService(
  repoStubs: Partial<MockRepo>,
  credit: MockCreditService,
  aiGatewayStubs?: unknown,
): MarketSituationService {
  const repo: MockRepo = {
    listSignals: repoStubs.listSignals ?? (async () => ({ list: [], total: 0 })),
    listFeaturedSignals: repoStubs.listFeaturedSignals ?? (async () => []),
    findSignalById: repoStubs.findSignalById ?? (async () => mockSignal),
    createSignal: repoStubs.createSignal ?? (async () => mockSignal),
    updateSignalViewCount: repoStubs.updateSignalViewCount ?? (async () => undefined),
    createUnlockLog: repoStubs.createUnlockLog ?? (async () => ({} as never)),
    listUnlockLogs: repoStubs.listUnlockLogs ?? (async () => []),
    createSimulation: repoStubs.createSimulation ?? (async () => ({} as never)),
    listSimulations: repoStubs.listSimulations ?? (async () => []),
    findSimulationById: repoStubs.findSimulationById ?? (async () => ({} as never)),
    createReport: repoStubs.createReport ?? (async () => ({} as never)),
    listReports: repoStubs.listReports ?? (async () => []),
    findReportById: repoStubs.findReportById ?? (async () => {
      throw Object.assign(new Error('Market signal report not found.'), { code: 'MARKET_SIGNAL_REPORT_NOT_FOUND' });
    }),
    createFeedback: repoStubs.createFeedback ?? (async () => ({} as never)),
    listFeedbacks: repoStubs.listFeedbacks ?? (async () => []),
    listSources: repoStubs.listSources ?? (async () => []),
    listTags: repoStubs.listTags ?? (async () => []),
    createGenerationLog: repoStubs.createGenerationLog ?? (async () => ({} as never)),
    listGenerationLogs: repoStubs.listGenerationLogs ?? (async () => []),
  };

  const aiGateway = aiGatewayStubs ?? {
    invoke: async () => ({ data: {}, cost: 0, provider: 'mock', traceId: 'mock-trace-id' }),
  };

  return new MarketSituationService(repo as never, credit as never, aiGateway as never);
}

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

// Service Tests

test('createSignal persists through repository', async () => {
  let createdDto: CreateMarketSignalDto | null = null;
  const repoStubs: Partial<MockRepo> = {
    createSignal: async (tenantId, userId, dto) => {
      createdDto = dto;
      return { id: 'signal-created', ...dto } as never;
    },
  };

  const service = createService(repoStubs, mockCredits());
  const dto: CreateMarketSignalDto = {
    signalType: 'project_hot',
    title: 'Zhejiang Tender',
    summary: 'A new high-speed railway tender',
    region: 'Zhejiang',
    sourceUrl: 'https://example.com/source',
  };

  const result = await service.createSignal(TENANT_A, USER_ID, dto);
  assert.equal(result.id, 'signal-created');
  const finalDto = createdDto as CreateMarketSignalDto | null;
  assert.equal(finalDto?.title, 'Zhejiang Tender');
});

test('createSignal rejects unverified source', async () => {
  const service = createService({}, mockCredits());
  const dto: CreateMarketSignalDto = {
    signalType: 'project_hot',
    title: 'Zhejiang Tender',
    summary: 'A new high-speed railway tender',
    region: 'Zhejiang',
    // No sourceUrl, no rawData, no sourceId -> unverified source!
  };

  await assert.rejects(
    () => service.createSignal(TENANT_A, USER_ID, dto),
    (err: unknown) => {
      const e = err as { code: string };
      assert.equal(e.code, 'MARKET_SIGNAL.SOURCE.UNVERIFIED');
      return true;
    },
  );
});

test('listSignals filters by tenant', async () => {
  let listTenantId = '';
  const repoStubs: Partial<MockRepo> = {
    listSignals: async (tenantId) => {
      listTenantId = tenantId;
      return { list: [], total: 0 };
    },
  };

  const service = createService(repoStubs, mockCredits());
  await service.listSignals(TENANT_B, USER_ID, 1, 20, {});
  assert.equal(listTenantId, TENANT_B);
});

test('getSignal throws MARKET_SIGNAL_NOT_FOUND for other tenant', async () => {
  const repoStubs: Partial<MockRepo> = {
    findSignalById: async (tenantId, id) => {
      throw Object.assign(new Error('Market signal not found'), { code: 'MARKET_SIGNAL_NOT_FOUND' });
    },
  };

  const service = createService(repoStubs, mockCredits());
  await assert.rejects(
    () => service.getSignal(TENANT_A, 'signal-other'),
    (err: unknown) => {
      const e = err as { code: string };
      assert.equal(e.code, 'MARKET_SIGNAL_NOT_FOUND');
      return true;
    },
  );
});

test('unlockSignal happy path: preCharge -> createUnlockLog -> commit', async () => {
  let preCharged = false;
  let logged = false;
  let committed = false;

  const credit = {
    balance: () => 100,
    preCharge: () => { preCharged = true; return { balanceAfter: 50 }; },
    commit: () => { committed = true; },
    refund: () => {},
    topup: () => {},
  };

  const repoStubs: Partial<MockRepo> = {
    findSignalById: async () => mockSignal,
    createUnlockLog: async () => {
      logged = true;
      return {} as never;
    },
  };

  const service = createService(repoStubs, credit);
  await service.unlockSignal(TENANT_A, USER_ID, 'signal-1', 'full');

  assert.ok(preCharged);
  assert.ok(logged);
  assert.ok(committed);
});

test('unlockSignal insufficient credits: no success log, no commit', async () => {
  let preCharged = false;
  let logged = false;
  let committed = false;

  const credit = {
    balance: () => 10,
    preCharge: () => {
      preCharged = true;
      throw new BusinessError({ code: 'CREDIT.DEDUCT.INSUFFICIENT', details: { balance: 10, requested: 50 }, message: 'Insufficient credits.' });
    },
    commit: () => { committed = true; },
    refund: () => {},
    topup: () => {},
  };

  const repoStubs: Partial<MockRepo> = {
    findSignalById: async () => mockSignal,
    createUnlockLog: async () => {
      logged = true;
      return {} as never;
    },
  };

  const service = createService(repoStubs, credit);

  await assert.rejects(
    () => service.unlockSignal(TENANT_A, USER_ID, 'signal-1', 'full'),
    (err: unknown) => {
      const e = err as { code: string };
      assert.equal(e.code, 'MARKET_SIGNAL.CREDIT.INSUFFICIENT');
      return true;
    },
  );

  assert.ok(preCharged);
  assert.ok(!logged);
  assert.ok(!committed);
});

test('createSimulation persists and tenant scoped', async () => {
  let createdTenantId = '';
  let createdSignalId = '';

  const repoStubs: Partial<MockRepo> = {
    findSignalById: async () => mockSignal,
    createSimulation: async (tenantId, userId, signalId, simulationType, inputParams) => {
      createdTenantId = tenantId;
      createdSignalId = signalId;
      return { id: 'sim-1', tenantId, signalId, simulationType, inputParams } as never;
    },
  };

  const service = createService(repoStubs, mockCredits());
  await service.createSimulation(TENANT_A, USER_ID, 'signal-1', 'project_participation', { key: 'val' });

  assert.equal(createdTenantId, TENANT_A);
  assert.equal(createdSignalId, 'signal-1');
});

test('createReport persists and tenant scoped', async () => {
  let createdTenantId = '';
  let createdSignalId = '';

  const repoStubs: Partial<MockRepo> = {
    findSignalById: async () => mockSignal,
    createReport: async (tenantId, userId, signalId, reportType) => {
      createdTenantId = tenantId;
      createdSignalId = signalId;
      return { id: 'rep-1', tenantId, signalId, reportType } as never;
    },
  };

  const service = createService(repoStubs, mockCredits());
  await service.createReport(TENANT_B, USER_ID, 'signal-1', 'situation_summary');

  assert.equal(createdTenantId, TENANT_B);
  assert.equal(createdSignalId, 'signal-1');
});

test('createFeedback persists and tenant scoped', async () => {
  let createdTenantId = '';
  let createdSignalId = '';

  const repoStubs: Partial<MockRepo> = {
    createFeedback: async (tenantId, userId, signalId, feedbackType, rating, comment) => {
      createdTenantId = tenantId;
      createdSignalId = signalId;
      return { id: 'fb-1', tenantId, signalId, feedbackType, rating, comment } as never;
    },
  };

  const service = createService(repoStubs, mockCredits());
  await service.createFeedback(TENANT_A, USER_ID, 'signal-1', 'accuracy', 5, 'Great signal!');

  assert.equal(createdTenantId, TENANT_A);
  assert.equal(createdSignalId, 'signal-1');
});

// Controller Tests

test('controller createSignal invalid body rejected', async () => {
  const service = createService({}, mockCredits());
  const context = mockContextService(TENANT_A, USER_ID);
  const controller = new MarketSituationController(service, context);

  // Missing title, which is required by CreateSignalSchema
  const invalidBody = {
    signalType: 'project_hot',
    summary: 'A new high-speed railway tender',
    region: 'Zhejiang',
  };

  await assert.rejects(
    () => controller.createSignal(invalidBody),
    (err: unknown) => {
      const e = err as { issues: Array<{ path: string[] }> };
      assert.ok(e.issues);
      assert.equal(e.issues[0]?.path[0], 'title');
      return true;
    },
  );
});

test('controller unlockSignal uses TenantContextService, not naked headers', async () => {
  let invokedTenantId = '';
  let invokedUserId = '';

  const repoStubs: Partial<MockRepo> = {
    findSignalById: async () => mockSignal,
    createUnlockLog: async () => ({} as never),
  };

  const credit = mockCredits(100);
  const service = createService(repoStubs, credit);

  service.unlockSignal = async (tenantId, userId, id, unlockType) => {
    invokedTenantId = tenantId;
    invokedUserId = userId;
    return mockSignal;
  };

  const context = mockContextService(TENANT_B, 'custom-user');
  const controller = new MarketSituationController(service, context);

  await controller.unlockSignal('signal-1', { unlockType: 'full' });

  assert.equal(invokedTenantId, TENANT_B);
  assert.equal(invokedUserId, 'custom-user');
});

test('controller has RequirePermission market-situation:unlock', () => {
  const permission = Reflect.getMetadata('requiredPermission', MarketSituationController.prototype.unlockSignal);
  assert.equal(permission, 'market-situation:unlock');
});

test('generateAnalysis happy path: preCharge + AI invoke + log + commit (no refund)', async () => {
  let committed = false;
  let refunded = false;
  const credit = mockCredits(500);
  credit.commit = () => { committed = true; };
  credit.refund = () => { refunded = true; };
  let logCreated = false;
  const service = createService({
    createGenerationLog: async (tenantId, userId, signalId, generationType, creditsCost, traceId, status) => {
      logCreated = true;
      return { id: 'gen-1', tenantId, userId, signalId, generationType, creditsCost, traceId, status, inputSnapshot: {}, outputSnapshot: {}, createdAt: '2026-06-01T00:00:00.000Z' } as never;
    },
  }, credit);
  const log = await service.generateAnalysis(TENANT_A, USER_ID, 'signal-1', 'summary');
  assert.equal(logCreated, true);
  assert.equal(committed, true);
  assert.equal(refunded, false);
  assert.equal((log as { id: string }).id, 'gen-1');
  assert.equal(credit.balance(), 400); // 500 - 100 (summary cost), committed not double-charged
});

test('generateAnalysis AI failure triggers refund and rethrows', async () => {
  let refunded = false;
  let committed = false;
  const credit = mockCredits(500);
  credit.refund = () => { refunded = true; };
  credit.commit = () => { committed = true; };
  const failingGateway = { invoke: async () => { throw new Error('ai-provider-down'); } };
  const service = createService({}, credit, failingGateway);
  await assert.rejects(() => service.generateAnalysis(TENANT_A, USER_ID, 'signal-1', 'summary'), /ai-provider-down/);
  assert.equal(refunded, true);
  assert.equal(committed, false);
});

test('generateAnalysis DB log failure triggers refund and rethrows', async () => {
  let refunded = false;
  let committed = false;
  const credit = mockCredits(500);
  credit.refund = () => { refunded = true; };
  credit.commit = () => { committed = true; };
  const service = createService({
    createGenerationLog: async () => { throw new Error('db-down'); },
  }, credit);
  await assert.rejects(() => service.generateAnalysis(TENANT_A, USER_ID, 'signal-1', 'summary'), /db-down/);
  assert.equal(refunded, true);
  assert.equal(committed, false);
});

test('generateAnalysis is tenant scoped: signal lookup uses caller tenant', async () => {
  let lookupTenant: string | undefined;
  const service = createService({
    findSignalById: async (tenantId: string) => {
      lookupTenant = tenantId;
      if (tenantId !== TENANT_A) {
        throw Object.assign(new Error('Market signal not found.'), { code: 'MARKET_SIGNAL_NOT_FOUND' });
      }
      return mockSignal;
    },
  }, mockCredits(500));
  await service.generateAnalysis(TENANT_A, USER_ID, 'signal-1', 'summary');
  assert.equal(lookupTenant, TENANT_A);
});
