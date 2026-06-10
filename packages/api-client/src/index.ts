import axios, { type AxiosError, type AxiosInstance, type AxiosResponse } from 'axios';

export interface ApiEnvelope<TData> {
  code: string;
  data: TData;
  message: string;
  traceId: string;
}

export type CredentialMode = 'mock' | 'real';
export type CredentialStatus = 'active' | 'disabled' | 'pending_approval';

export interface CredentialRecord {
  approval: CredentialStatus;
  key: string;
  lastPingAt?: string;
  mode: CredentialMode;
  provider: string;
  updatedAt: string;
}

export interface AdminModuleSummary {
  alerts: Array<{ level: 'info' | 'success' | 'warning'; message: string }>;
  rows: Array<Record<string, string>>;
  stats: Array<{ label: string; trend: string; value: string }>;
  workflow: string[];
}

export interface AdminMutationInput {
  action: string;
  endpoint: string;
  idempotencyKey: string;
  rowId?: string;
}

export interface AdminMutationResult {
  auditEvent: string;
  idempotencyKey: string;
  message: string;
  rowId?: string;
  traceId: string;
}

export interface IngestRunRecord {
  ended_at?: string;
  failed_count: number;
  fetched_count: number;
  id: string;
  job_name: string;
  started_at: string;
  status: string;
  target_table: string;
  trace_id: string;
  upserted_count: number;
}

export interface IngestStats {
  counts: Array<{ count: number; table_name: string }>;
}

export interface AiChatMessage {
  content: string;
  role: 'assistant' | 'user';
}

export interface AiChatResult {
  buttons: string[];
  confidence: 'high' | 'low' | 'medium';
  message: AiChatMessage;
  tier: 1 | 2 | 3 | 4;
  traceId: string;
}

export interface AiGatewayInvokeInput {
  context?: Record<string, unknown>;
  taskType: string;
  userInput: string;
}

export interface AiGatewayInvokeResult {
  message?: AiChatMessage;
  providerUsed?: string;
  summary?: string;
  text?: string;
  traceId?: string;
}

export interface RiskReviewListItem {
  amount: string;
  counterparty: string;
  createdAt: string;
  id: string;
  riskLevel: 'green' | 'red' | 'yellow';
  status: 'completed' | 'queued' | 'reviewing';
  title: string;
}

export interface RiskReviewFinding {
  clause: string;
  id: string;
  impact: string;
  level: 'green' | 'red' | 'yellow';
  standardWording?: string;
  suggestion: string;
  type: string;
}

export interface RiskReviewDetail extends RiskReviewListItem {
  confidence: 'high' | 'low' | 'medium';
  disclaimer: string;
  findings: RiskReviewFinding[];
  tier: 1 | 2 | 3 | 4;
  traceId: string;
}

export interface TenderListItem {
  amount: string;
  deadline: string;
  id: string;
  matchScore: number;
  owner: string;
  projectType: string;
  status: 'active' | 'completed' | 'expired' | 'reviewing';
  title: string;
}

export interface TenderEligibilityCheck {
  gap?: string;
  item: string;
  match: boolean;
  ourStatus: string;
  required: string;
}

export interface TenderTimeline {
  date: string;
  daysFromNow: number;
  milestone: string;
}

export interface TenderDetail extends TenderListItem {
  confidence: 'high' | 'low' | 'medium';
  disclaimer: string;
  eligibility: TenderEligibilityCheck[];
  keyPoints: string[];
  scorePrediction: { commercial: number; price: number; suggestions: string[]; technical: number };
  tier: 1 | 2 | 3 | 4;
  timeline: TenderTimeline[];
  traceId: string;
}

export interface OpportunityListItem {
  amount: string;
  deadline: string;
  id: string;
  matchScore: number;
  owner: string;
  region: string;
  title: string;
}

export interface OpportunityDetail extends OpportunityListItem {
  confidence: 'high' | 'low' | 'medium';
  disclaimer: string;
  ownerVerification: {
    businessInfo: string;
    complaints: number;
    creditCode: string;
    historyProjects: number;
    relatedCompanies: string[];
    risk: string;
  };
  peerRadar: {
    avgBid: string;
    medianBid: string;
    period: string;
    winners: number;
  };
  recommendedPrice: {
    ceiling: string;
    floor: string;
    reasoning: string;
    sweet: string;
  };
  tier: 1 | 2 | 3 | 4;
  timeline: Array<{ date: string; milestone: string }>;
  traceId: string;
}

export interface InvestabilityReport {
  confidence: 'high' | 'low' | 'medium';
  ownerVerification: OpportunityDetail['ownerVerification'];
  peerRadar: OpportunityDetail['peerRadar'];
  recommendedPrice: OpportunityDetail['recommendedPrice'];
  score: number;
  tier: 1 | 2 | 3 | 4;
  traceId: string;
}

export type ReportType = 'ai-cost-weekly' | 'contract-monthly' | 'kpi-weekly' | 'qualification-monthly' | 'tender-weekly';

export interface ReportListItem {
  createdAt: string;
  id: string;
  shared: boolean;
  status: 'completed' | 'generating' | 'reviewing';
  title: string;
  type: ReportType;
}

export interface ReportDetail extends ReportListItem {
  coBrand: { clientName?: string; tongqian: boolean };
  confidence: 'high' | 'low' | 'medium';
  dateRange: { from: string; to: string };
  disclaimer: string;
  findings: Array<{ detail: string; level: 'green' | 'red' | 'yellow'; title: string }>;
  h5Url?: string;
  pdfUrl?: string;
  tier: 1 | 2 | 3 | 4;
  traceId: string;
}

export interface QualificationCert {
  category: string;
  daysToExpiry: number;
  expiresAt: string;
  id: string;
  issuedAt: string;
  level: string;
  name: string;
  riskLevel: 'green' | 'red' | 'yellow';
}

export interface QualificationCheckupReport {
  confidence: 'high' | 'low' | 'medium';
  disclaimer: string;
  expiring: QualificationCert[];
  gaps: Array<{ area: string; description: string; suggestion: string }>;
  overallScore: number;
  tier: 1 | 2 | 3 | 4;
  traceId: string;
  upgradable: Array<{ from: string; potential: number; to: string }>;
}

export interface UpgradePathReport {
  confidence: 'high' | 'low' | 'medium';
  current: string;
  disclaimer: string;
  estimatedMonths: number;
  gaps: Array<{ current: string; dimension: string; missing: string; required: string }>;
  recommendedRoute: string;
  routes: Array<{ description: string; name: string }>;
  target: string;
  tier: 1 | 2 | 3 | 4;
  traceId: string;
}

export interface ChatConversation {
  channel: 'api' | 'desktop' | 'gov' | 'web' | 'wechat' | 'work_wechat';
  id: string;
  lastAt: string;
  status: 'active' | 'archived';
  title: string;
}

export interface ChatMessage {
  content: string;
  createdAt: string;
  id: string;
  intent?: string;
  role: 'assistant' | 'system' | 'user';
  triggeredTaskId?: string;
}

export interface ChatSendResult {
  assistantMessage: ChatMessage;
  conversation: ChatConversation;
  dispatch: {
    followUpButtons: string[];
    redirectUrl?: string;
    replyText: string;
    triggeredTaskId?: string;
  };
  intent: string;
  memory: {
    recentMessages: ChatMessage[];
    summary: string;
  };
  userMessage: ChatMessage;
}

export interface DispatchListItem {
  id: string;
  type: string;
  status: 'pending' | 'accepted' | 'quoted' | 'confirmed' | 'in_progress' | 'completed' | 'refunded';
  agent?: { id: string; name: string; level: 'LV1' | 'LV2' | 'LV3' | 'LV4' | 'LV5'; reputation: number };
  amount?: string;
  createdAt: string;
  protectionExpireAt?: string;
  matchScore?: number;
}

export interface DispatchDetail extends DispatchListItem {
  budget?: string;
  description: string;
  expectedDate: string;
  messages: Array<{ at: string; content: string; from: 'agent' | 'owner' }>;
  rating?: number;
  review?: string;
  timeline: Array<{ date: string; milestone: string; status: string }>;
}

export interface CashflowOverview {
  alerts: Array<{ level: 'red' | 'yellow'; message: string; type: string }>;
  cashGap: string;
  financingCapacity: string;
  forecast: { day30: string; day60: string; day90: string };
  overdue90: string;
  totalReceivable: string;
}

export interface Receivable {
  aging: number;
  amount: string;
  client: string;
  id: string;
  project: string;
  riskLevel: 'green' | 'red' | 'yellow';
  status: 'active' | 'badDebt' | 'collecting' | 'legal';
}

export interface ReminderDetail {
  body: string;
  confidence: 'high' | 'low' | 'medium';
  disclaimer: string;
  id: string;
  level: 'formal' | 'legal' | 'soft';
  receivable: Receivable;
  tier: 1 | 2 | 3 | 4;
  traceId: string;
}

export interface ProjectListItem {
  amount: string;
  client: string;
  id: string;
  name: string;
  pm: string;
  progress: number;
  riskLevel: 'green' | 'red' | 'yellow';
}

export interface ProjectDetail extends ProjectListItem {
  costBreakdown: Array<{ label: string; value: number }>;
  drawings: Array<{ id: string; name: string; version: string }>;
  endDate: string;
  kpis: { collected: number; completed: number; costVariance: number; scheduleVariance: number };
  risks: Array<{ level: 'green' | 'red' | 'yellow'; title: string }>;
  siteLogs: Array<{ at: string; content: string; weather: string }>;
  startDate: string;
  tier: 1 | 2 | 3 | 4;
}

