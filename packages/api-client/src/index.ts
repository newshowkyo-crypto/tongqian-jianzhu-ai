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
  { approval: 'disabled', key: 'OPENROUTER_API_KEY', mode: 'mock', provider: 'openrouter', updatedAt: 'DEPRECATED_DO_NOT_USE' },
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
        if (typeof window !== 'undefined') window.location.href = '/login';
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
    http,
    mock,
    riskReview: createRiskReviewApi(http, mock),
    tender: createTenderApi(http, mock),
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
  const base = tenderListFixture().find((row) => row.id === id) ?? tenderListFixture()[0]!;
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

function riskReviewDetailFixture(id: string): RiskReviewDetail {
  const base = riskReviewListFixture().find((row) => row.id === id) ?? riskReviewListFixture()[1]!;
  const red = id === 'demo-red';
  const green = id === 'demo-green';
  const levels: Array<'green' | 'red' | 'yellow'> = red ? ['red', 'red', 'red', 'red', 'red'] : green ? ['yellow', 'green', 'green', 'green', 'green'] : ['red', 'red', 'yellow', 'yellow', 'yellow'];
  return {
    ...base,
    confidence: green ? 'high' : 'medium',
    disclaimer: 'AI 生成内容仅供经营决策参考，不构成法律、财务或招投标承诺；重大签约请结合原合同与人工复核。',
    findings: levels.map((level, index) => ({
      clause: `合同第 ${index + 3} 条`,
      id: `${base.id}-finding-${index + 1}`,
      impact: ['付款节点未限定审计周期，可能拉长现金回款。', '违约金上限不清，可能形成单方加重责任。', '变更签证证据链不足，结算时容易被压价。', '工期顺延触发条件表述较窄。', '争议管辖地点增加维权成本。'][index]!,
      level,
      standardWording: '建议写明资料提交、确认期限、逾期视为认可、争议处理和证据形式。',
      suggestion: '先补齐期限、责任上限、签证材料和复核节点，再进入盖章流程。',
      type: ['付款风险', '违约责任', '结算风险', '履约保护', '诉讼成本'][index]!,
    })),
    tier: red ? 3 : green ? 1 : 2,
    traceId: cryptoRandomId(),
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
