import { Injectable } from '@nestjs/common';
import { AiCacheStrategy, AiTaskType } from '@tongqian/types';
import { z } from 'zod';

import { AiGatewayService } from '../../ai-gateway/ai-gateway.service.js';
import { ruleFromClauseOutputSchema, type RuleFromClauseOutput } from '../../prompts/rules/rule-from-clause.prompt.js';
import { LegalCorpusService } from '../legal-corpus/legal-corpus.service.js';
import { RulesService, type RuleCandidate } from '../rule-curation/rules.service.js';
import { SecurityComplianceService } from '../security-compliance/security-compliance.service.js';

import { DedupService } from './dedup.service.js';

@Injectable()
export class RuleFromClauseService {
  constructor(
    private readonly aiGateway: AiGatewayService,
    private readonly corpusService: LegalCorpusService,
    private readonly dedupService: DedupService,
    private readonly rulesService: RulesService,
    private readonly security: SecurityComplianceService,
  ) {}

  async generateForClause(clauseId: string): Promise<RuleCandidate[]> {
    const { clause, corpus } = this.corpusService.getClause(clauseId);
    const traceId = crypto.randomUUID();
    const output = await this.invokeWithRetry({
      clause: { clauseNumber: clause.clauseNumber, clauseText: this.security.sanitize(clause.clauseText), clauseTitle: clause.clauseTitle ?? null },
      corpus: { code: corpus.code, issuer: corpus.issuer, title: corpus.title, version: corpus.version },
    }, traceId);
    return output.candidates.map((candidate) => {
      const decision = this.dedupService.decide({ id: clauseId, text: `${candidate.title} ${candidate.condition} ${candidate.legalBasis}` }, this.rulesService.listRules().map((rule) => ({ id: rule.id, text: JSON.stringify(rule.ruleStruct) })));
      if (decision.action === 'merge_version') return this.rulesService.createCandidate({
        confidence: candidate.confidence,
        reasoning: `dedup:${decision.matchedRuleId}:${candidate.suggestion}`,
        ruleStruct: { ...candidate, clauseId, corpusCode: corpus.code, dedup: decision, sourceType: 'legalCorpus' },
        sourceName: `${corpus.code} ${clause.clauseNumber}`,
        sourceText: clause.clauseText,
        type: this.toRuleKind(candidate.type),
      });
      const row = this.rulesService.createCandidate({
        confidence: candidate.confidence,
        reasoning: `${candidate.riskLevel}:${candidate.condition}:${candidate.suggestion}`,
        ruleStruct: { ...candidate, clauseId, corpusCode: corpus.code, sourceType: 'legalCorpus' },
        sourceName: `${corpus.code} ${clause.clauseNumber}`,
        sourceText: clause.clauseText,
        type: this.toRuleKind(candidate.type),
      });
      this.security.audit({ action: 'rule.generate.from_clause', after: { candidateId: row.id, clauseId, traceId }, resource: 'rule_candidates' });
      return row;
    });
  }

  async generateForCorpus(corpusId: string, options: { onlyConfidenceAbove?: number } = {}): Promise<{ errors: string[]; generated: number; skipped: number }> {
    const clauses = this.corpusService.listClauses(corpusId);
    let generated = 0;
    let skipped = 0;
    const errors: string[] = [];
    for (const clause of clauses) {
      try {
        const rows = await this.generateForClause(clause.id);
        const accepted = rows.filter((row) => !options.onlyConfidenceAbove || row.confidence >= options.onlyConfidenceAbove);
        generated += accepted.length;
        skipped += rows.length - accepted.length;
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }
    return { errors, generated, skipped };
  }

  private async invokeWithRetry(input: unknown, traceId: string): Promise<RuleFromClauseOutput> {
    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await this.aiGateway.invoke<unknown>({
          context: { traceId },
          input,
          options: { cacheStrategy: AiCacheStrategy.EXACT_AND_SEMANTIC, idempotencyKey: `rule-from-clause-${traceId}-${attempt}` },
          taskType: AiTaskType.RULE_EXTRACT,
          tenantId: 'platform-tenant',
          userId: 'platform-owner',
        });
        return ruleFromClauseOutputSchema.parse(response.data);
      } catch (error) {
        lastError = error;
      }
    }
    if (lastError instanceof z.ZodError) throw lastError;
    throw new Error('RULE_FROM_CLAUSE_FAILED_AFTER_RETRY');
  }

  private toRuleKind(type: RuleFromClauseOutput['candidates'][number]['type']): RuleCandidate['type'] {
    if (type === 'qualification') return 'qual';
    if (type === 'cost') return 'price';
    if (type === 'quality') return 'regulation';
    return type;
  }
}
