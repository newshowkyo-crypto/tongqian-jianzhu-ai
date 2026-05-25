import { Injectable } from '@nestjs/common';
import { AiCacheStrategy, AiTaskType } from '@tongqian/types';
import { z } from 'zod';

import type { AiGatewayService } from '../../ai-gateway/ai-gateway.service.js';
import { ruleExtractOutputSchema, type RuleExtractInput, type RuleExtractOutput } from '../../prompts/rules/rule-extract.prompt.js';
import type { RulesService } from '../rule-curation/rules.service.js';
import type { SecurityComplianceService } from '../security-compliance/security-compliance.service.js';

@Injectable()
export class RuleExtractionService {
  constructor(
    private readonly aiGateway: AiGatewayService,
    private readonly rulesService: RulesService,
    private readonly security: SecurityComplianceService,
  ) {}

  async handleCrawlerCompleted(input: RuleExtractInput): Promise<{ candidates: Array<{ confidence: number; id: string; title: string }>; traceId: string }> {
    const extract_trace_id = crypto.randomUUID();
    const safeInput = { ...input, sourceText: this.security.sanitize(input.sourceText) };
    const output = await this.invokeWithRetry(safeInput, extract_trace_id);
    const candidates = output.candidates.map((candidate) => {
      const row = this.rulesService.createCandidate({
        confidence: candidate.confidence,
        reasoning: `${candidate.riskLevel}:${candidate.suggestion}`,
        ruleStruct: { ...candidate, extract_trace_id, source_url: input.sourceUrl, statusHint: candidate.confidence >= 0.85 ? 'pending_review' : 'pending_review_low' },
        sourceName: input.sourceType,
        sourceText: safeInput.sourceText,
        type: candidate.type,
      });
      this.security.audit({ action: 'rule.extract.candidate', after: { candidateId: row.id, extract_trace_id, source_url: input.sourceUrl }, resource: 'rule_candidates', traceId: extract_trace_id });
      return { confidence: row.confidence, id: row.id, title: candidate.title };
    });
    return { candidates, traceId: extract_trace_id };
  }

  mockJudgmentExtraction(): { candidates: RuleExtractOutput['candidates']; traceId: string } {
    return {
      candidates: [
        { confidence: 0.91, riskLevel: 'red', suggestion: '建议关注工程款支付节点和催告证据。', title: '工程款逾期证据规则', type: 'contract' },
        { confidence: 0.74, riskLevel: 'yellow', suggestion: '建议关注签证资料和监理确认链。', title: '签证资料复核规则', type: 'contract' },
      ],
      traceId: crypto.randomUUID(),
    };
  }

  private async invokeWithRetry(input: RuleExtractInput, traceId: string): Promise<RuleExtractOutput> {
    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await this.aiGateway.invoke<unknown>({
          context: { extract_trace_id: traceId, source_url: input.sourceUrl },
          input,
          options: { cacheStrategy: AiCacheStrategy.EXACT_AND_SEMANTIC, idempotencyKey: `rule-extract-${traceId}-${attempt}` },
          taskType: AiTaskType.RULE_EXTRACT,
          tenantId: 'platform-tenant',
          userId: 'platform-owner',
        });
        return ruleExtractOutputSchema.parse(response.data);
      } catch (error) {
        lastError = error;
      }
    }
    if (lastError instanceof z.ZodError) throw lastError;
    throw new Error('RULE_EXTRACT_FAILED_AFTER_RETRY');
  }
}
