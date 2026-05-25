import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import type { RulesService } from '../../rule-curation/rules.service.js';
import type { SecurityComplianceService } from '../../security-compliance/security-compliance.service.js';

@Controller('api/v1/admin/rule-candidates')
export class RuleCandidatesController {
  constructor(private readonly rules: RulesService, private readonly security: SecurityComplianceService) {}

  @Get()
  list(@Query('status') status?: 'approved' | 'pending' | 'rejected', @Query('sourceType') sourceType?: string) {
    const items = this.rules.listCandidates(status).filter((item) => !sourceType || sourceType === 'all' || item.ruleStruct.sourceType === sourceType).map((item) => ({
      ...item,
      extractTraceId: item.ruleStruct.extract_trace_id ?? item.id,
      riskLevel: item.ruleStruct.riskLevel ?? 'yellow',
      sourceType: item.ruleStruct.sourceType ?? 'crawler',
      sourceUrl: item.ruleStruct.source_url ?? 'https://public-source.local',
      timelinessScore: item.ruleStruct.timeliness_score ?? 80,
      title: item.ruleStruct.title ?? item.sourceName,
    }));
    return { code: 0, data: { items, total: items.length }, message: 'ok', traceId: crypto.randomUUID() };
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @Body() body: { edits?: Record<string, unknown> }) {
    if (body.edits) this.rules.updateCandidate(id, { ruleStruct: body.edits });
    const rule = this.rules.approveCandidate(id, 'admin-rule-candidates');
    this.security.audit({ action: 'rule_candidate.approve', after: { id, ruleId: rule.id }, resource: 'rule_candidates' });
    return { code: 0, data: rule, message: 'approved', traceId: crypto.randomUUID() };
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @Body() body: { reason?: string }) {
    const candidate = this.rules.rejectCandidate(id, body.reason ?? 'admin rejected');
    this.security.audit({ action: 'rule_candidate.reject', after: { id, reason: body.reason }, resource: 'rule_candidates' });
    return { code: 0, data: candidate, message: 'rejected', traceId: crypto.randomUUID() };
  }

  @Post('batch')
  batch(@Body() body: { action: 'approve' | 'reject'; ids: string[]; reason?: string }) {
    const ids = body.ids.slice(0, 50);
    const items = ids.map((id) => (body.action === 'approve' ? this.rules.approveCandidate(id, 'admin-rule-candidates-batch') : this.rules.rejectCandidate(id, body.reason ?? 'batch rejected')));
    this.security.audit({ action: `rule_candidate.batch.${body.action}`, after: { count: ids.length, ids }, resource: 'rule_candidates' });
    return { code: 0, data: { items, limit: 50 }, message: 'batch ok', traceId: crypto.randomUUID() };
  }
}
