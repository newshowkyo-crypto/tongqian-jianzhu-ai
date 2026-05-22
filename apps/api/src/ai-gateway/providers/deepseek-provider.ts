import { AiAudienceRole, AiConfidenceLevel, AiNextStepAction, AiOutputTier, ReportNextStepHint, type AiProviderCode } from '@tongqian/types';

import type { AiProvider, AiProviderInvokeRequest, AiRawResponse } from './ai-provider.interface.js';

interface DeepSeekChoice {
  message?: { content?: string };
}

interface DeepSeekResponse {
  choices?: DeepSeekChoice[];
  usage?: { completion_tokens?: number; prompt_tokens?: number };
}

export class DeepSeekProvider implements AiProvider {
  readonly disabledReason = process.env.DEEPSEEK_API_KEY ? undefined : 'DEEPSEEK_API_KEY missing';

  constructor(
    public readonly code: AiProviderCode,
    public readonly priority: number,
    public readonly supportedModels: string[],
  ) {}

  async health(): Promise<boolean> {
    return Boolean(process.env.DEEPSEEK_API_KEY);
  }

  async invoke<T = unknown>(request: AiProviderInvokeRequest): Promise<AiRawResponse<T>> {
    const key = process.env.DEEPSEEK_API_KEY;
    if (!key) throw new Error('DEEPSEEK_API_KEY missing');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), request.timeoutMs ?? 45_000);
    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        body: JSON.stringify({
          messages: [
            ...request.messages,
            {
              content:
                '请只输出 JSON。必须包含 disclaimer、tier、confidence、dataSourceStatement、traceId、nextStepHint、nextStepButtons、summary、sections。nextStepButtons 使用 action/i18nKey/role 字段。',
              role: 'system',
            },
          ],
          model: request.model,
          response_format: { type: 'json_object' },
          temperature: 0.2,
        }),
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        method: 'POST',
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`DeepSeek HTTP ${response.status}: ${await response.text()}`);
      const payload = (await response.json()) as DeepSeekResponse;
      const raw = payload.choices?.[0]?.message?.content ?? '';
      return {
        content: normalizeDeepSeekJson(raw) as T,
        inputTokens: payload.usage?.prompt_tokens ?? 0,
        outputTokens: payload.usage?.completion_tokens ?? 0,
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

function normalizeDeepSeekJson(raw: string): Record<string, unknown> {
  const parsed = parseJsonObject(raw);
  const summary = normalizeText(parsed.summary ?? parsed.answer ?? parsed.message ?? raw);
  return {
    confidence: parsed.confidence === 'high' || parsed.confidence === 'low' ? parsed.confidence : AiConfidenceLevel.MEDIUM,
    dataSourceStatement: normalizeText(parsed.dataSourceStatement ?? 'DeepSeek reasoner + 同乾方略建筑经营规则库演示链路。'),
    disclaimer: normalizeText(parsed.disclaimer ?? '本回复由 AI 生成，仅供经营决策参考，不构成法律、财务或工程专业最终意见。'),
    executionDifficultyRadar: parsed.executionDifficultyRadar ?? { cost: 45, professional: 68, risk: 72, time: 56 },
    nextStepButtons: normalizeButtons(parsed.nextStepButtons),
    nextStepHint: Object.values(ReportNextStepHint).includes(parsed.nextStepHint as ReportNextStepHint) ? parsed.nextStepHint : ReportNextStepHint.APPLY_HUMAN_REVIEW,
    sections: Array.isArray(parsed.sections) ? parsed.sections : [{ content: summary, id: 'deepseek-summary', title: 'DeepSeek 结构化建议' }],
    summary,
    tier: parsed.tier === 3 || parsed.tier === 4 ? parsed.tier : AiOutputTier.TIER_2,
    title: normalizeText(parsed.title ?? '合同付款风险速读'),
    traceId: normalizeText(parsed.traceId ?? `deepseek-${Date.now()}`),
  };
}

function parseJsonObject(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return {};
    try {
      const parsed = JSON.parse(match[0]) as unknown;
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
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
  return defaultActions.map((action, index) => ({ action, i18nKey: `ai.actions.${action}`, role: AiAudienceRole.OWNER }));
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
