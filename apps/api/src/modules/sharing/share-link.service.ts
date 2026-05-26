import { Injectable } from '@nestjs/common';

@Injectable()
export class ShareLinkService {
  createShareLink(resourceType: string, resourceId: string, options?: { maxReads?: number; ttlHours?: number }): string {
    const ttlHours = options?.ttlHours ?? 24;
    const token = crypto.randomUUID().replaceAll('-', '').slice(0, 16);
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString();
    const auditLog = { action: 'share_link_created', expiresAt, resourceId, resourceType };
    void auditLog;
    return `/share/${token}`;
  }
}
