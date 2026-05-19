import { Inject, Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

import { ApprovalEngineService } from '../approval/approval-engine.service.js';
import type { ApprovalFlow } from '../approval/approval-engine.service.js';

interface ExportJob {
  approvalFlowId: string;
  createdAt: string;
  expiresAt?: string;
  format: 'csv' | 'xlsx' | 'zip';
  id: string;
  resourceId: string;
  status: 'approved' | 'expired' | 'pending' | 'ready';
  tenantId: string;
  url?: string;
}

@Injectable()
export class DataExportService {
  private readonly jobs = new Map<string, ExportJob>();

  constructor(@Inject(ApprovalEngineService) private readonly approvals: ApprovalEngineService) {}

  /**
   * Requests BR-104 asynchronous export approval with 2FA gate.
   *
   * @param input Export request.
   * @returns Approval flow.
   */
  request(input: { format?: 'csv' | 'xlsx' | 'zip'; requesterRole: string; resourceId: string; tenantId?: string; twoFactorCode?: string }): ApprovalFlow {
    if (!['OWNER', 'PLATFORM_OWNER'].includes(input.requesterRole)) {
      throw new BusinessError({ code: ErrorCodes.PERM_ACTION_DENIED.code, message: 'Only owner or platform owner can request export.' });
    }
    if (!input.twoFactorCode) {
      throw new BusinessError({ code: ErrorCodes.AUTH_LOGIN_PASSWORD_INVALID.code, message: 'Data export requires two factor verification.' });
    }
    const flow = this.approvals.createFlow({ resourceId: input.resourceId, resourceType: 'data-export', type: 'data-export' });
    this.jobs.set(flow.id, {
      approvalFlowId: flow.id,
      createdAt: new Date().toISOString(),
      format: input.format ?? 'xlsx',
      id: crypto.randomUUID(),
      resourceId: input.resourceId,
      status: 'pending',
      tenantId: input.tenantId ?? 'mock-tenant',
    });
    return flow;
  }

  /**
   * Marks an approved export as ready with a signed OSS-style URL.
   *
   * @param approvalFlowId Approval flow id.
   * @returns Export job.
   */
  markReady(approvalFlowId: string): ExportJob {
    const job = this.getByFlow(approvalFlowId);
    job.status = 'ready';
    job.expiresAt = new Date(Date.now() + 24 * 60 * 60_000).toISOString();
    job.url = `mock-oss://exports/${job.tenantId}/${job.resourceId}.${job.format}?expires=${encodeURIComponent(job.expiresAt)}`;
    return { ...job };
  }

  /**
   * Gets an export job by approval flow id.
   *
   * @param approvalFlowId Approval flow id.
   * @returns Export job.
   */
  getByFlow(approvalFlowId: string): ExportJob {
    const job = this.jobs.get(approvalFlowId);
    if (!job) throw new BusinessError({ code: ErrorCodes.EXPORT_APPROVAL_REQUIRED.code, message: 'Export approval job is not found.' });
    return job;
  }

  /**
   * Lists export jobs scoped by tenant.
   *
   * @param tenantId Tenant id.
   * @returns Export jobs.
   */
  list(tenantId: string): ExportJob[] {
    if (!tenantId) throw new BusinessError({ code: ErrorCodes.TENANT_NOT_FOUND.code, message: 'Export list requires tenant scope.' });
    return [...this.jobs.values()].filter((job) => job.tenantId === tenantId);
  }

  /**
   * Expires old signed URLs without deleting audit records.
   *
   * @param now Current time.
   * @returns Number of expired jobs.
   */
  expire(now = new Date()): number {
    let count = 0;
    for (const job of this.jobs.values()) {
      if (job.expiresAt && new Date(job.expiresAt) <= now && job.status === 'ready') {
        job.status = 'expired';
        count += 1;
      }
    }
    return count;
  }

  /**
   * Builds audit metadata for export lifecycle.
   *
   * @param approvalFlowId Approval flow id.
   * @returns Audit row.
   */
  toAudit(approvalFlowId: string): Record<string, string | undefined> {
    const job = this.getByFlow(approvalFlowId);
    return { action: 'DATA_EXPORT_JOB', approvalFlowId, resourceId: job.resourceId, status: job.status, tenantId: job.tenantId, url: job.url };
  }
}
