import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

interface InviteRecord {
  acceptedAt?: string;
  inviteId: string;
  inviterUserId?: string;
  phone: string;
  positionTags: string[];
  rewardCredits: number;
  tenantId: string;
}

@Injectable()
export class UserInviteService {
  private readonly invites = new Map<string, InviteRecord>();

  /**
   * Creates a tenant-scoped user invitation with reward estimate.
   *
   * @param input Invite request.
   * @returns Invite summary.
   */
  invite(input: { inviterUserId?: string; phone: string; positionTags: string[]; tenantId: string }): { inviteId: string; phone: string; positionTags: string[]; rewardCredits: number } {
    this.validate(input);
    const existing = this.findPendingByPhone(input.tenantId, input.phone);
    if (existing) return { inviteId: existing.inviteId, phone: existing.phone, positionTags: existing.positionTags, rewardCredits: existing.rewardCredits };
    const inviteId = crypto.randomUUID();
    const rewardCredits = this.calculateRewardCredits(this.kFactor(input.tenantId), input.positionTags);
    this.invites.set(inviteId, { ...input, inviteId, rewardCredits });
    return { inviteId, phone: input.phone, positionTags: input.positionTags, rewardCredits };
  }

  /**
   * Accepts an invitation idempotently and returns assigned tags.
   *
   * @param inviteId Invite id.
   * @param userId Newly created user id.
   * @returns Accepted invite.
   */
  accept(inviteId: string, userId: string): InviteRecord & { userId: string } {
    if (!userId) throw new BusinessError({ code: ErrorCodes.AUTH_LOGIN_PASSWORD_INVALID.code, message: 'Invite acceptance requires user id.' });
    const invite = this.get(inviteId);
    if (!invite.acceptedAt) invite.acceptedAt = new Date().toISOString();
    return { ...invite, userId };
  }

  /**
   * Gets an invitation by id.
   *
   * @param inviteId Invite id.
   * @returns Invite record.
   */
  get(inviteId: string): InviteRecord {
    const invite = this.invites.get(inviteId);
    if (!invite) throw new BusinessError({ code: ErrorCodes.TENANT_NOT_FOUND.code, message: 'Invite is not found.' });
    return invite;
  }

  /**
   * Lists tenant invitations for admin and owner views.
   *
   * @param tenantId Tenant id.
   * @returns Tenant invite records.
   */
  list(tenantId: string): InviteRecord[] {
    if (!tenantId) throw new BusinessError({ code: ErrorCodes.TENANT_NOT_FOUND.code, message: 'Invite list requires tenant scope.' });
    return [...this.invites.values()].filter((invite) => invite.tenantId === tenantId);
  }

  /**
   * Calculates the invite K factor based on accepted invites.
   *
   * @param tenantId Tenant id.
   * @returns Viral K factor.
   */
  kFactor(tenantId: string): number {
    const rows = this.list(tenantId);
    if (rows.length === 0) return 1;
    return Math.round((rows.filter((row) => row.acceptedAt).length / rows.length) * 100) / 100;
  }

  /**
   * Builds audit metadata for invite lifecycle events.
   *
   * @param inviteId Invite id.
   * @param action Audit action.
   * @returns Audit row.
   */
  toAudit(inviteId: string, action: 'accept' | 'create'): Record<string, number | string | undefined> {
    const invite = this.get(inviteId);
    return { action: `USER_INVITE_${action.toUpperCase()}`, inviteId, phoneMasked: invite.phone.replace(/(\d{3})\d{4}(\d{4})/u, '$1****$2'), rewardCredits: invite.rewardCredits, tenantId: invite.tenantId };
  }

  private calculateRewardCredits(kFactor: number, tags: string[]): number {
    const base = tags.includes('OWNER') ? 100 : 30;
    return Math.min(Math.round(base * Math.max(kFactor, 1)), 300);
  }

  private findPendingByPhone(tenantId: string, phone: string): InviteRecord | undefined {
    return [...this.invites.values()].find((invite) => invite.tenantId === tenantId && invite.phone === phone && !invite.acceptedAt);
  }

  private validate(input: { phone: string; positionTags: string[]; tenantId: string }): void {
    if (!input.tenantId || !/^1[3-9]\d{9}$/u.test(input.phone) || input.positionTags.length === 0) {
      throw new BusinessError({ code: ErrorCodes.AUTH_LOGIN_PASSWORD_INVALID.code, message: 'Invite input is invalid.' });
    }
  }
}
