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
  { approval: 'disabled', key: 'ALIYUN_DASHSCOPE_API_KEY', mode: 'mock', provider: 'dashscope', updatedAt: 'DISABLED_UNTIL_API_KEY_PROVIDED' },
  { approval: 'disabled', key: 'OPENROUTER_API_KEY', mode: 'mock', provider: 'openrouter', updatedAt: 'DISABLED_UNTIL_API_KEY_PROVIDED' },
  { approval: 'pending_approval', key: 'WECHAT_PAY_*', mode: 'mock', provider: 'wechat_pay', updatedAt: 'P1 mock provider' },
  { approval: 'pending_approval', key: 'ALIYUN_OSS_*', mode: 'mock', provider: 'aliyun_oss', updatedAt: 'P1 mock provider' },
];

export function createApiClient(options: ApiClientOptions = {}) {
  const envMock =
    typeof process !== 'undefined' && process.env.NEXT_PUBLIC_USE_MOCK
      ? process.env.NEXT_PUBLIC_USE_MOCK !== 'false'
      : true;
  const mock = options.mock ?? envMock;
  const http = axios.create({
    baseURL: options.baseURL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:4000/api/v1',
    timeout: 15_000,
  });

  http.interceptors.request.use((config) => {
    const token = options.getToken?.() ?? readBrowserToken();
    config.headers.set(traceHeader, cryptoRandomId());
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
    chatHub: createChatHubApi(http, mock),
    credentials: createCredentialApi(http, mock),
    http,
    mock,
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
  };
}

function createAiApi(http: AxiosInstance, mock: boolean) {
  return {
    async chat(messages: AiChatMessage[], taskType = 'chat.long'): Promise<AiChatResult> {
      if (mock) {
        return delay({
          buttons: ['Self execute', 'Request field support', 'Request Tongqian Strategy', 'Manual review', 'Expert consultation'],
          confidence: 'high',
          message: {
            content: `DeepSeek mock handled ${messages.length} context messages for ${taskType}. Suggested focus: cash flow, contract evidence chain, approval owner, and next action deadline.`,
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
          content: normalizeText(data.answer ?? data.summary ?? data.message ?? response.fallbackText ?? latest),
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

async function unwrap<T>(response: AxiosResponse<ApiEnvelope<T>>): Promise<T> {
  return response.data.data;
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), 180));
}

function readBrowserToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.localStorage.getItem('tongqian.jwt') ?? undefined;
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
  if (Array.isArray(value)) return value.map((item) => String(item)).slice(0, 5);
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
