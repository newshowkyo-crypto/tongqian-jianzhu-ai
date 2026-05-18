import { Injectable } from '@nestjs/common';

@Injectable()
export class UserInviteService {
  private readonly invites = new Map<string, { phone: string; positionTags: string[]; tenantId: string }>();

  invite(input: { phone: string; positionTags: string[]; tenantId: string }): { inviteId: string; phone: string; positionTags: string[] } {
    const inviteId = crypto.randomUUID();
    this.invites.set(inviteId, input);
    return { inviteId, phone: input.phone, positionTags: input.positionTags };
  }
}
