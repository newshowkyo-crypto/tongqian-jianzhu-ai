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
    async module(slug: string): Promise<AdminModuleSummary> {
      if (mock) return delay(buildAdminModuleFixture(slug));
      return unwrap(await http.get(`/admin/modules/${slug}`));
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
      return unwrap(await http.post('/ai/chat', { messages, taskType }));
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
