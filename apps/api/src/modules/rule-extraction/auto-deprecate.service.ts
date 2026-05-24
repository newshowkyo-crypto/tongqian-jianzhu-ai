import { Injectable } from '@nestjs/common';

import { SecurityComplianceService } from '../security-compliance/security-compliance.service.js';

export interface DeprecateInput {
  ageInDays: number;
  id: string;
  sourceText: string;
  status: 'active' | 'deprecated';
  timeliness_score: number;
}

@Injectable()
export class AutoDeprecateService {
  constructor(private readonly security: SecurityComplianceService) {}

  evaluate(rule: DeprecateInput): DeprecateInput & { reason?: string; revertible: true } {
    const replaced = /废止|替代|失效|replaced|deprecated/i.test(rule.sourceText);
    const stale = rule.timeliness_score < 30 && rule.ageInDays > 365;
    if (!replaced && !stale) return { ...rule, revertible: true };
    const next: DeprecateInput & { reason: string; revertible: true } = { ...rule, reason: replaced ? 'source_replaced' : 'timeliness_stale', revertible: true, status: 'deprecated' };
    this.security.audit({ action: 'rule.deprecate.soft', after: { ...next }, before: { ...rule }, resource: 'rules' });
    this.notifyAdmin(next);
    return next;
  }

  revert(rule: DeprecateInput): DeprecateInput {
    const next = { ...rule, status: 'active' as const };
    this.security.audit({ action: 'rule.deprecate.revert', after: { ...next }, before: { ...rule }, resource: 'rules' });
    return next;
  }

  private notifyAdmin(rule: DeprecateInput & { reason?: string }): void {
    void { adminNotification: { action: 'review_deprecated_rule', ruleId: rule.id, reason: rule.reason } };
  }
}