export interface OwnerRiskProfileView {
  id: string;
  tenantId: string;
  userId: string;
  ownerName: string;
  idCardMasked?: string;
  creditCode?: string;
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  guaranteeRiskLevel?: 'low' | 'medium' | 'high' | 'critical';
  mixingRiskLevel?: 'low' | 'medium' | 'high' | 'critical';
  counterpartyRiskLevel?: 'low' | 'medium' | 'high' | 'critical';
  receivableRiskLevel?: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface OwnerRiskCardView {
  id: string;
  profileId: string;
  tenantId: string;
  cardType: 'guarantee' | 'mixing' | 'counterparty' | 'receivable';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence?: 'high' | 'medium' | 'low';
  isUnlocked: boolean;
  unlockCredits: number;
  title?: string;
  summary?: string;
  detail?: Record<string, unknown>;
  createdAt: string;
  unlockedAt?: string;
}

export interface OwnerRiskUnlockLogView {
  id: string;
  cardId: string;
  tenantId: string;
  userId: string;
  creditsCharged: number;
  status: string;
  traceId: string;
  createdAt: string;
}

export interface OwnerRiskGenerationLogView {
  id: string;
  profileId: string;
  tenantId: string;
  userId: string;
  generationType: string;
  creditsCost: number;
  status: string;
  traceId: string;
  createdAt: string;
}

export interface OwnerRiskReportSectionView {
  sectionKey: string;
  title: string;
  content: string;
  riskLevel?: string;
  tierBadge?: number;
  confidence?: string;
  suggestedActions?: string[];
}

export interface OwnerRiskGuaranteeRecord {
  id: string;
  guaranteedCompany: string;
  guaranteeAmount: number;
  guaranteeType: string;
  status: string;
  riskLevel: string;
  endDate?: string;
}

export interface OwnerRiskMixingRecord {
  id: string;
  recordType: string;
  summary: string;
  riskLevel: string;
  occurrences: number;
  createdAt: string;
}

export interface OwnerRiskCounterpartyRecord {
  id: string;
  companyName: string;
  associationType: string;
  watchlistReason: string;
  riskLevel: string;
  createdAt: string;
}

export interface OwnerRiskReceivableRecord {
  id: string;
  debtorName: string;
  overdueAmount: number;
  agingDays: number;
  recoveryProbability: number;
  riskLevel: string;
  isGuaranteed: boolean;
}

export interface OwnerRiskReportView {
  id: string;
  profileId: string;
  tenantId: string;
  userId: string;
  reportType: string;
  title: string;
  tierBadge: number;
  confidence: string;
  riskLevel: string;
  executiveSummary: string;
  dataSnapshot?: Record<string, unknown>;
  sections?: OwnerRiskReportSectionView[];
  createdAt: string;
  updatedAt?: string;
  creditsCost: number;
  disclaimer: string;
}

export interface OwnerRiskReviewRequestView {
  id: string;
  profileId: string;
  tenantId: string;
  userId: string;
  reviewType: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  assignedAgentId?: string;
  assignedExpertId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OwnerDashboardData {
  generatedAt: string;
  greeting: string;
  kpis: {
    approvals: { trend: string; value: number };
    credits: { trend: string; value: number };
    opportunities: { trend: string; value: number };
    riskRed: { trend: string; value: number };
  };
  opportunities: Array<{ deadline: string; meta: string; title: string }>;
  reports: string[];
  risks: Array<{ detail: string; level: 'green' | 'red' | 'yellow'; title: string }>;
}

export type MarketSignalType = 'project_hot' | 'party_risk' | 'competitor_active' | 'qualification_dynamic' | 'policy_window' | 'judicial_risk';
export type MarketSignalSourceType = 'tender_platform' | 'courtWebsite' | 'creditPlatform' | 'policyWebsite' | 'newsMedia' | 'internal';
export type MarketSignalTagCategory = 'region' | 'industry' | 'risk_type' | 'opportunity_type';
export type MarketSignalUnlockType = 'impact_analysis' | 'simulation' | 'report' | 'full';
export type MarketSignalSimulationType = 'project_participation' | 'market_impact' | 'risk_spread' | 'opportunity_timing';
export type MarketSignalReportType = 'situation_summary' | 'impact_analysis' | 'participation_recommendation';
export type MarketSignalFeedbackType = 'accuracy' | 'relevance' | 'usefulness' | 'new_info';
export type MarketSignalGenerationType = 'summary' | 'impact_analysis' | 'simulation' | 'report';

export interface MarketSignalView {
  id: string;
  tenantId: string;
  userId: string;
  signalType: MarketSignalType;
  title: string;
  summary: string;
  region: string;
  businessLine?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  opportunityLevel: 'low' | 'medium' | 'high';
  confidence: 'low' | 'medium' | 'high';
  sourceId?: string;
  sourceUrl?: string;
  rawData?: Record<string, unknown>;
  impactAnalysis?: MarketImpactAnalysisView;
  isPublished: boolean;
  isFeatured: boolean;
  tierBadge: number;
  unlockCredits: number;
  viewCount: number;
  feedbackCount: number;
  tags: string[];
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  unlockedParts?: string[];
}

export interface MarketImpactAnalysisView {
  affectedRegions: string[];
  affectedIndustries: string[];
  potentialOpportunities: string[];
  potentialRisks: string[];
  suggestedActions: string[];
  confidence: 'low' | 'medium' | 'high';
  tierBadge: number;
}

export interface MarketSignalSourceView {
  id: string;
  sourceName: string;
  sourceType: MarketSignalSourceType;
  sourceUrl?: string;
  region: string;
  dataTypes: string[];
  crawlIntervalMin: number;
  isActive: boolean;
  lastCrawledAt?: string;
  healthStatus: 'healthy' | 'degraded' | 'unknown';
  createdAt: string;
}

export interface MarketSignalTagView {
  id: string;
  tagKey: string;
  tagName: string;
  tagCategory: MarketSignalTagCategory;
  usageCount: number;
  createdAt: string;
}

export interface MarketSignalUnlockLogView {
  id: string;
  signalId: string;
  tenantId: string;
  userId: string;
  unlockType: MarketSignalUnlockType;
  creditsCharged: number;
  status: 'success' | 'failed' | 'refunded';
  traceId: string;
  createdAt: string;
}

export interface MarketSignalSimulationView {
  id: string;
  signalId: string;
  tenantId: string;
  userId: string;
  simulationType: MarketSignalSimulationType;
  inputParams: Record<string, unknown>;
  simulationResult: Record<string, unknown>;
  confidence: 'low' | 'medium' | 'high';
  tierBadge: number;
  aiTaskId?: string;
  creditsCost: number;
  createdAt: string;
}

export interface MarketSignalReportView {
  id: string;
  signalId: string;
  tenantId: string;
  userId: string;
  reportType: MarketSignalReportType;
  title: string;
  tierBadge: number;
  confidence: 'low' | 'medium' | 'high';
  executiveSummary: string;
  dataSnapshot: Record<string, unknown>;
  h5Url?: string;
  pdfUrl?: string;
  aiTaskId?: string;
  reportId?: string;
  creditsCost: number;
  disclaimer: string;
  createdAt: string;
}

export interface MarketSignalFeedbackView {
  id: string;
  signalId: string;
  tenantId: string;
  userId: string;
  feedbackType: MarketSignalFeedbackType;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface MarketSignalGenerationLogView {
  id: string;
  signalId: string;
  tenantId: string;
  userId: string;
  generationType: MarketSignalGenerationType;
  aiTaskId?: string;
  inputSnapshot: Record<string, unknown>;
  outputSnapshot?: Record<string, unknown>;
  creditsCost: number;
  status: 'success' | 'failed' | 'partial';
  errorCode?: string;
  traceId: string;
  createdAt: string;
}

export interface MarketSignalListResult {
  list: MarketSignalView[];
  total: number;
}

export interface AgentDashboardData {
  calendar: { days: Array<{ amount: number; day: number; settled: boolean }>; total: number };
  dispatch: { available: number; urgent: number };
  level: string;
  monthCommission: number;
  nextLevelGap: number;
  score: number;
  scoreChanges: Array<{ amount: number; reason: string; type: 'minus' | 'plus' }>;
}

export interface GovDashboardData {
  documents: Array<{ due: string; title: string }>;
  fundMatches: Array<{ amount: string; score: number; title: string }>;
  subscriptions: Array<{ level: string; title: string }>;
}

export interface AdminDashboardData {
  aarrr: Array<{ label: string; value: number }>;
  ai: { deepseek: string; latencyMs: number; mockFallback: boolean; routeHealth: string };
  metrics: { dau: number; mau: number; wau: number };
  redLines: Array<{ code: string; status: 'green' | 'red' | 'yellow'; value: string }>;
}

export interface ApiClientOptions {
  baseURL?: string;
  getToken?: () => string | undefined;
  mock?: boolean;
  onFriendlyError?: (message: string, traceId?: string) => void;
  onUnauthorized?: () => void;
  onServerError?: (error: unknown, traceId?: string) => void;
}

const traceHeader = 'x-trace-id';

const credentialFixtures: CredentialRecord[] = [
  { approval: 'active', key: 'DEEPSEEK_API_KEY', lastPingAt: '2026-05-20 10:00', mode: 'real', provider: 'deepseek', updatedAt: 'DeepSeek active' },
  { approval: 'active', key: 'ALIYUN_DASHSCOPE_API_KEY', lastPingAt: '2026-05-21 09:00', mode: 'real', provider: 'dashscope', updatedAt: 'M3.12 qwen3-max/qwen3-vl-max active' },
  { approval: 'active', key: 'MIDLAYER_API_KEY', mode: 'mock', provider: 'midlayer', updatedAt: 'mock-ready' },
  { approval: 'active', key: 'MIDLAYER_BASE_URL', mode: 'mock', provider: 'midlayer', updatedAt: 'mock-ready' },
  { approval: 'pending_approval', key: 'WECHAT_PAY_*', mode: 'mock', provider: 'wechat_pay', updatedAt: 'P1 mock provider' },
  { approval: 'pending_approval', key: 'ALIYUN_OSS_*', mode: 'mock', provider: 'aliyun_oss', updatedAt: 'P1 mock provider' },
];

export function createApiClient(options: ApiClientOptions = {}) {
  const envMock =
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_API_MOCK !== 'false'
      : true;
  const mock = options.mock ?? envMock;
  const http = axios.create({
    baseURL: options.baseURL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:4000/api/v1',
    timeout: 15_000,
  });

  http.interceptors.request.use((config) => {
    const token = options.getToken?.() ?? readBrowserToken();
    config.headers.set(traceHeader, cryptoRandomId());
    config.headers.set('x-tenant-id', readBrowserValue('tongqian.tenantId') ?? 'mock-tenant');
    config.headers.set('x-user-id', readBrowserValue('tongqian.userId') ?? 'mock-user');
    if (token) config.headers.set('Authorization', `Bearer ${token}`);
    return config;
  });

  http.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiEnvelope<unknown>>) => {
      const status = error.response?.status;
      const traceId = error.response?.data?.traceId ?? String(error.response?.headers?.[traceHeader] ?? '');
      if (status === 401) {
        options.onUnauthorized?.();
        if (typeof window !== 'undefined') window.location.href = resolveUnauthorizedLoginHref();
      } else if (status === 422) {
        options.onFriendlyError?.(error.response?.data?.message ?? 'Request parameters need review.', traceId);
      } else if (status && status >= 500) {
        options.onServerError?.(error, traceId);
        options.onFriendlyError?.('Service is temporarily unavailable. The traceId has been recorded.', traceId);
      }
      return Promise.reject(error);
    },
  );

