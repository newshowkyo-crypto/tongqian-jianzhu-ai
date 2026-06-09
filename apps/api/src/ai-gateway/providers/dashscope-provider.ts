import { AiAudienceRole, AiConfidenceLevel, AiNextStepAction, AiOutputTier, ReportNextStepHint, type AiProviderCode } from '@tongqian/types';

import type { AiProvider, AiProviderInvokeRequest, AiRawResponse } from './ai-provider.interface.js';

interface DashScopeChoice {
  message?: { content?: string };
}

interface DashScopeResponse {
  choices?: DashScopeChoice[];
  usage?: { completion_tokens?: number; prompt_tokens?: number };
}

const DASHSCOPE_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

export class DashScopeProvider implements AiProvider {
  readonly disabledReason = dashScopeApiKey() ? undefined : 'ALIYUN_DASHSCOPE_API_KEY missing';

  constructor(
    public readonly code: AiProviderCode,
    public readonly priority: number,
    public readonly supportedModels: string[],
  ) {}

  async health(): Promise<boolean> {
    return Boolean(dashScopeApiKey());
  }

  async invoke<T = unknown>(request: AiProviderInvokeRequest): Promise<AiRawResponse<T>> {
    const key = dashScopeApiKey();
    if (!key) throw new Error('ALIYUN_DASHSCOPE_API_KEY missing');
    const response = await fetch(`${process.env.DASHSCOPE_BASE_URL ?? DASHSCOPE_BASE_URL}/chat/completions`, {
      body: JSON.stringify({
        messages: [
          ...request.messages,
          {
            content:
              '只输出 JSON。必须包含 disclaimer、tier、confidence、dataSourceStatement、traceId、nextStepHint、nextStepButtons、summary、sections。nextStepButtons 使用 action/i18nKey/role 字段。',
            role: 'system',
          },
        ],
        model: request.model,
        response_format: { type: 'json_object' },
        temperature: 0.2,
      }),
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      method: 'POST',
      signal: request.timeoutMs ? AbortSignal.timeout(request.timeoutMs) : undefined,
    });
    if (!response.ok) throw new Error(`DashScope HTTP ${response.status}: ${await response.text()}`);
    const payload = (await response.json()) as DashScopeResponse;
    const raw = payload.choices?.[0]?.message?.content ?? '';
    return {
      content: normalizeDashScopeJson(raw, request.model) as T,
      inputTokens: payload.usage?.prompt_tokens ?? 0,
      outputTokens: payload.usage?.completion_tokens ?? 0,
    };
  }
}

function dashScopeApiKey(): string | undefined {
  return process.env.ALIYUN_DASHSCOPE_API_KEY || process.env.DASHSCOPE_API_KEY;
}

function normalizeDashScopeJson(raw: string, model: string): Record<string, unknown> {
  const parsed = parseJsonObject(raw);
  const summary = normalizeText(parsed.summary ?? parsed.answer ?? parsed.message ?? raw);
  return {
    confidence: parseConfidence(parsed.confidence),
    dataSourceStatement: normalizeText(parsed.dataSourceStatement ?? '阿里百炼 DashScope + 同乾方略建筑经营规则库。'),
    disclaimer: normalizeText(parsed.disclaimer ?? '本内容由 AI 生成，仅供经营决策参考，不构成法律、财务或工程专业最终意见。'),
    executionDifficultyRadar: parsed.executionDifficultyRadar ?? { cost: 40, professional: 60, risk: 60, time: 50 },
    nextStepButtons: normalizeButtons(parsed.nextStepButtons),
    nextStepHint: Object.values(ReportNextStepHint).includes(parsed.nextStepHint as ReportNextStepHint) ? parsed.nextStepHint : ReportNextStepHint.APPLY_HUMAN_REVIEW,
    sections: Array.isArray(parsed.sections) ? parsed.sections : [{ content: summary, id: 'dashscope-summary', title: '通义千问结构化建议' }],
    summary,
    tier: parseTier(parsed.tier),
    title: normalizeText(parsed.title ?? '同乾方略 AI 分析结果'),
    traceId: normalizeText(parsed.traceId ?? `dashscope-${Date.now()}`),
    model,
  };
}

function parseJsonObject(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  } catch {
    const match = raw.match(/\{[\s\S]*\}/u);
    if (!match) return {};
    try {
      const parsed = JSON.parse(match[0]) as unknown;
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
}

function parseConfidence(value: unknown): AiConfidenceLevel {
  if (value === AiConfidenceLevel.HIGH || value === AiConfidenceLevel.LOW || value === AiConfidenceLevel.MEDIUM) return value;
  return AiConfidenceLevel.MEDIUM;
}

function parseTier(value: unknown): AiOutputTier {
  if (value === AiOutputTier.TIER_1 || value === AiOutputTier.TIER_2 || value === AiOutputTier.TIER_3 || value === AiOutputTier.TIER_4) return value;
  return AiOutputTier.TIER_2;
}

function normalizeButtons(value: unknown): Array<{ action: AiNextStepAction; i18nKey: string; role: AiAudienceRole }> {
  if (Array.isArray(value) && value.length > 0) {
    return value.slice(0, 5).map((item, index) => {
      const record = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
      return {
        action: Object.values(AiNextStepAction).includes(record.action as AiNextStepAction) ? (record.action as AiNextStepAction) : defaultActions[index] ?? AiNextStepAction.REQUEST_HUMAN_REVIEW,
        i18nKey: normalizeText(record.i18nKey ?? `ai.actions.${index}`),
        role: Object.values(AiAudienceRole).includes(record.role as AiAudienceRole) ? (record.role as AiAudienceRole) : AiAudienceRole.OWNER,
      };
    });
  }
  return defaultActions.map((action) => ({ action, i18nKey: `ai.actions.${action}`, role: AiAudienceRole.OWNER }));
}

function normalizeText(value: unknown): string {
  return typeof value === 'string' && value.trim() ? value.trim() : String(value || '');
}

const defaultActions = [
  AiNextStepAction.SELF_EXECUTE,
  AiNextStepAction.APPLY_AGENT,
  AiNextStepAction.APPLY_TONGQIAN_CONSULTING,
  AiNextStepAction.REQUEST_HUMAN_REVIEW,
  AiNextStepAction.REQUEST_EXPERT_CONSULTING,
];
