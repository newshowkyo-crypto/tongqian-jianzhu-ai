import { Injectable } from '@nestjs/common';
import type { AuditLogView, ComplianceSelfCheckView, EmergencyIncidentView, EmergencyType, FraudSignalView } from '@tongqian/types';

const PUBLIC_SOURCES = [
  ['中国招标投标公共服务平台', 'https://www.cebpubservice.com'],
  ['全国公共资源交易平台', 'https://www.ggzy.gov.cn'],
  ['信用中国', 'https://www.creditchina.gov.cn'],
  ['国家企业信用信息公示系统', 'https://www.gsxt.gov.cn'],
  ['中国裁判文书网', 'https://wenshu.court.gov.cn'],
  ['四库一平台', 'https://jzsc.mohurd.gov.cn'],
  ['各省公共资源交易平台', 'https://example.gov.cn/province-ggzy'],
  ['住建部政策公开', 'https://www.mohurd.gov.cn'],
  ['财政部政策公开', 'https://www.mof.gov.cn'],
  ['发改委政策公开', 'https://www.ndrc.gov.cn'],
  ['地方住建厅公开数据', 'https://example.gov.cn/local-construction'],
];

@Injectable()
export class SecurityComplianceService {
  private emergencyPaused = false;
  private readonly audits: AuditLogView[] = [];
  private readonly blacklist = new Set<string>();
  private readonly fraudSignals: FraudSignalView[] = [];
  private readonly incidents: EmergencyIncidentView[] = [];

  audit(input: Omit<AuditLogView, 'createdAt' | 'id' | 'traceId'> & { gov?: boolean; traceId?: string }): AuditLogView {
    const log: AuditLogView = { ...input, createdAt: new Date().toISOString(), id: crypto.randomUUID(), traceId: input.traceId ?? crypto.randomUUID() };
    this.audits.push(log);
    return log;
  }

  listAudits(filter: { traceId?: string }): AuditLogView[] {
    return this.audits.filter((item) => !filter.traceId || item.traceId === filter.traceId).slice(-200);
  }

  exportAudits(): Record<string, unknown> {
    return { immutable: true, retentionYears: 6, signedUrl: `mock://oss/audit-export/${crypto.randomUUID()}.json`, total: this.audits.length };
  }

  addBlacklist(input: { addedBy: string; reason: string; type: string; value: string }): Record<string, unknown> {
    this.blacklist.add(`${input.type}:${input.value}`);
    return { ...input, addedAt: new Date().toISOString(), permanent: true };
  }

  detectFraud(input: { deviceFingerprint?: string; eventId?: string; ip?: string; kind: string; subjectId: string; value?: number }): FraudSignalView {
    const level = input.value && input.value >= 10 ? 'high' : input.value && input.value >= 3 ? 'medium' : 'low';
    const signal: FraudSignalView = {
      createdAt: new Date().toISOString(),
      evidence: { deviceFingerprint: input.deviceFingerprint, eventId: input.eventId, ip: input.ip, value: input.value },
      id: crypto.randomUUID(),
      level,
      status: level === 'low' ? 'dismissed' : 'open',
      subjectId: input.subjectId,
      type: input.kind,
    };
    if (signal.status === 'open') this.fraudSignals.push(signal);
    return signal;
  }

  fraudDashboard(): Record<string, unknown> {
    return {
      blacklistCount: this.blacklist.size,
      openSignals: this.fraudSignals.filter((item) => item.status === 'open').length,
      signals: this.fraudSignals.slice(-50),
      thresholds: { invitationMonthly: 5, invitationYearly: 30, ratingCluster24h: 10, registrationsPerDevice: 3, refundsPerYear: 3 },
    };
  }

  backupStatus(): Record<string, unknown> {
    return {
      fullBackup: { cron: '03:00 daily', retentionDays: 30, status: 'mock-success' },
      incremental: { cron: 'hourly', rpoHours: 1, status: 'mock-success' },
      restoreDrill: { cadence: 'quarterly', lastResult: 'deferred-until-staging', rtoHours: 4 },
    };
  }

  triggerEmergency(type: EmergencyType, notes?: string): EmergencyIncidentView {
    this.emergencyPaused = true;
    const incident: EmergencyIncidentView = { id: crypto.randomUUID(), servicePaused: true, severity: 'critical', triggeredAt: new Date().toISOString(), type };
    this.incidents.push(incident);
    this.audit({ action: 'emergency.trigger', after: { notes, type }, resource: 'emergency_incident' });
    return incident;
  }

  resolveEmergency(id: string): Record<string, unknown> {
    this.emergencyPaused = false;
    return { id, resolvedAt: new Date().toISOString(), servicePaused: this.emergencyPaused };
  }

  selfCheck(quarter: string): ComplianceSelfCheckView {
    return {
      createdAt: new Date().toISOString(),
      items: [
        { name: 'ICP filing', notes: 'deferred before launch', status: 'deferred' },
        { name: 'user agreement/privacy/agent/data-export documents', notes: 'legal review required before 99-FINAL', status: 'deferred' },
        { name: 'four tenant guardrails', status: 'done' },
        { name: 'sanitizer and domestic-only sourcing', status: 'done' },
        { name: 'backup restore drill', notes: 'requires staging resources', status: 'deferred' },
      ],
      quarter,
    };
  }

  dataSources(): Record<string, unknown>[] {
    return PUBLIC_SOURCES.map(([name, url]) => ({
      authorized: true,
      qpsLimit: 1,
      robotsCompliant: true,
      sourceName: name,
      sourceType: 'public_government',
      sourceUrl: url,
      userAgent: 'Tongqian research crawler + biz@tongqian.xin',
    }));
  }

  blockUnauthorizedSource(url: string): Record<string, unknown> {
    const allowed = this.dataSources().some((source) => url.startsWith(String(source.sourceUrl)));
    return { allowed, reason: allowed ? undefined : 'SEC.DATA_SOURCE.UNAUTHORIZED' };
  }

  sanitize(text: string): string {
    return text
      .replace(/1[3-9]\d{9}/g, 'PHONE_REDACTED')
      .replace(/\d{17}[\dXx]/g, 'ID_CARD_REDACTED')
      .replace(/\d{12,19}/g, 'BANK_OR_AMOUNT_REDACTED');
  }

  validateAiOutput(output: { buttons?: string[]; confidence?: string; disclaimer?: string; sources?: string[]; tierBadge?: string }): Record<string, unknown> {
    const failures = [
      !output.disclaimer ? 'missing_disclaimer' : undefined,
      !output.tierBadge ? 'missing_tier_badge' : undefined,
      !output.confidence ? 'missing_confidence' : undefined,
      (output.buttons?.length ?? 0) === 0 ? 'missing_guidance_buttons' : undefined,
      (output.sources?.length ?? 0) === 0 ? 'missing_sources' : undefined,
    ].filter(Boolean);
    return { failures, passed: failures.length === 0 };
  }

  sourcingGuard(input: { amount?: string; contact?: string; modelProvider?: string; organization?: string; summary: string }): Record<string, unknown> {
    return {
      auditRetentionYears: 6,
      domesticOnlyModel: true,
      hiddenFields: ['organization', 'contact', 'precise_amount'],
      modelProvider: input.modelProvider?.includes('domestic') ? input.modelProvider : 'domestic-only-router',
      summary: this.sanitize(input.summary),
      visible: { amountBand: input.amount ? 'range_only' : undefined, organization: input.organization ? 'desensitized' : undefined },
    };
  }
}