  return {
    admin: createAdminApi(http, mock),
    ai: createAiApi(http, mock),
    aiGateway: createAiGatewayApi(http, mock),
    chatHub: createChatHubApi(http, mock),
    credentials: createCredentialApi(http, mock),
    dashboard: createDashboardApi(http, mock),
    dispatch: createDispatchApi(http, mock),
    cashflow: createCashflowApi(http, mock),
    http,
    mock,
    opportunity: createOpportunityApi(http, mock),
    report: createReportApi(http, mock),
    riskReview: createRiskReviewApi(http, mock),
    qualification: createQualificationApi(http, mock),
    tender: createTenderApi(http, mock),
    projectSite: createProjectSiteApi(http, mock),
    ownerRisk: createOwnerRiskApi(http, mock),
    marketSituation: createMarketSituationApi(http, mock),
  };
}

function createAiGatewayApi(http: AxiosInstance, mock: boolean) {
  return {
    async invoke(input: AiGatewayInvokeInput): Promise<AiGatewayInvokeResult> {
      if (mock) {
        return delay({
          providerUsed: 'mock',
          summary: `已基于 ${input.taskType} 生成执行清单：先确认金额和截止时间，再补齐证据链、责任人和下一次复核节点。`,
          traceId: cryptoRandomId(),
        });
      }
      const response = await unwrap<Record<string, unknown>>(
        await http.post('/ai/invoke', {
          input: {
            context: input.context,
            message: input.userInput,
          },
          taskType: input.taskType,
        }),
      );
      const data = (response.data && typeof response.data === 'object' ? response.data : response) as Record<string, unknown>;
      return {
        message: { content: normalizeText(data.answer ?? data.summary ?? response.fallbackText), role: 'assistant' },
        providerUsed: normalizeText(response.providerUsed ?? data.providerUsed),
        summary: normalizeText(data.summary ?? response.summary ?? data.answer),
        text: normalizeText(data.answer ?? data.summary ?? response.fallbackText),
        traceId: normalizeText(response.traceId ?? data.traceId),
      };
    },
  };
}

function createDashboardApi(http: AxiosInstance, mock: boolean) {
  return {
    async admin(): Promise<AdminDashboardData> {
      if (mock) return delay(adminDashboardFixture());
      return unwrap(await http.get('/dashboard/admin'));
    },
    async agent(): Promise<AgentDashboardData> {
      if (mock) {
        const reputation = agentDashboardFixture();
        return delay(reputation);
      }
      const [reputation, calendar] = await Promise.all([
        unwrap<Omit<AgentDashboardData, 'calendar'>>(await http.get('/agent/reputation')),
        unwrap<AgentDashboardData['calendar']>(await http.get('/commissions/calendar')),
      ]);
      return { ...reputation, calendar };
    },
    async gov(): Promise<GovDashboardData> {
      if (mock) return delay(govDashboardFixture());
      return unwrap(await http.get('/dashboard/gov'));
    },
    async owner(): Promise<OwnerDashboardData> {
      if (mock) return delay(ownerDashboardFixture());
      return unwrap(await http.get('/dashboard/owner-kpi'));
    },
  };
}

function createRiskReviewApi(http: AxiosInstance, mock: boolean) {
  return {
    async create(payload: Record<string, unknown>): Promise<{ confidence?: string; findingsCount?: number; modelUsed?: string; outputSchemaValid?: boolean; providerUsed?: string; reviewId: string; tier?: number; traceId?: string }> {
      if (mock) return delay({ confidence: 'medium', findingsCount: 5, modelUsed: 'deepseek-reasoner', outputSchemaValid: true, providerUsed: 'mock', reviewId: 'demo-yellow', tier: 2, traceId: normalizeText(payload.traceId ?? cryptoRandomId()) });
      return unwrap(await http.post('/risk-review', payload));
    },
    async download(id: string, format: 'docx' | 'pdf'): Promise<{ url: string }> {
      if (mock) return delay({ url: `mock://oss/risk-review/${id}.${format}?ttl=3600` });
      return unwrap(await http.get(`/risk-review/${id}/download`, { params: { format } }));
    },
    async get(id: string): Promise<RiskReviewDetail> {
      if (mock) return delay(riskReviewDetailFixture(id));
      return unwrap(await http.get(`/risk-review/${id}`));
    },
    async list(filters?: Record<string, unknown>): Promise<RiskReviewListItem[]> {
      if (mock) return delay(riskReviewListFixture().filter((row) => !filters?.riskLevel || filters.riskLevel === 'all' || row.riskLevel === filters.riskLevel));
      return unwrap(await http.get('/risk-review', { params: filters }));
    },
  };
}

function createTenderApi(http: AxiosInstance, mock: boolean) {
  return {
    async create(payload: Record<string, unknown>): Promise<{ confidence?: string; keyPointsCount?: number; modelUsed?: string; outputSchemaValid?: boolean; providerUsed?: string; tenderId: string; tier?: number; traceId?: string }> {
      if (mock) return delay({ confidence: 'medium', keyPointsCount: 10, modelUsed: 'deepseek-reasoner', outputSchemaValid: true, providerUsed: 'mock', tenderId: 'demo-active', tier: 2, traceId: normalizeText(payload.traceId ?? cryptoRandomId()) });
      return unwrap(await http.post('/tenders', payload));
    },
    async generateFramework(id: string): Promise<{ frameworkId: string }> {
      if (mock) return delay({ frameworkId: `framework-${id}` });
      return unwrap(await http.post(`/tenders/${id}/framework`));
    },
    async get(id: string): Promise<TenderDetail> {
      if (mock) return delay(tenderDetailFixture(id));
      return unwrap(await http.get(`/tenders/${id}`));
    },
    async list(filters?: Record<string, unknown>): Promise<TenderListItem[]> {
      if (mock) return delay(tenderListFixture().filter((row) => !filters?.projectType || filters.projectType === 'all' || row.projectType.includes(String(filters.projectType))));
      return unwrap(await http.get('/tenders', { params: filters }));
    },
  };
}

function createOpportunityApi(http: AxiosInstance, mock: boolean) {
  return {
    async get(id: string): Promise<OpportunityDetail> {
      if (mock) return delay(opportunityDetailFixture(id));
      return unwrap(await http.get(`/opportunities/${id}`));
    },
    async investabilityReport(id: string): Promise<InvestabilityReport> {
      if (mock) {
        const detail = opportunityDetailFixture(id);
        return delay({
          confidence: detail.confidence,
          ownerVerification: detail.ownerVerification,
          peerRadar: detail.peerRadar,
          recommendedPrice: detail.recommendedPrice,
          score: detail.matchScore,
          tier: detail.tier,
          traceId: detail.traceId,
        });
      }
      return unwrap(await http.post(`/opportunities/${id}/investability`));
    },
    async list(filters?: Record<string, unknown>): Promise<OpportunityListItem[]> {
      if (mock) {
        return delay(opportunityListFixture().filter((row) => !filters?.region || filters.region === 'all' || row.region === filters.region));
      }
      return unwrap(await http.get('/opportunities', { params: filters }));
    },
    async savePreference(payload: Record<string, unknown>): Promise<{ ok: true; traceId: string }> {
      if (mock) return delay({ ok: true, traceId: cryptoRandomId() });
      return unwrap(await http.post('/opportunities/preferences', payload));
    },
  };
}

function createReportApi(http: AxiosInstance, mock: boolean) {
  return {
    async create(payload: Record<string, unknown>): Promise<{ reportId: string; traceId: string }> {
      if (mock) return delay({ reportId: 'rep-contract-monthly', traceId: cryptoRandomId() });
      return unwrap(await http.post('/reports', payload));
    },
    async download(id: string, format: 'pdf' | 'h5'): Promise<{ url: string }> {
      if (mock) return delay({ url: `mock://oss/reports/${id}.${format}?ttl=3600` });
      return unwrap(await http.get(`/reports/${id}/download/${format}`));
    },
    async get(id: string): Promise<ReportDetail> {
      if (mock) return delay(reportDetailFixture(id));
      return unwrap(await http.get(`/reports/${id}`));
    },
    async list(filters?: Record<string, unknown>): Promise<ReportListItem[]> {
      if (mock) {
        return delay(reportListFixture().filter((row) => !filters?.type || filters.type === 'all' || row.type === filters.type));
      }
      return unwrap(await http.get('/reports', { params: filters }));
    },
    async share(id: string, channel: 'email' | 'link' | 'wechat'): Promise<{ shareUrl: string }> {
      if (mock) return delay({ shareUrl: `https://mock.tongqian.local/reports/${id}?channel=${channel}` });
      return unwrap(await http.post(`/reports/${id}/share`, { channel }));
    },
  };
}

function createQualificationApi(http: AxiosInstance, mock: boolean) {
  return {
    async checkup(): Promise<QualificationCheckupReport> {
      if (mock) return delay(qualificationCheckupFixture());
      return unwrap(await http.get('/qualifications/checkup'));
    },
    async create(payload: Record<string, unknown>): Promise<{ certId: string; confidence?: string; outputSchemaValid?: boolean; providerUsed?: string; traceId?: string }> {
      if (mock) return delay({ certId: 'qual-upgrade-easy', confidence: 'medium', outputSchemaValid: true, providerUsed: 'mock', traceId: normalizeText(payload.traceId ?? cryptoRandomId()) });
      return unwrap(await http.post('/qualifications', payload));
    },
    async list(): Promise<QualificationCert[]> {
      if (mock) return delay(qualificationCertFixture());
      return unwrap(await http.get('/qualifications'));
    },
    async upgradePath(certId: string, targetLevel = '一级'): Promise<UpgradePathReport> {
      if (mock) return delay(upgradePathFixture(certId, targetLevel));
      return unwrap(await http.get(`/qualifications/${certId}/upgrade`, { params: { targetLevel } }));
    },
  };
}

export const apiClient = createApiClient();

function createCredentialApi(http: AxiosInstance, mock: boolean) {
  let records = [...credentialFixtures];
  return {
    async list(): Promise<CredentialRecord[]> {
      if (mock) return delay(records);
      return unwrap<CredentialRecord[]>(await http.get('/admin/credentials'));
    },
    async ping(provider: string): Promise<{ latencyMs: number; ok: boolean; provider: string }> {
      if (mock) return delay({ latencyMs: provider === 'deepseek' ? 186 : 0, ok: provider === 'deepseek', provider });
      return unwrap(await http.post(`/admin/credentials/${provider}/ping`));
    },
    async save(input: { key: string; mode: CredentialMode; provider: string; value?: string }): Promise<CredentialRecord> {
      if (mock) {
        const updated: CredentialRecord = {
          approval: 'pending_approval',
          key: input.key,
          mode: input.mode,
          provider: input.provider,
          updatedAt: new Date().toISOString(),
        };
        records = [updated, ...records.filter((record) => record.key !== input.key)];
        return delay(updated);
      }
      return unwrap(await http.post('/admin/credentials', input));
    },
    async switchActive(input: { operatorPassword: string; provider: string }): Promise<CredentialRecord> {
      if (mock) {
        records = records.map((record) => ({ ...record, approval: record.provider === input.provider ? 'active' : record.approval }));
        const active = records.find((record) => record.provider === input.provider) ?? records.find((record) => record.provider === 'deepseek');
        if (!active) throw new Error('No credential provider available');
        return delay(active);
      }
      return unwrap(await http.post(`/admin/credentials/${input.provider}/activate`, input));
    },
  };
}

function createAdminApi(http: AxiosInstance, mock: boolean) {
  return {
    async detail(slug: string, id: string): Promise<Record<string, string>> {
      if (mock) return delay({ id, module: slug, owner: 'platform-owner', status: 'active', traceId: cryptoRandomId() });
      return unwrap(await http.get(`/admin/${slug}/${id}`));
    },
    async module(slug: string): Promise<AdminModuleSummary> {
      if (mock) return delay(buildAdminModuleFixture(slug));
      return unwrap(await http.get(`/admin/${slug}`));
    },
    async mutate(slug: string, input: AdminMutationInput): Promise<AdminMutationResult> {
      if (mock) {
        return delay({
          auditEvent: `admin.${slug}.${input.action}`,
          idempotencyKey: input.idempotencyKey,
          message: `${input.action} submitted for ${slug}; audit log and approval queue updated.`,
          rowId: input.rowId,
          traceId: cryptoRandomId(),
        });
      }
      return unwrap(await http.post(`/admin/${slug}`, input, { headers: { 'Idempotency-Key': input.idempotencyKey } }));
    },
    ingest: {
      async run(jobName: string): Promise<{ jobName: string; status: string; targetTable: string; upsertedCount: number }> {
        return unwrap(await http.post(`/admin/ingest/${encodeURIComponent(jobName)}/run`));
      },
      async uploadCourtJudgments(fileOrForm: File | FormData): Promise<{ imported: number; targetTable: string }> {
        return unwrap(await http.post('/admin/ingest/court-judgments/upload', toFormData(fileOrForm, 'court.csv')));
      },
      async searchTianyancha(keyword: string): Promise<{ keyword: string; targetTable: string; upserted: number }> {
        return unwrap(await http.post('/admin/ingest/tianyancha/search', { keyword }));
      },
      async submitOcr(fileOrForm: File | FormData): Promise<{ status: string; targetTable: string; taskNo: string }> {
        return unwrap(await http.post('/admin/ingest/ocr/submit', toFormData(fileOrForm, 'ocr.pdf')));
      },
      async runs(jobName?: string): Promise<{ items: IngestRunRecord[]; total: number }> {
        return unwrap(await http.get('/admin/ingest/runs', { params: jobName ? { jobName } : undefined }));
      },
      async stats(): Promise<IngestStats> {
        return unwrap(await http.get('/admin/ingest/stats'));
      },
    },
  };
}

function toFormData(fileOrForm: File | FormData, fallbackName: string): FormData {
  if (fileOrForm instanceof FormData) return fileOrForm;
  const form = new FormData();
  form.append('file', fileOrForm, fileOrForm.name || fallbackName);
  return form;
}

function createAiApi(http: AxiosInstance, mock: boolean) {
  return {
    async chat(messages: AiChatMessage[], taskType = 'chat.long'): Promise<AiChatResult> {
      if (mock) {
        return delay({
          buttons: ['Self execute', 'Request field support', 'Request Tongqian Strategy', 'Manual review', 'Expert consultation'],
          confidence: 'high',
          message: {
            content: `M3.12 domestic AI mock handled ${messages.length} context messages for ${taskType}. Daily text uses qwen3-max, deep reasoning uses deepseek-reasoner. Suggested focus: cash flow, contract evidence chain, approval owner, and next action deadline.`,
            role: 'assistant',
          },
          tier: 2,
          traceId: cryptoRandomId(),
        });
      }
      const latest = messages.at(-1)?.content ?? '';
      const response = await unwrap<Record<string, unknown>>(
        await http.post('/ai/invoke', {
          input: {
            conversation: messages,
            message: latest,
          },
          taskType,
        }),
      );
      const data = (response.data && typeof response.data === 'object' ? response.data : response) as Record<string, unknown>;
      return {
        buttons: normalizeButtons(response.nextStepButtons ?? data.nextStepButtons),
        confidence: normalizeConfidence(response.confidence ?? data.confidence),
        message: {
          content: [
            normalizeText(data.answer ?? data.summary ?? data.message ?? response.fallbackText ?? latest),
            `免责声明：${normalizeText(response.disclaimer ?? data.disclaimer ?? 'AI 生成内容仅供经营决策参考。')}`,
            `Tier：${normalizeTier(response.tier ?? data.tier)} / traceId：${normalizeText(response.traceId ?? cryptoRandomId())}`,
          ].join('\n'),
          role: 'assistant',
        },
        tier: normalizeTier(response.tier ?? data.tier),
        traceId: normalizeText(response.traceId ?? cryptoRandomId()),
      };
    },
  };
}

function createChatHubApi(http: AxiosInstance, mock: boolean) {
  let conversation: ChatConversation | undefined;
  let messages: ChatMessage[] = [];
  return {
    async createConversation(title = 'AI conversation', channel: ChatConversation['channel'] = 'web'): Promise<ChatConversation> {
      if (mock) {
        conversation = { channel, id: cryptoRandomId(), lastAt: new Date().toISOString(), status: 'active', title };
        messages = [];
        return delay(conversation);
      }
      return unwrap(await http.post('/chat/conversations', { channel, title }));
    },
    async listConversations(): Promise<ChatConversation[]> {
      if (mock) return delay(conversation ? [conversation] : []);
      return unwrap(await http.get('/chat/conversations/me'));
    },
    async listMessages(conversationId: string): Promise<ChatMessage[]> {
      if (mock) return delay(conversation?.id === conversationId ? messages : []);
      return unwrap(await http.get(`/chat/conversations/${conversationId}/messages`));
    },
    async sendMessage(conversationId: string, content: string, channel: ChatConversation['channel'] = 'web'): Promise<ChatSendResult> {
      if (mock) {
        const now = new Date().toISOString();
        conversation = conversation ?? { channel, id: conversationId, lastAt: now, status: 'active', title: content.slice(0, 18) || 'AI conversation' };
        const userMessage: ChatMessage = { content, createdAt: now, id: cryptoRandomId(), intent: 'small_talk', role: 'user' };
        const assistantMessage: ChatMessage = {
          content: `已收到：${content}。建议先看现金流影响、合同证据链、审批责任人和本周截止动作。`,
          createdAt: new Date().toISOString(),
          id: cryptoRandomId(),
          intent: 'small_talk',
          role: 'assistant',
        };
        messages = [...messages, userMessage, assistantMessage];
        conversation = { ...conversation, lastAt: assistantMessage.createdAt };
        return delay({
          assistantMessage,
          conversation,
          dispatch: {
            followUpButtons: ['生成行动清单', '查看风险', '人工复核', '申请同乾方略', '继续追问'],
            redirectUrl: '/chat-hub',
            replyText: assistantMessage.content,
          },
          intent: 'small_talk',
          memory: { recentMessages: messages.slice(-6), summary: '最近对话围绕经营风险和下一步动作。' },
          userMessage,
        });
      }
      return unwrap(await http.post(`/chat/conversations/${conversationId}/messages`, { channel, content }));
    },
    async *stream(payload: Record<string, unknown>): AsyncGenerator<{ delta: string; traceId?: string }> {
      if (mock) {
        const traceId = cryptoRandomId();
        for (const delta of ['已读取上下文。', '正在拆解经营问题。', '建议形成正式任务。']) {
          yield { delta, traceId };
        }
        return;
      }
      const response = await unwrap<{ deltas: string[]; traceId?: string }>(await http.post('/chat/stream', payload));
      for (const delta of response.deltas) yield { delta, traceId: response.traceId };
    },
    async history(personaId: string): Promise<ChatMessage[]> {
      if (mock) return delay(messages.filter((item) => item.intent === personaId || personaId));
      return unwrap(await http.get('/chat/history', { params: { persona: personaId } }));
    },
    async saveHistory(personaId: string, nextMessages: ChatMessage[]): Promise<void> {
      if (mock) {
        messages = nextMessages.map((item) => ({ ...item, intent: personaId }));
        return delay(undefined);
      }
      return unwrap(await http.post('/chat/history', { messages: nextMessages, personaId }));
    },
    async convert(messageId: string, targetTask: 'dispatch' | 'report' | 'risk-review' | 'tender'): Promise<{ taskId: string }> {
      if (mock) return delay({ taskId: `${targetTask}-${messageId.slice(0, 8) || cryptoRandomId().slice(0, 8)}` });
      return unwrap(await http.post('/chat/convert', { messageId, targetTask }));
    },
  };
}

function createDispatchApi(http: AxiosInstance, mock: boolean) {
  return {
    async accept(id: string, agentId = 'agent-lv4-wuhan'): Promise<{ ok: true; traceId: string }> {
      if (mock) return delay({ ok: true, traceId: cryptoRandomId() });
      return unwrap(await http.post(`/dispatches/${id}/accept`, { agentId }));
    },
    async complete(id: string, rating: number, review: string): Promise<{ ok: true }> {
      if (mock) return delay({ ok: true });
      return unwrap(await http.post(`/dispatches/${id}/complete`, { rating, review }));
    },
    async confirm(id: string): Promise<{ ok: true }> {
      if (mock) return delay({ ok: true });
      return unwrap(await http.post(`/dispatches/${id}/confirm`));
    },
    async create(payload: Record<string, unknown>): Promise<{ dispatchId: string; traceId: string }> {
      if (mock) return delay({ dispatchId: 'disp-pending-001', traceId: cryptoRandomId() });
      return unwrap(await http.post('/dispatches', payload));
    },
    async get(id: string): Promise<DispatchDetail> {
      if (mock) return delay(dispatchDetailFixture(id));
      return unwrap(await http.get(`/dispatches/${id}`));
    },
    async list(role: 'agent' | 'owner', filters?: Record<string, unknown>): Promise<DispatchListItem[]> {
      if (mock) return delay(dispatchListFixture().filter((item) => !filters?.status || item.status === filters.status || role));
      return unwrap(await http.get('/dispatches', { params: { ...filters, role } }));
    },
    async quote(id: string, amount: string, note: string): Promise<{ ok: true; traceId: string }> {
      if (mock) return delay({ ok: true, traceId: cryptoRandomId() });
      return unwrap(await http.post(`/dispatches/${id}/quote`, { amount, note }));
    },
  };
}

function createCashflowApi(http: AxiosInstance, mock: boolean) {
  return {
    async generateReminder(receivableId: string, level: 'formal' | 'legal' | 'soft' = 'formal'): Promise<{ reminderId: string; traceId: string }> {
      if (mock) return delay({ reminderId: level === 'soft' ? 'rem-soft' : level === 'legal' ? 'rem-legal' : 'rem-formal', traceId: cryptoRandomId() });
      return unwrap(await http.post(`/cashflow/receivables/${receivableId}/reminders`, { level }));
    },
    async getReminder(id: string): Promise<ReminderDetail> {
      if (mock) return delay(reminderFixture(id));
      return unwrap(await http.get(`/cashflow/reminders/${id}`));
    },
    async investabilityCheck(): Promise<{ confidence: 'medium'; traceId: string }> {
      if (mock) return delay({ confidence: 'medium', traceId: cryptoRandomId() });
      return unwrap(await http.post('/cashflow/investability-check'));
    },
    async overview(): Promise<CashflowOverview> {
      if (mock) return delay(cashflowOverviewFixture());
      return unwrap(await http.get('/cashflow/overview'));
    },
    async receivables(filters?: Record<string, unknown>): Promise<Receivable[]> {
      if (mock) return delay(receivableFixtures().filter((row) => !filters?.riskLevel || row.riskLevel === filters.riskLevel));
      return unwrap(await http.get('/cashflow/receivables', { params: filters }));
    },
  };
}

function createProjectSiteApi(http: AxiosInstance, mock: boolean) {
  return {
    async aiSummarizeWeek(projectId: string): Promise<{ risks: string[]; summary: string; traceId: string }> {
      if (mock) return delay({ risks: ['雨季基坑排水', '材料到场滞后', '签证资料未闭合'], summary: `${projectId} 本周完成主体节点，需盯紧工期和回款证据链。`, traceId: cryptoRandomId() });
      return unwrap(await http.post(`/projects/${projectId}/ai-summary`));
    },
    async costAnalysis(projectId: string): Promise<{ items: Array<{ label: string; value: number }>; traceId: string }> {
      if (mock) return delay({ items: projectDetailFixture(projectId).costBreakdown, traceId: cryptoRandomId() });
      return unwrap(await http.get(`/projects/${projectId}/cost-analysis`));
    },
    async create(payload: Record<string, unknown>): Promise<{ projectId: string }> {
      if (mock) return delay({ projectId: 'proj-wuhan-metro' });
      return unwrap(await http.post('/projects', payload));
    },
    async drawingsList(projectId: string): Promise<ProjectDetail['drawings']> {
      if (mock) return delay(projectDetailFixture(projectId).drawings);
      return unwrap(await http.get(`/projects/${projectId}/drawings`));
    },
    async get(id: string): Promise<ProjectDetail> {
      if (mock) return delay(projectDetailFixture(id));
      return unwrap(await http.get(`/projects/${id}`));
    },
    async list(): Promise<ProjectListItem[]> {
      if (mock) return delay(projectFixtures());
      return unwrap(await http.get('/projects'));
    },
    async siteLogs(projectId: string): Promise<ProjectDetail['siteLogs']> {
      if (mock) return delay(projectDetailFixture(projectId).siteLogs);
      return unwrap(await http.get(`/projects/${projectId}/site-logs`));
    },
  };
}

function ownerDashboardFixture(): OwnerDashboardData {
  return {
    generatedAt: new Date().toISOString(),
    greeting: '早安，今天建议先看风险红灯，再处理机会窗口。',
    kpis: {
      approvals: { trend: '+3', value: 6 },
      credits: { trend: '-180', value: 8420 },
      opportunities: { trend: '+12%', value: 18 },
      riskRed: { trend: '+2', value: 4 },
    },
    opportunities: [
      { deadline: '今日 17:00', meta: '市政道路 / 3200 万 / 资质匹配 86%', title: '武汉东湖高新区道路改造施工总包' },
      { deadline: '明日 10:30', meta: '学校维修 / 860 万 / 现金流压力低', title: '黄陂区中小学暑期维修项目' },
      { deadline: '3 天后', meta: '园区厂房 / 5100 万 / 建议联合体', title: '鄂州临空经济区标准厂房二期' },
    ],
    reports: ['昨日合同审查发现 2 条付款节点后置风险。', '本周政策资金窗口新增 3 条。', '安全员证书 27 天后到期。'],
    risks: [
      { detail: '甲方审计后付款条款未限定审计期限。', level: 'red', title: '付款节点风险' },
      { detail: '履约证明缺少竣工验收页。', level: 'yellow', title: '标书资格风险' },
    ],
  };
}

function agentDashboardFixture(): AgentDashboardData {
  return {
    calendar: {
      days: Array.from({ length: 30 }, (_, index) => ({ amount: index % 5 === 0 ? 0 : 180 + index * 12, day: index + 1, settled: index < 18 })),
      total: 28600,
    },
    dispatch: { available: 12, urgent: 3 },
    level: 'LV4',
    monthCommission: 28600,
    nextLevelGap: 120,
    score: 880,
    scoreChanges: [
      { amount: 35, reason: '按时提交合同审查线下核验', type: 'plus' },
      { amount: -8, reason: '报价响应超时一次', type: 'minus' },
    ],
  };
}

function govDashboardFixture(): GovDashboardData {
  return {
    documents: [
      { due: '今日', title: '专项债项目入库请示' },
      { due: '本周五', title: '建筑业纾困政策解读稿' },
    ],
    fundMatches: [
      { amount: '1.2 亿', score: 91, title: '城市更新专项债储备项目' },
      { amount: '2800 万', score: 84, title: '绿色建造示范补贴' },
    ],
    subscriptions: [
      { level: '国家', title: '超长期特别国债项目申报窗口' },
      { level: '省级', title: '建筑业数字化转型试点' },
      { level: '市级', title: '中小企业稳岗补贴' },
    ],
  };
}

function adminDashboardFixture(): AdminDashboardData {
  return {
    aarrr: [
      { label: '访问', value: 12840 },
      { label: '激活', value: 3840 },
      { label: '留存', value: 2260 },
      { label: '收入', value: 680 },
      { label: '推荐', value: 312 },
    ],
    ai: { deepseek: 'deepseek-reasoner active', latencyMs: 1280, mockFallback: true, routeHealth: 'dashscope qwen3-max active / openrouter deprecated' },
    metrics: { dau: 1260, mau: 18200, wau: 6420 },
    redLines: [
      { code: 'BR-901', status: 'green', value: 'AI 成本率 7.8%' },
      { code: 'BR-903', status: 'yellow', value: '退款率 2.1%' },
    ],
  };
}

function riskReviewListFixture(): RiskReviewListItem[] {
  return [
    { amount: '5100 万元', counterparty: '鄂州临空园区', createdAt: '2026-05-20', id: 'demo-red', riskLevel: 'red', status: 'completed', title: '厂房二期总承包合同' },
    { amount: '2860 万元', counterparty: '武汉某建设单位', createdAt: '2026-05-21', id: 'demo-yellow', riskLevel: 'yellow', status: 'completed', title: '学校改造施工合同' },
    { amount: '860 万元', counterparty: '黄陂区教育局', createdAt: '2026-05-18', id: 'demo-green', riskLevel: 'green', status: 'completed', title: '暑期维修合同' },
    { amount: '1800 万元', counterparty: '湖北某投资公司', createdAt: '2026-05-17', id: 'demo-bridge', riskLevel: 'yellow', status: 'reviewing', title: '市政桥梁专业分包' },
    { amount: '320 万元', counterparty: '武汉某材料商', createdAt: '2026-05-15', id: 'demo-supply', riskLevel: 'green', status: 'queued', title: '钢材采购框架协议' },
  ];
}

function tenderListFixture(): TenderListItem[] {
  return [
    { amount: '3200 万元', deadline: '2026-06-02', id: 'demo-active', matchScore: 70, owner: '武汉东湖高新区', projectType: '市政道路', status: 'active', title: '高新区道路改造施工总包' },
    { amount: '860 万元', deadline: '2026-06-08', id: 'demo-perfect', matchScore: 95, owner: '黄陂区教育局', projectType: '学校维修', status: 'active', title: '中小学暑期维修项目' },
    { amount: '5100 万元', deadline: '2026-05-29', id: 'demo-risky', matchScore: 48, owner: '鄂州临空园区', projectType: '厂房建设', status: 'reviewing', title: '标准厂房二期施工' },
    { amount: '1800 万元', deadline: '2026-06-12', id: 'demo-bridge', matchScore: 82, owner: '湖北某投公司', projectType: '桥梁专业分包', status: 'completed', title: '市政桥梁专业分包' },
    { amount: '650 万元', deadline: '2026-06-16', id: 'demo-park', matchScore: 76, owner: '武汉某街道', projectType: '园林绿化', status: 'active', title: '口袋公园更新工程' },
  ];
}

function tenderDetailFixture(id: string): TenderDetail {
  const [tenderFallback] = tenderListFixture();
  const base = tenderListFixture().find((row) => row.id === id) ?? tenderFallback;
  if (!base) throw new Error('Tender fixture missing');
  const perfect = id === 'demo-perfect';
  const risky = id === 'demo-risky';
  return {
    ...base,
    confidence: perfect ? 'high' : 'medium',
    disclaimer: 'AI 解析内容仅供投标经营决策参考，不替代招标代理、律师或造价专业复核。',
    eligibility: ['企业资质', '安全生产许可证', '类似业绩', '项目经理', '技术负责人', '社保证明'].map((item, index) => ({ gap: index > 2 && !perfect ? '补齐原件扫描件与社保连续证明' : undefined, item, match: perfect || index < 4, ourStatus: perfect ? '已满足' : index < 4 ? '基本满足' : '待补充', required: '招标文件要求完整有效' })),
    keyPoints: ['项目背景：城市更新配套工程', '业主：政府平台公司', `金额：${base.amount}`, '工期：180 日历天', '评分项：技术 50 / 商务 30 / 价格 20', `关键时间：${base.deadline} 前递交`, risky ? '废标条款：人员证书原件缺失即否决' : '废标条款：按常规资格文件核验', '保证金：80 万元电子保函', '提交方式：电子标 + CA 签章', risky ? '风险提示：资质与业绩压力较高' : '风险提示：建议补齐业绩证明'],
    scorePrediction: { commercial: perfect ? 28 : risky ? 18 : 24, price: perfect ? 19 : 17, suggestions: ['补强类似业绩截图与合同关键页', '技术标突出进度、质量和安全响应', '报价前复核清单漏项'], technical: perfect ? 47 : risky ? 31 : 39 },
    tier: risky ? 3 : perfect ? 1 : 2,
    timeline: [
      { date: '2026-05-27', daysFromNow: 4, milestone: '报名截止' },
      { date: '2026-05-29', daysFromNow: 6, milestone: '答疑截止' },
      { date: base.deadline, daysFromNow: 10, milestone: '投标截止' },
      { date: '2026-06-03', daysFromNow: 11, milestone: '开标' },
      { date: '2026-06-06', daysFromNow: 14, milestone: '评标' },
    ],
    traceId: cryptoRandomId(),
  };
}

function opportunityListFixture(): OpportunityListItem[] {
  return [
    { amount: '3.2 亿元', deadline: '2026-06-06', id: 'opp-wuhan-metro', matchScore: 87, owner: '武汉地铁集团', region: '武汉', title: '武汉地铁 12 号线机电安装 EPC' },
    { amount: '8500 万元', deadline: '2026-06-12', id: 'opp-xian-soe', matchScore: 79, owner: '西安城投建设', region: '西安', title: '西安城投片区更新施工总承包' },
    { amount: '4600 万元', deadline: '2026-05-28', id: 'opp-risky', matchScore: 52, owner: '某园区开发公司', region: '鄂州', title: '园区标准厂房二期施工' },
  ];
}

function opportunityDetailFixture(id: string): OpportunityDetail {
  const [opportunityFallback] = opportunityListFixture();
  const base = opportunityListFixture().find((row) => row.id === id) ?? opportunityFallback;
  if (!base) throw new Error('Opportunity fixture missing');
  const risky = base.id === 'opp-risky';
  const xian = base.id === 'opp-xian-soe';
  return {
    ...base,
    confidence: risky ? 'low' : xian ? 'medium' : 'high',
    disclaimer: 'AI 生成内容仅供经营决策参考，不替代招标代理、律师、造价师或同乾方略人工复核。',
    ownerVerification: {
      businessInfo: risky ? '工商登记信息不完整，建议先核验股权与实控人。' : '工商状态正常，经营范围覆盖项目建设管理。',
      complaints: risky ? 7 : xian ? 2 : 0,
      creditCode: risky ? 'mock-credit-risky' : xian ? '91610100MA6XIAN00X' : '91420100MA4WUHAN00',
      historyProjects: risky ? 2 : xian ? 18 : 42,
      relatedCompanies: risky ? ['园区开发关联方', '贸易公司'] : xian ? ['西安城投子公司'] : ['武汉轨道交通建设公司', '武汉市政投资公司'],
      risk: risky ? 'high_risk' : xian ? 'warning' : 'pass',
    },
    peerRadar: {
      avgBid: risky ? '4380 万元' : xian ? '8120 万元' : '3.05 亿元',
      medianBid: risky ? '4210 万元' : xian ? '7980 万元' : '2.96 亿元',
      period: '近 6 个月',
      winners: risky ? 3 : xian ? 9 : 14,
    },
    recommendedPrice: {
      ceiling: risky ? '4320 万元' : xian ? '8280 万元' : '3.12 亿元',
      floor: risky ? '3980 万元' : xian ? '7780 万元' : '2.88 亿元',
      reasoning: risky ? '业主付款与投诉记录偏弱，建议降低资源投入并提高风险准备。' : '同类项目中标价集中，结合资质匹配与现金流压力建议贴近甜点价。',
      sweet: risky ? '4150 万元' : xian ? '8050 万元' : '3.02 亿元',
    },
    tier: risky ? 3 : xian ? 2 : 1,
    timeline: [
      { date: '2026-05-26', milestone: '报名截止' },
      { date: '2026-05-29', milestone: '答疑截止' },
      { date: base.deadline, milestone: '投标截止' },
      { date: '2026-06-08', milestone: '开标' },
    ],
    traceId: cryptoRandomId(),
  };
}

function reportListFixture(): ReportListItem[] {
  return [
    { createdAt: '2026-05-22', id: 'rep-contract-monthly', shared: true, status: 'completed', title: '合同审查月报', type: 'contract-monthly' },
    { createdAt: '2026-05-21', id: 'rep-tender-weekly', shared: false, status: 'completed', title: '招标参与周报', type: 'tender-weekly' },
    { createdAt: '2026-05-20', id: 'rep-kpi-weekly', shared: true, status: 'completed', title: '经营 KPI 周报', type: 'kpi-weekly' },
    { createdAt: '2026-05-19', id: 'rep-qualification-monthly', shared: false, status: 'reviewing', title: '资质合规月报', type: 'qualification-monthly' },
    { createdAt: '2026-05-18', id: 'rep-ai-cost-weekly', shared: false, status: 'generating', title: 'AI 调用周报', type: 'ai-cost-weekly' },
  ];
}

function reportDetailFixture(id: string): ReportDetail {
  const [reportFallback] = reportListFixture();
  const base = reportListFixture().find((row) => row.id === id) ?? reportFallback;
  if (!base) throw new Error('Report fixture missing');
  return {
    ...base,
    coBrand: { clientName: '湖北某建设有限公司', tongqian: true },
    confidence: base.type === 'kpi-weekly' ? 'high' : 'medium',
    dateRange: { from: '2026-05-01', to: '2026-05-22' },
    disclaimer: 'AI 报告仅供经营决策参考，不构成法律、招投标、财务或资质审批承诺；重大事项请结合原始材料与人工复核。',
    findings: [
      { detail: '3 份合同的付款节点缺少验收确认期限，建议先补充逾期视为认可条款。', level: 'red', title: '付款节点后置' },
      { detail: '本周投标项目中 2 个需要补齐类似业绩截图与竣工验收页。', level: 'yellow', title: '投标证据链不足' },
      { detail: '安全生产许可证与两名人员证书进入 90 天预警窗口。', level: 'yellow', title: '资质到期预警' },
      { detail: '经营机会命中率较上周提升，武汉和西安两地匹配度最高。', level: 'green', title: '机会雷达提升' },
      { detail: 'AI 调用成本率保持在红线内，DeepSeek 与 Qwen 路由稳定。', level: 'green', title: 'AI 成本可控' },
    ],
    h5Url: `mock://oss/reports/${base.id}.h5?ttl=3600`,
    pdfUrl: `mock://oss/reports/${base.id}.pdf?ttl=3600`,
    tier: base.type === 'contract-monthly' ? 2 : 1,
    traceId: cryptoRandomId(),
  };
}

function qualificationCertFixture(): QualificationCert[] {
  return [
    { category: '施工总承包', daysToExpiry: 28, expiresAt: '2026-06-20', id: 'qual-upgrade-easy', issuedAt: '2023-06-20', level: '建筑工程二级', name: '建筑工程施工总承包', riskLevel: 'red' },
    { category: '专业承包', daysToExpiry: 58, expiresAt: '2026-07-18', id: 'qual-upgrade-hard', issuedAt: '2022-07-18', level: '市政公用工程二级', name: '市政公用工程施工', riskLevel: 'yellow' },
    { category: '安全许可', daysToExpiry: 86, expiresAt: '2026-08-15', id: 'qual-safety', issuedAt: '2023-08-15', level: '有效', name: '安全生产许可证', riskLevel: 'yellow' },
    { category: '专业承包', daysToExpiry: 220, expiresAt: '2026-12-29', id: 'qual-upgrade-impossible', issuedAt: '2021-12-29', level: '钢结构三级', name: '钢结构工程专业承包', riskLevel: 'green' },
    { category: '劳务', daysToExpiry: 360, expiresAt: '2027-05-18', id: 'qual-labor', issuedAt: '2024-05-18', level: '备案制', name: '施工劳务备案', riskLevel: 'green' },
  ];
}

function qualificationCheckupFixture(): QualificationCheckupReport {
  return {
    confidence: 'medium',
    disclaimer: 'AI 体检仅供资质经营管理参考，最终申报口径请以主管部门和人工复核为准。',
    expiring: qualificationCertFixture().slice(0, 3),
    gaps: [
      { area: '业绩归档', description: '部分合同缺竣工验收页和中标通知书。', suggestion: '按资质类别建立业绩证据包。' },
      { area: '人员社保', description: '两名关键人员社保连续性不足。', suggestion: '补齐近 6 个月社保和劳动合同。' },
      { area: '设备清单', description: '自有设备发票与台账未绑定。', suggestion: '补设备编号、发票和照片。' },
      { area: '净资产', description: '最近一期报表净资产仍有缺口。', suggestion: '先做审计口径测算再申报。' },
    ],
    overallScore: 78,
    tier: 2,
    traceId: cryptoRandomId(),
    upgradable: [
      { from: '建筑工程二级', potential: 82, to: '一级' },
      { from: '市政公用工程二级', potential: 71, to: '一级' },
      { from: '钢结构三级', potential: 46, to: '二级' },
    ],
  };
}

function upgradePathFixture(certId: string, targetLevel: string): UpgradePathReport {
  const hard = certId === 'qual-upgrade-hard';
  const impossible = certId === 'qual-upgrade-impossible';
  return {
    confidence: impossible ? 'low' : 'medium',
    current: hard ? '市政公用工程二级' : impossible ? '钢结构三级' : '建筑工程二级',
    disclaimer: '升级路径由 AI 基于台账与规则生成，仅供经营决策参考。',
    estimatedMonths: impossible ? 18 : hard ? 9 : 4,
    gaps: [
      { current: '3 个项目', dimension: '业绩差距', missing: '缺 2 个', required: '5 个 ≥1000 万项目' },
      { current: '一建 4 人', dimension: '人员差距', missing: hard ? '缺 3 人' : '缺 1 人', required: '技术负责人 / 一级建造师 / 工程师' },
      { current: '台账不完整', dimension: '设备差距', missing: '缺发票绑定', required: '自有施工设备清单' },
      { current: hard ? '3800 万' : '4200 万', dimension: '净资产差距', missing: hard ? '缺 1200 万' : '缺 800 万', required: '≥5000 万' },
    ],
    recommendedRoute: impossible ? '横向扩展' : hard ? '借资质' : '硬升',
    routes: [
      { description: '自补业绩、人员和净资产，周期最长但沉淀资产。', name: '硬升' },
      { description: '通过收购或合作缩短周期，需重点看债务与诉讼。', name: '收购' },
      { description: '短期联合投标或资源合作，适合窗口期项目。', name: '借资质' },
    ],
    target: targetLevel,
    tier: impossible ? 3 : hard ? 2 : 1,
    traceId: cryptoRandomId(),
  };
}

function riskReviewDetailFixture(id: string): RiskReviewDetail {
  const reviewFallback = riskReviewListFixture()[1] ?? riskReviewListFixture()[0];
  const base = riskReviewListFixture().find((row) => row.id === id) ?? reviewFallback;
  if (!base) throw new Error('Risk review fixture missing');
  const red = id === 'demo-red';
  const green = id === 'demo-green';
  const levels: Array<'green' | 'red' | 'yellow'> = red ? ['red', 'red', 'red', 'red', 'red'] : green ? ['yellow', 'green', 'green', 'green', 'green'] : ['red', 'red', 'yellow', 'yellow', 'yellow'];
  const impacts = ['付款节点未限定审计周期，可能拉长现金回款。', '违约金上限不清，可能形成单方加重责任。', '变更签证证据链不足，结算时容易被压价。', '工期顺延触发条件表述较窄。', '争议管辖地点增加维权成本。'];
  const types = ['付款风险', '违约责任', '结算风险', '履约保护', '诉讼成本'];
  return {
    ...base,
    confidence: green ? 'high' : 'medium',
    disclaimer: 'AI 生成内容仅供经营决策参考，不构成法律、财务或招投标承诺；重大签约请结合原合同与人工复核。',
    findings: levels.map((level, index) => ({
      clause: `合同第 ${index + 3} 条`,
      id: `${base.id}-finding-${index + 1}`,
      impact: impacts[index] ?? impacts[0] ?? '',
      level,
      standardWording: '建议写明资料提交、确认期限、逾期视为认可、争议处理和证据形式。',
      suggestion: '先补齐期限、责任上限、签证材料和复核节点，再进入盖章流程。',
      type: types[index] ?? types[0] ?? '',
    })),
    tier: red ? 3 : green ? 1 : 2,
    traceId: cryptoRandomId(),
  };
}

function dispatchListFixture(): DispatchListItem[] {
  return [
    { id: 'disp-pending-001', type: '资质代办', status: 'pending', amount: '预算 ¥4,000', createdAt: '2026-05-23 09:20', protectionExpireAt: '2026-05-30', matchScore: 92 },
    { id: 'disp-progress-002', type: '标书代写', status: 'in_progress', agent: { id: 'agent-lv4-wuhan', name: '武汉金牌管家', level: 'LV4', reputation: 96 }, amount: '¥8,800', createdAt: '2026-05-22 14:10', matchScore: 88 },
    { id: 'disp-completed-003', type: '应收催收', status: 'completed', agent: { id: 'agent-lv3-fin', name: '金融资深管家', level: 'LV3', reputation: 91 }, amount: '¥6,000', createdAt: '2026-05-18 11:40', matchScore: 84 },
  ];
}

function dispatchDetailFixture(id: string): DispatchDetail {
  const [dispatchFallback] = dispatchListFixture();
  const base = dispatchListFixture().find((item) => item.id === id) ?? dispatchFallback;
  if (!base) throw new Error('Dispatch fixture missing');
  return {
    ...base,
    budget: base.amount ?? '¥5,000',
    description: '客户需要智能管家线下跑窗口、协调材料补正，并在失败时给出兜底路径。',
    expectedDate: '2026-06-05',
    messages: [
      { from: 'owner', content: '请先确认能否本周去窗口核验材料。', at: '09:30' },
      { from: 'agent', content: '已收到，今天先看清单，明天上午到场。', at: '09:42' },
    ],
    rating: base.status === 'completed' ? 5 : undefined,
    review: base.status === 'completed' ? '响应快，窗口材料一次补齐。' : undefined,
    timeline: ['发起', '接单', '报价确认', '服务中', '完成'].map((milestone, index) => ({
      date: `05-${23 + index}`,
      milestone,
      status: index < 3 || base.status === 'completed' ? 'done' : 'pending',
    })),
  };
}

function cashflowOverviewFixture(): CashflowOverview {
  return {
    alerts: [
      { type: '90 天逾期', message: '华中城建 186 万进入红灯催收。', level: 'red' },
      { type: '融资窗口', message: '可用应收池超过 500 万，建议做融资诊断。', level: 'yellow' },
    ],
    cashGap: '¥320 万',
    financingCapacity: '¥680 万',
    forecast: { day30: '+¥120 万', day60: '-¥80 万', day90: '-¥320 万' },
    overdue90: '¥186 万',
    totalReceivable: '¥1,248 万',
  };
}

function receivableFixtures(): Receivable[] {
  return [
    { id: 'ar-wuhan-001', client: '华中城建集团', project: '东湖道路改造', amount: '¥186 万', aging: 126, riskLevel: 'red', status: 'collecting' },
    { id: 'ar-ezhou-002', client: '鄂州临空公司', project: '标准厂房二期', amount: '¥320 万', aging: 78, riskLevel: 'yellow', status: 'active' },
    { id: 'ar-huangpi-003', client: '黄陂教育局', project: '暑期维修', amount: '¥96 万', aging: 42, riskLevel: 'green', status: 'active' },
  ];
}

function reminderFixture(id: string): ReminderDetail {
  const level = id.includes('legal') ? 'legal' : id.includes('soft') ? 'soft' : 'formal';
  const receivable = receivableFixtures()[level === 'soft' ? 2 : 0] ?? receivableFixtures()[0];
  if (!receivable) throw new Error('Receivable fixture missing');
  return {
    body: `# ${level === 'legal' ? '律师函级催款函' : level === 'soft' ? '温和提醒函' : '正式催款函'}\n\n贵司 ${receivable.project} 项目应付款 ${receivable.amount} 已逾期 ${receivable.aging} 天。建议在三个工作日内确认付款计划，并补齐对账单、验收单与付款审批节点。`,
    confidence: 'medium',
    disclaimer: '本催款函由 AI 根据台账生成，仅供经营和法务沟通参考，正式发函前建议人工复核。',
    id,
    level,
    receivable,
    tier: level === 'legal' ? 3 : 2,
    traceId: cryptoRandomId(),
  };
}

function projectFixtures(): ProjectListItem[] {
  return [
    { id: 'proj-wuhan-metro', name: '武汉地铁站点配套工程', client: '武汉轨道集团', amount: '¥5,200 万', progress: 62, riskLevel: 'yellow', pm: '周经理' },
    { id: 'proj-completed', name: '黄陂学校暑修项目', client: '黄陂教育局', amount: '¥860 万', progress: 100, riskLevel: 'green', pm: '李经理' },
    { id: 'proj-stalled', name: '鄂州标准厂房三期', client: '鄂州临空公司', amount: '¥4,100 万', progress: 38, riskLevel: 'red', pm: '陈经理' },
  ];
}

function projectDetailFixture(id: string): ProjectDetail {
  const [projectFallback] = projectFixtures();
  const base = projectFixtures().find((item) => item.id === id) ?? projectFallback;
  if (!base) throw new Error('Project fixture missing');
  return {
    ...base,
    costBreakdown: [
      { label: '材料', value: 46 },
      { label: '人工', value: 24 },
      { label: '机械', value: 12 },
      { label: '分包', value: 18 },
    ],
    drawings: [
      { id: 'dwg-01', name: '总平面图', version: 'V3' },
      { id: 'dwg-02', name: '机电综合图', version: 'V2' },
    ],
    endDate: '2026-12-20',
    kpis: { collected: 46, completed: base.progress, costVariance: base.riskLevel === 'red' ? 12 : 4, scheduleVariance: base.riskLevel === 'green' ? -2 : 8 },
    risks: [
      { level: 'yellow', title: '雨季施工影响土方外运' },
      { level: 'red', title: '甲供材料到场晚于计划' },
      { level: 'green', title: '安全晨会记录完整' },
    ],
    siteLogs: [
      { at: '05-20', weather: '小雨', content: '完成二区模板加固，监理抽查合格。' },
      { at: '05-21', weather: '多云', content: '钢筋班组进场 24 人，材料复检完成。' },
      { at: '05-22', weather: '晴', content: '机电预留洞口复核，发现 2 处碰撞。' },
    ],
    startDate: '2026-03-01',
    tier: base.riskLevel === 'red' ? 3 : 2,
  };
}

async function unwrap<T>(response: AxiosResponse<ApiEnvelope<T>>): Promise<T> {
  return response.data.data;
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), 180));
}

