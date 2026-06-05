import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export type CredentialMode = 'mock' | 'real';

export interface SecretRow {
  category: string;
  healthStatus: string;
  key: string;
  lastSwitchedAt: Date | null;
  lastTestedAt: Date | null;
  maskedValue: string | null;
  mode: string;
  provider: string;
  schema?: unknown;
  updatedAt: Date;
}

export interface CredentialAuditRow {
  action: string;
  createdAt: Date;
  id: string;
  meta: unknown;
  resourceId: string | null;
  traceId: string;
}

/**
 * Data access for admin credential management. All persistence for the
 * `secrets` and `audit_logs` tables goes through here via the Prisma ORM —
 * no raw SQL, no controller-level DB access (database-conventions.md §20).
 */
@Injectable()
export class CredentialsAdminRepository {
  constructor(@Inject(PrismaClient) private readonly prisma: PrismaClient) {}

  async list(limit = 100): Promise<SecretRow[]> {
    return this.prisma.secret.findMany({
      orderBy: [{ category: 'asc' }, { provider: 'asc' }, { key: 'asc' }],
      select: {
        category: true,
        healthStatus: true,
        key: true,
        lastSwitchedAt: true,
        lastTestedAt: true,
        maskedValue: true,
        mode: true,
        provider: true,
        updatedAt: true,
      },
      take: limit,
    });
  }

  async findByKey(key: string): Promise<SecretRow | null> {
    return this.prisma.secret.findUnique({
      select: {
        category: true,
        healthStatus: true,
        key: true,
        lastSwitchedAt: true,
        lastTestedAt: true,
        maskedValue: true,
        mode: true,
        provider: true,
        schema: true,
        updatedAt: true,
      },
      where: { key },
    });
  }

  async upsert(input: { encryptedValue: string; healthStatus: string; key: string; maskedValue: string; mode: CredentialMode; provider: string }): Promise<void> {
    const now = new Date();
    await this.prisma.secret.upsert({
      create: {
        category: 'manual',
        encrypted: input.encryptedValue,
        healthStatus: input.healthStatus,
        key: input.key,
        kmsLevel: 'dev',
        lastSwitchedAt: now,
        lastTestedAt: now,
        maskedValue: input.maskedValue,
        mode: input.mode,
        provider: input.provider,
        schema: {},
      },
      update: {
        encrypted: input.encryptedValue,
        healthStatus: input.healthStatus,
        maskedValue: input.maskedValue,
        mode: input.mode,
        provider: input.provider,
      },
      where: { key: input.key },
    });
  }

  async switchMode(keyOrProvider: string, mode: CredentialMode, healthStatus: string): Promise<void> {
    await this.prisma.secret.updateMany({
      data: { healthStatus, lastSwitchedAt: new Date(), mode },
      where: { OR: [{ key: keyOrProvider }, { provider: keyOrProvider }] },
    });
  }

  async markTested(keyOrProvider: string): Promise<void> {
    const rows = await this.prisma.secret.findMany({
      select: { key: true, mode: true },
      where: { OR: [{ key: keyOrProvider }, { provider: keyOrProvider }] },
    });
    await Promise.all(
      rows.map((row) =>
        this.prisma.secret.update({
          data: { healthStatus: row.mode === 'real' ? 'ok' : 'mock', lastTestedAt: new Date() },
          where: { key: row.key },
        }),
      ),
    );
  }

  async listAudit(key: string, limit = 20): Promise<CredentialAuditRow[]> {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      select: { action: true, createdAt: true, id: true, meta: true, resourceId: true, traceId: true },
      take: limit,
      where: { resource: 'admin/credentials', resourceId: key },
    });
  }

  async writeAudit(input: { action: string; key: string; meta: Record<string, unknown>; userAgent: string }): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        action: input.action,
        ip: '127.0.0.1',
        meta: { kmsLevel: 'dev', ...input.meta },
        resource: 'admin/credentials',
        resourceId: input.key,
        resourceType: 'secret',
        traceId: randomUUID(),
        userAgent: input.userAgent,
      },
    });
  }
}
