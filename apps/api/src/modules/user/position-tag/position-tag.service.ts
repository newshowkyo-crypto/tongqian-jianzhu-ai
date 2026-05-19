import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

interface PositionAssignment {
  assignedAt: string;
  assignedBy?: string;
  tags: string[];
  tenantId: string;
  userId: string;
}

@Injectable()
export class PositionTagService {
  private readonly assignments = new Map<string, PositionAssignment>();

  /**
   * Assigns role-aware position tags under tenant scope.
   *
   * @param userId User id.
   * @param tags Position tags.
   * @param tenantId Tenant id.
   * @param assignedBy Operator id.
   * @returns Assignment result.
   */
  assign(userId: string, tags: string[], tenantId = 'mock-tenant', assignedBy?: string): { tags: string[]; userId: string } {
    this.validate(userId, tags, tenantId);
    const normalized = [...new Set(tags.map((tag) => tag.toUpperCase()))];
    this.assignments.set(userId, { assignedAt: new Date().toISOString(), assignedBy, tags: normalized, tenantId, userId });
    return { tags: normalized, userId };
  }

  /**
   * Gets tags for one user.
   *
   * @param userId User id.
   * @returns Position tags.
   */
  get(userId: string): string[] {
    return this.assignments.get(userId)?.tags ?? [];
  }

  /**
   * Lists assignments in one tenant.
   *
   * @param tenantId Tenant id.
   * @returns Assignment rows.
   */
  list(tenantId: string): PositionAssignment[] {
    if (!tenantId) throw new BusinessError({ code: ErrorCodes.TENANT_NOT_FOUND.code, message: 'Position tag list requires tenant scope.' });
    return [...this.assignments.values()].filter((row) => row.tenantId === tenantId);
  }

  /**
   * Resolves permission hints from position tags.
   *
   * @param tags Position tags.
   * @returns Permission hints.
   */
  permissionHints(tags: string[]): string[] {
    const normalized = tags.map((tag) => tag.toUpperCase());
    const hints = new Set<string>(['dashboard:read']);
    if (normalized.includes('OWNER')) hints.add('tenant:manage');
    if (normalized.includes('FINANCE')) hints.add('billing:read');
    if (normalized.includes('PROJECT_MANAGER')) hints.add('project:manage');
    if (normalized.includes('BID_MANAGER')) hints.add('tender:manage');
    return [...hints];
  }

  /**
   * Removes one tag from a user safely.
   *
   * @param userId User id.
   * @param tag Position tag.
   * @returns Updated tags.
   */
  remove(userId: string, tag: string): { tags: string[]; userId: string } {
    const current = this.get(userId);
    const tags = current.filter((item) => item !== tag.toUpperCase());
    const existing = this.assignments.get(userId);
    if (existing) this.assignments.set(userId, { ...existing, tags });
    return { tags, userId };
  }

  /**
   * Builds audit metadata for position changes.
   *
   * @param userId User id.
   * @returns Audit row.
   */
  toAudit(userId: string): Record<string, string> {
    const row = this.assignments.get(userId);
    if (!row) throw new BusinessError({ code: ErrorCodes.TENANT_NOT_FOUND.code, message: 'Position assignment is not found.' });
    return { action: 'USER_POSITION_TAG_ASSIGN', tags: row.tags.join(','), tenantId: row.tenantId, userId };
  }

  private validate(userId: string, tags: string[], tenantId: string): void {
    if (!userId || !tenantId || tags.length === 0) {
      throw new BusinessError({ code: ErrorCodes.AUTH_LOGIN_PASSWORD_INVALID.code, message: 'Position tag assignment is invalid.' });
    }
  }
}