function readBrowserToken(): string | undefined {
  return readBrowserValue('tongqian.jwt');
}

function resolveUnauthorizedLoginHref(): string {
  const current = `${window.location.pathname}${window.location.search}`;
  if (window.location.pathname.endsWith('/login')) return window.location.pathname;
  const next = encodeURIComponent(current);
  if (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/')) {
    return `/Boss/login?role=admin&next=${next}`;
  }
  if (window.location.pathname === '/agent' || window.location.pathname.startsWith('/agent/')) {
    return `/Boss/login?role=agent&next=${next}`;
  }
  if (window.location.pathname === '/gov' || window.location.pathname.startsWith('/gov/')) {
    return `/Boss/login?role=gov&next=${next}`;
  }
  return `/Boss/login?next=${next}`;
}

function readBrowserValue(key: string): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.localStorage.getItem(key) ?? undefined;
}

function cryptoRandomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `trace-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function buildAdminModuleFixture(slug: string): AdminModuleSummary {
  return {
    alerts: [
      { level: 'success', message: `${slug} mock API is connected.` },
      { level: 'warning', message: 'High-risk actions require platform-owner secondary confirmation.' },
    ],
    rows: [
      { item: `${slug} approval flow`, next: 'write audit_log', owner: 'platform-owner', status: 'active', updatedAt: '2026-05-20 10:10' },
      { item: `${slug} hot update`, next: 'refresh system_configs', owner: 'ops-admin', status: 'processing', updatedAt: '2026-05-20 10:20' },
      { item: `${slug} rollback checkpoint`, next: 'keep before/after snapshot', owner: 'audit-bot', status: 'completed', updatedAt: '2026-05-20 10:30' },
    ],
    stats: [
      { label: 'Changes today', trend: 'mock API', value: '18' },
      { label: 'Pending approvals', trend: 'platform-owner', value: '7' },
      { label: 'Critical alerts', trend: 'no red-line trigger', value: '0' },
    ],
    workflow: ['Read list', 'Submit approval', 'Write audit log', 'Hot update or rollback'],
  };
}

function normalizeButtons(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (item && typeof item === 'object') {
          const record = item as Record<string, unknown>;
          return String(record.i18nKey ?? record.action ?? '下一步');
        }
        return String(item);
      })
      .slice(0, 5);
  }
  return ['自己执行', '申请智能管家', '申请同乾方略', '人工复核', '专家咨询'];
}

function normalizeConfidence(value: unknown): AiChatResult['confidence'] {
  return value === 'low' || value === 'medium' || value === 'high' ? value : 'medium';
}

function normalizeText(value: unknown): string {
  return typeof value === 'string' && value.trim() ? value : 'AI 已完成分析，请结合业务上下文复核后执行。';
}

function normalizeTier(value: unknown): AiChatResult['tier'] {
  return value === 1 || value === 2 || value === 3 || value === 4 ? value : 2;
}

function createOwnerRiskApi(http: AxiosInstance, mock: boolean) {
  return {
    async listProfiles(page = 1, pageSize = 20): Promise<OwnerRiskProfileView[]> {
      if (mock) {
        return delay([
          { id: '1', tenantId: 'mock-tenant', userId: 'mock-user', ownerName: '张明', creditCode: '91110000******82X', overallRiskLevel: 'medium', riskScore: 58, createdAt: '2026-06-01T00:00:00.000Z', updatedAt: '2026-06-01T00:00:00.000Z' },
          { id: '2', tenantId: 'mock-tenant', userId: 'mock-user', ownerName: '李华', creditCode: '91310000******15K', overallRiskLevel: 'high', riskScore: 76, createdAt: '2026-06-02T00:00:00.000Z', updatedAt: '2026-06-02T00:00:00.000Z' },
          { id: '3', tenantId: 'mock-tenant', userId: 'mock-user', ownerName: '王强', creditCode: '92440000******33A', overallRiskLevel: 'low', riskScore: 32, createdAt: '2026-06-01T00:00:00.000Z', updatedAt: '2026-06-01T00:00:00.000Z' },
        ]);
      }
      return unwrap(await http.get('/owner-risk/profiles', { params: { page, pageSize } }));
    },

    async createProfile(payload: { ownerName: string; idCardMasked?: string; creditCode?: string }): Promise<OwnerRiskProfileView> {
      if (mock) {
        return delay({
          id: cryptoRandomId(),
          tenantId: 'mock-tenant',
          userId: 'mock-user',
          ownerName: payload.ownerName,
          creditCode: payload.creditCode,
          overallRiskLevel: 'medium',
          riskScore: 60,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      return unwrap(await http.post('/owner-risk/profiles', payload));
    },

    async getProfile(id: string): Promise<OwnerRiskProfileView> {
      if (mock) {
        return delay({ id, tenantId: 'mock-tenant', userId: 'mock-user', ownerName: '张明', creditCode: '91110000******82X', overallRiskLevel: 'medium', riskScore: 58, createdAt: '2026-06-01T00:00:00.000Z', updatedAt: '2026-06-01T00:00:00.000Z' });
      }
      return unwrap(await http.get(`/owner-risk/profiles/${id}`));
    },

    async listCards(profileId?: string): Promise<OwnerRiskCardView[]> {
      if (mock) {
        return delay([
          { id: '1', profileId: profileId || '1', tenantId: 'mock-tenant', cardType: 'guarantee', title: '担保总览', riskLevel: 'medium', isUnlocked: true, unlockCredits: 50, summary: '担保总额 5000 万，涉及 3 家企业', createdAt: '2026-06-01T00:00:00.000Z' },
          { id: '2', profileId: profileId || '1', tenantId: 'mock-tenant', cardType: 'mixing', title: '混同风险', riskLevel: 'high', isUnlocked: false, unlockCredits: 50, summary: '存在资金混同嫌疑', createdAt: '2026-06-01T00:00:00.000Z' },
          { id: '3', profileId: profileId || '1', tenantId: 'mock-tenant', cardType: 'counterparty', title: '交易对手风险', riskLevel: 'medium', isUnlocked: true, unlockCredits: 50, summary: '涉及 5 家供应商， 2 家有风险记录', createdAt: '2026-06-01T00:00:00.000Z' },
          { id: '4', profileId: profileId || '1', tenantId: 'mock-tenant', cardType: 'receivable', title: '应收账款账龄', riskLevel: 'low', isUnlocked: true, unlockCredits: 50, summary: '90 天以上应收 200 万', createdAt: '2026-06-01T00:00:00.000Z' },
        ]);
      }
      return unwrap(await http.get('/owner-risk/cards'));
    },

    async listGuaranteeRecords(profileId: string): Promise<OwnerRiskGuaranteeRecord[]> {
      if (mock) {
        return delay([
          { id: '1', guaranteedCompany: '北京某建筑公司', guaranteeAmount: 20000000, guaranteeType: '连带责任担保', status: 'active', riskLevel: 'medium', endDate: '2027-06-01' },
          { id: '2', guaranteedCompany: '上海某贸易公司', guaranteeAmount: 15000000, guaranteeType: '抵押担保', status: 'active', riskLevel: 'low', endDate: '2026-12-31' },
          { id: '3', guaranteedCompany: '深圳某地产公司', guaranteeAmount: 15000000, guaranteeType: '质押担保', status: 'released', riskLevel: 'low' },
        ]);
      }
      return unwrap(await http.get(`/owner-risk/profiles/${profileId}/guarantees`));
    },

    async listMixingRecords(profileId: string): Promise<OwnerRiskMixingRecord[]> {
      if (mock) {
        return delay([
          { id: '1', summary: '企业主个人关联账户频繁往来往公户注入大额资金', recordType: 'personal_to_corporate', riskLevel: 'high', occurrences: 12, createdAt: '2026-06-01' },
          { id: '2', summary: '报销票据包含家庭奢侈消费和非商务餐费记录', recordType: 'expense_mixing', riskLevel: 'medium', occurrences: 4, createdAt: '2026-05-25' },
        ]);
      }
      return unwrap(await http.get(`/owner-risk/profiles/${profileId}/mixing`));
    },

    async listCounterpartyWatchlist(): Promise<OwnerRiskCounterpartyRecord[]> {
      if (mock) {
        return delay([
          { id: '1', companyName: '大连某钢铁物资商行', associationType: 'supplier', watchlistReason: '司法失信被执行人', riskLevel: 'high', createdAt: '2026-06-01' },
          { id: '2', companyName: '河北某混凝土有限公司', associationType: 'supplier', watchlistReason: '股权多重质押与限制消费令', riskLevel: 'medium', createdAt: '2026-05-29' },
          { id: '3', companyName: '南京某机械租赁部', associationType: 'customer', watchlistReason: '正常关联合作方', riskLevel: 'low', createdAt: '2026-06-02' },
        ]);
      }
      return unwrap(await http.get('/owner-risk/counterparties'));
    },

    async listReceivableRecords(profileId: string): Promise<OwnerRiskReceivableRecord[]> {
      if (mock) {
        return delay([
          { id: '1', debtorName: '中建某工程局分公司', overdueAmount: 1200000, agingDays: 120, recoveryProbability: 0.85, riskLevel: 'low', isGuaranteed: true },
          { id: '2', debtorName: '某地方城投建设开发公司', overdueAmount: 800000, agingDays: 180, recoveryProbability: 0.65, riskLevel: 'medium', isGuaranteed: false },
        ]);
      }
      return unwrap(await http.get(`/owner-risk/profiles/${profileId}/receivables`));
    },

    async listReports(profileId: string): Promise<OwnerRiskReportView[]> {
      if (mock) {
        return delay([
          { id: '1', profileId, tenantId: 'mock-tenant', userId: 'mock-user', title: '张明 - 综合风险报告', reportType: 'overview', riskLevel: 'high', tierBadge: 3, confidence: 'high', createdAt: '2026-06-01T00:00:00.000Z', executiveSummary: '摘要', creditsCost: 50, disclaimer: 'AI免责' },
          { id: '2', profileId, tenantId: 'mock-tenant', userId: 'mock-user', title: '张明 - 担保分析报告', reportType: 'guarantee', riskLevel: 'medium', tierBadge: 3, confidence: 'high', createdAt: '2026-05-28T00:00:00.000Z', executiveSummary: '摘要', creditsCost: 50, disclaimer: 'AI免责' },
        ]);
      }
      return unwrap(await http.get(`/owner-risk/profiles/${profileId}/reports`));
    },

    async getReport(id: string): Promise<OwnerRiskReportView> {
      if (mock) {
        return delay({
          id,
          profileId: '1',
          tenantId: 'mock-tenant',
          userId: 'mock-user',
          title: '张明 - 企业主综合风险深度研判报告',
          reportType: 'overview',
          riskLevel: 'high',
          tierBadge: 3,
          confidence: 'high',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          executiveSummary: '经系统全要素深度审计，该企业主在个人关联担保与交易对手合规层面存在一定的高危风险积聚。建议立即开展专家复核和专项债务防火墙切割。',
          creditsCost: 50,
          disclaimer: '本报告内容基于公开和授权数据经 AI 生成，仅供商业决策参考，不构成正式法律或审计意见。',
          dataSnapshot: {
            score: 72,
            activeGuaranteesCount: 3,
            mixingAlertsCount: 2,
            watchlistHitsCount: 1,
            agedReceivablesOver90d: 2000000,
          },
          sections: [
            {
              sectionKey: 'guarantees',
              title: '关联担保与代偿风险审计',
              content: '该企业主对外累计担保总额达 5000 万元。其中 2 笔担保（约 2000 万元）的被担保方出现诉讼及财务恶化，存在连带代偿风险。',
              riskLevel: 'high',
              tierBadge: 3,
              confidence: 'high',
              suggestedActions: ['核实代偿协议条款', '启动反担保资产抵押登记', '准备应急流动性']
            },
            {
              sectionKey: 'mixing',
              title: '个人与法人财务/资产混同审查',
              content: '检测到 2 处明显的混同疑点：一是企业主名下个人账户频繁与企业公户发生无贸易背景的资金大额往来；二是部分家庭成员消费发票在企业进行报销。可能导致人格混同及连带无限债务。',
              riskLevel: 'high',
              tierBadge: 3,
              confidence: 'medium',
              suggestedActions: ['立即清退不合规往来挂账', '重新规范报销审批流']
            },
            {
              sectionKey: 'counterparties',
              title: '交易对手与供应链合规扫描',
              content: '深度关联发现，上下游合作方中有 2 家被列入失信被执行人、限制高消费名单。这可能对项目合同的回款和垫资安全构成威胁。',
              riskLevel: 'medium',
              tierBadge: 2,
              confidence: 'high',
              suggestedActions: ['调整结算账期', '增设履约保证保险']
            },
            {
              sectionKey: 'receivables',
              title: '应收账款账龄与回款坏账概率推演',
              content: '当前超 90 定以上应收账款达 200 万元。模型推演其最终坏账概率在 15% 左右，可能会阶段性影响现金流。',
              riskLevel: 'low',
              tierBadge: 2,
              confidence: 'high',
              suggestedActions: ['委派法务专员发送律师函催收', '考虑应收账款无追索权保理']
            }
          ]
        });
      }
      return unwrap(await http.get(`/owner-risk/reports/${id}`));
    },

    async createReport(profileId: string, payload: { reportType: string }): Promise<OwnerRiskReportView> {
      if (mock) {
        const newId = cryptoRandomId();
        return delay({
          id: newId,
          profileId,
          tenantId: 'mock-tenant',
          userId: 'mock-user',
          title: `专项风险报告 - ${payload.reportType}`,
          reportType: payload.reportType,
          riskLevel: 'medium',
          tierBadge: 2,
          confidence: 'high',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          executiveSummary: 'AI专项分析启动成功，数据就绪。',
          creditsCost: 50,
          disclaimer: 'AI免责',
        });
      }
      return unwrap(await http.post(`/owner-risk/profiles/${profileId}/reports`, payload));
    },

    async createReviewRequest(payload: { profileId: string; reviewType: string }): Promise<OwnerRiskReviewRequestView> {
      if (mock) {
        return delay({
          id: cryptoRandomId(),
          profileId: payload.profileId,
          tenantId: 'mock-tenant',
          userId: 'mock-user',
          reviewType: payload.reviewType,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      return unwrap(await http.post('/owner-risk/reviews', payload));
    },

    async listReviewRequests(): Promise<OwnerRiskReviewRequestView[]> {
      if (mock) {
        return delay([
          { id: '1', profileId: '1', tenantId: 'mock-tenant', userId: 'mock-user', reviewType: 'manual_review', status: 'pending', createdAt: '2026-06-01T00:00:00.000Z', updatedAt: '2026-06-01T00:00:00.000Z' }
        ]);
      }
      return unwrap(await http.get('/owner-risk/reviews'));
    },

    async listUnlockLogs(): Promise<OwnerRiskUnlockLogView[]> {
      if (mock) {
        return delay([]);
      }
      return unwrap(await http.get('/owner-risk/unlock-logs'));
    },

    async listGenerationLogs(): Promise<OwnerRiskGenerationLogView[]> {
      if (mock) {
        return delay([]);
      }
      return unwrap(await http.get('/owner-risk/generation-logs'));
    },

    async generateAnalysis(profileId: string, payload: { analysisType: string }): Promise<{ taskId: string }> {
      if (mock) {
        return delay({ taskId: cryptoRandomId() });
      }
      return unwrap(await http.post(`/owner-risk/profiles/${profileId}/analyze`, payload));
    },

    async unlockCard(cardId: string): Promise<OwnerRiskCardView> {
      if (mock) {
        return delay({ id: cardId, profileId: '1', tenantId: 'mock-tenant', cardType: 'mixing', title: '混同风险', riskLevel: 'high', isUnlocked: true, unlockCredits: 50, summary: '存在资金混同嫌疑', createdAt: '2026-06-01T00:00:00.000Z' });
      }
      return unwrap(await http.post(`/owner-risk/cards/${cardId}/unlock`));
    },
  };
}

function createMarketSituationApi(http: AxiosInstance, mock: boolean) {
  const mockSignals: MarketSignalView[] = [
    {
      id: '1',
      tenantId: 'mock-tenant',
      userId: 'mock-user',
      signalType: 'project_hot',
      title: '某市政道路项目即将招标',
      summary: '某市中心道路改造项目预计下月招标，总投资约 2 亿元。',
      region: '武汉',
      riskLevel: 'low',
      opportunityLevel: 'high',
      confidence: 'high',
      isPublished: true,
      isFeatured: true,
      tierBadge: 1,
      unlockCredits: 50,
      viewCount: 150,
      feedbackCount: 2,
      tags: ['市政', '道路', '招标'],
      publishedAt: '2026-06-01T08:00:00.000Z',
      createdAt: '2026-06-01T08:00:00.000Z',
      updatedAt: '2026-06-01T08:00:00.000Z',
      unlockedParts: ['impact_analysis'],
    },
    {
      id: '2',
      tenantId: 'mock-tenant',
      userId: 'mock-user',
      signalType: 'qualification_dynamic',
      title: '某供应商被列入经营异常',
      summary: '某长期合作供应商被市场监管部门列入经营异常名录。',
      region: '全国',
      riskLevel: 'high',
      opportunityLevel: 'low',
      confidence: 'medium',
      isPublished: true,
      isFeatured: false,
      tierBadge: 2,
      unlockCredits: 100,
      viewCount: 85,
      feedbackCount: 0,
      tags: ['供应商', '风险'],
      publishedAt: '2026-05-28T10:00:00.000Z',
      createdAt: '2026-05-28T10:00:00.000Z',
      updatedAt: '2026-05-28T10:00:00.000Z',
      unlockedParts: [],
    },
    {
      id: '3',
      tenantId: 'mock-tenant',
      userId: 'mock-user',
      signalType: 'competitor_active',
      title: '竞争对手近期连续中标',
      summary: '某竞争对手在过去两周内连续中标 3 个项目。',
      region: '华东',
      riskLevel: 'medium',
      opportunityLevel: 'medium',
      confidence: 'high',
      isPublished: true,
      isFeatured: false,
      tierBadge: 3,
      unlockCredits: 80,
      viewCount: 210,
      feedbackCount: 5,
      tags: ['竞争对手', '中标'],
      publishedAt: '2026-05-25T14:30:00.000Z',
      createdAt: '2026-05-25T14:30:00.000Z',
      updatedAt: '2026-05-25T14:30:00.000Z',
      unlockedParts: ['impact_analysis', 'simulation'],
    },
    {
      id: '4',
      tenantId: 'mock-tenant',
      userId: 'mock-user',
      signalType: 'policy_window',
      title: '住建部发布新型建材政策',
      summary: '住建部发布关于推广新型绿色建材的指导意见。',
      region: '全国',
      riskLevel: 'low',
      opportunityLevel: 'high',
      confidence: 'high',
      isPublished: true,
      isFeatured: true,
      tierBadge: 4,
      unlockCredits: 60,
      viewCount: 135,
      feedbackCount: 1,
      tags: ['政策', '建材'],
      publishedAt: '2026-05-20T09:15:00.000Z',
      createdAt: '2026-05-20T09:15:00.000Z',
      updatedAt: '2026-05-20T09:15:00.000Z',
      unlockedParts: ['impact_analysis', 'simulation', 'report', 'full'],
    },
  ];

  const mockSimulations: MarketSignalSimulationView[] = [
    {
      id: 'sim-1',
      signalId: '1',
      tenantId: 'mock-tenant',
      userId: 'mock-user',
      simulationType: 'project_participation',
      inputParams: { targetMargin: 0.08, partnerCount: 2 },
      simulationResult: { successRate: 0.75, marginRange: '6% - 9%', actionRecommendation: '建议以联合体形式参与' },
      confidence: 'high',
      tierBadge: 2,
      creditsCost: 50,
      createdAt: '2026-06-02T10:00:00.000Z',
    },
  ];

  const mockReports: MarketSignalReportView[] = [
    {
      id: 'rep-1',
      signalId: '1',
      tenantId: 'mock-tenant',
      userId: 'mock-user',
      reportType: 'situation_summary',
      title: '某市政道路项目即将招标分析报告',
      tierBadge: 1,
      confidence: 'high',
      executiveSummary: '基于本项目即将招标的预警信号，进行了专项业务推演和资质匹配分析。结论认为该项目利润高、账期良，建议积极筹备投标。',
      dataSnapshot: { totalInvestment: '2 亿元', mainWorks: '道路、排水及绿化' },
      h5Url: '/h5/reports/rep-1',
      pdfUrl: '/pdf/reports/rep-1',
      creditsCost: 100,
      disclaimer: 'AI 分析报告仅供商业决策参考，不作为法律承诺。',
      createdAt: '2026-06-02T11:00:00.000Z',
    },
  ];

  const mockFeedbacks: MarketSignalFeedbackView[] = [
    {
      id: 'fb-1',
      signalId: '1',
      tenantId: 'mock-tenant',
      userId: 'mock-user',
      feedbackType: 'usefulness',
      rating: 5,
      comment: '非常有价值，提前一个月得知信息！',
      createdAt: '2026-06-02T12:00:00.000Z',
    },
  ];

  const mockGenerationLogs: MarketSignalGenerationLogView[] = [
    {
      id: 'log-1',
      signalId: '1',
      tenantId: 'mock-tenant',
      userId: 'mock-user',
      generationType: 'summary',
      creditsCost: 10,
      status: 'success',
      traceId: 'trace-mock-gen-1',
      inputSnapshot: { signalId: '1' },
      createdAt: '2026-06-01T08:00:00.000Z',
    },
  ];

  return {
    async listSignals(filters?: { region?: string; signalType?: string; riskLevel?: string; page?: number; pageSize?: number }): Promise<MarketSignalListResult> {
      if (mock) {
        const list = mockSignals.filter((s) => {
          if (filters?.region && s.region !== filters.region) return false;
          if (filters?.signalType && s.signalType !== filters.signalType) return false;
          if (filters?.riskLevel && s.riskLevel !== filters.riskLevel) return false;
          return true;
        });
        return delay({
          list,
          total: list.length,
        });
      }
      return unwrap(await http.get('/market-situation/signals', { params: filters }));
    },

    async listFeaturedSignals(): Promise<MarketSignalView[]> {
      if (mock) {
        return delay(mockSignals.filter((s) => s.isFeatured));
      }
      return unwrap(await http.get('/market-situation/signals/featured'));
    },

    async getSignal(id: string): Promise<MarketSignalView> {
      if (mock) {
        const sig = mockSignals.find((s) => s.id === id);
        if (!sig) throw new Error('Signal not found');
        return delay(sig);
      }
      return unwrap(await http.get(`/market-situation/signals/${id}`));
    },

    async unlockSignal(id: string, payload: { unlockType: 'impact_analysis' | 'simulation' | 'report' | 'full' }): Promise<MarketSignalView> {
      if (mock) {
        const sig = mockSignals.find((s) => s.id === id);
        if (!sig) throw new Error('Signal not found');
        if (!sig.unlockedParts) sig.unlockedParts = [];
        if (!sig.unlockedParts.includes(payload.unlockType)) {
          sig.unlockedParts.push(payload.unlockType);
        }
        return delay(sig);
      }
      return unwrap(await http.post(`/market-situation/signals/${id}/unlock`, payload));
    },

    async createSimulation(payload: { signalId: string; simulationType: string; inputParams: Record<string, unknown> }): Promise<MarketSignalSimulationView> {
      if (mock) {
        const newSim: MarketSignalSimulationView = {
          id: cryptoRandomId(),
          signalId: payload.signalId,
          tenantId: 'mock-tenant',
          userId: 'mock-user',
          simulationType: payload.simulationType as MarketSignalSimulationType,
          inputParams: payload.inputParams,
          simulationResult: { successRate: 0.82, marginRange: '5% - 8%', details: '模拟计算推演圆满成功。' },
          confidence: 'high',
          tierBadge: 3,
          creditsCost: 50,
          createdAt: new Date().toISOString(),
        };
        mockSimulations.push(newSim);
        return delay(newSim);
      }
      return unwrap(await http.post('/market-situation/simulations', payload));
    },

    async listSimulations(signalId: string): Promise<MarketSignalSimulationView[]> {
      if (mock) {
        return delay(mockSimulations.filter((s) => s.signalId === signalId));
      }
      return unwrap(await http.get(`/market-situation/signals/${signalId}/simulations`));
    },

    async getSimulation(id: string): Promise<MarketSignalSimulationView> {
      if (mock) {
        const sim = mockSimulations.find((s) => s.id === id);
        if (!sim) throw new Error('Simulation not found');
        return delay(sim);
      }
      return unwrap(await http.get(`/market-situation/simulations/${id}`));
    },

    async createReport(payload: { signalId: string; reportType: string }): Promise<{ reportId: string }> {
      if (mock) {
        const newRep: MarketSignalReportView = {
          id: cryptoRandomId(),
          signalId: payload.signalId,
          tenantId: 'mock-tenant',
          userId: 'mock-user',
          reportType: payload.reportType as MarketSignalReportType,
          title: `专项分析报告 - ${payload.reportType}`,
          tierBadge: 2,
          confidence: 'high',
          executiveSummary: 'AI 自动生成的专项推演研判报告，结论非常清晰。',
          dataSnapshot: { computedAt: new Date().toISOString() },
          creditsCost: 100,
          disclaimer: '本报告内容为 AI 生成，仅供商业参考。',
          createdAt: new Date().toISOString(),
        };
        mockReports.push(newRep);
        return delay({ reportId: newRep.id });
      }
      return unwrap(await http.post('/market-situation/reports', payload));
    },

    async listReports(signalId: string): Promise<MarketSignalReportView[]> {
      if (mock) {
        return delay(mockReports.filter((r) => r.signalId === signalId));
      }
      return unwrap(await http.get(`/market-situation/signals/${signalId}/reports`));
    },

    async getReport(id: string): Promise<MarketSignalReportView> {
      if (mock) {
        const rep = mockReports.find((r) => r.id === id);
        if (!rep) throw new Error('Report not found');
        return delay(rep);
      }
      return unwrap(await http.get(`/market-situation/reports/${id}`));
    },

    async createFeedback(payload: { signalId: string; feedbackType: string; rating: number; comment?: string }): Promise<MarketSignalFeedbackView> {
      if (mock) {
        const newFb: MarketSignalFeedbackView = {
          id: cryptoRandomId(),
          signalId: payload.signalId,
          tenantId: 'mock-tenant',
          userId: 'mock-user',
          feedbackType: payload.feedbackType as MarketSignalFeedbackType,
          rating: payload.rating,
          comment: payload.comment,
          createdAt: new Date().toISOString(),
        };
        mockFeedbacks.push(newFb);
        return delay(newFb);
      }
      return unwrap(await http.post('/market-situation/feedbacks', payload));
    },

    async listFeedbacks(signalId: string): Promise<MarketSignalFeedbackView[]> {
      if (mock) {
        return delay(mockFeedbacks.filter((f) => f.signalId === signalId));
      }
      return unwrap(await http.get(`/market-situation/signals/${signalId}/feedbacks`));
    },

    async listSources(): Promise<MarketSignalSourceView[]> {
      if (mock) {
        return delay([
          { id: '1', sourceName: '各省招投标公共服务平台', sourceType: 'tender_platform', region: '全国', dataTypes: ['tender_info'], crawlIntervalMin: 60, isActive: true, healthStatus: 'healthy', createdAt: '2026-05-01' },
          { id: '2', sourceName: '中国裁判文书网', sourceType: 'courtWebsite', region: '全国', dataTypes: ['judicial_records'], crawlIntervalMin: 120, isActive: true, healthStatus: 'healthy', createdAt: '2026-05-01' },
        ]);
      }
      return unwrap(await http.get('/market-situation/sources'));
    },

    async listTags(): Promise<MarketSignalTagView[]> {
      if (mock) {
        return delay([
          { id: '1', tagKey: 'municipal', tagName: '市政', tagCategory: 'industry', usageCount: 45, createdAt: '2026-05-01' },
          { id: '2', tagKey: 'road', tagName: '道路', tagCategory: 'industry', usageCount: 30, createdAt: '2026-05-01' },
          { id: '3', tagKey: 'tender', tagName: '招标', tagCategory: 'opportunity_type', usageCount: 88, createdAt: '2026-05-01' },
        ]);
      }
      return unwrap(await http.get('/market-situation/tags'));
    },

    async generateAnalysis(payload: { signalId: string; analysisType: 'summary' | 'impact_analysis' | 'simulation' | 'report' }): Promise<MarketSignalGenerationLogView> {
      if (mock) {
        const newLog: MarketSignalGenerationLogView = {
          id: cryptoRandomId(),
          signalId: payload.signalId,
          tenantId: 'mock-tenant',
          userId: 'mock-user',
          generationType: payload.analysisType as MarketSignalGenerationType,
          creditsCost: 50,
          status: 'success',
          traceId: cryptoRandomId(),
          inputSnapshot: { signalId: payload.signalId },
          createdAt: new Date().toISOString(),
        };
        mockGenerationLogs.push(newLog);
        return delay(newLog);
      }
      return unwrap(await http.post(`/market-situation/signals/${payload.signalId}/analyze`, payload));
    },

    async listGenerationLogs(): Promise<MarketSignalGenerationLogView[]> {
      if (mock) {
        return delay(mockGenerationLogs);
      }
      return unwrap(await http.get('/market-situation/generation-logs'));
    },
  };
}
