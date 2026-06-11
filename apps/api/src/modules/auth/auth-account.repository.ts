import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient, TenantStatus, TenantType, UserRole, UserStatus } from '@prisma/client';
import { BusinessError, ErrorCodes } from '@tongqian/errors';
import bcrypt from 'bcryptjs';

import type { RegistrationInput, RegistrationResult, RegistrationRole } from './registration/registration-types.js';

export interface AuthAccountRecord {
  defaultDashboard: string;
  name: string;
  passwordHash: string;
  phone: string;
  platformRole?: string;
  positionTags: string[];
  role: RegistrationRole;
  status: 'active' | 'deleted' | 'suspended';
  tenantId: string;
  tenantStatus: RegistrationResult['status'] | 'rejected' | 'suspended';
  userId: string;
}

export interface AuthAccountRegistrationInput extends RegistrationInput {
  approvalRequired: boolean;
  defaultDashboard: string;
  password?: string;
  status: RegistrationResult['status'];
}

const TENANT_TYPE_BY_ROLE: Record<RegistrationRole, TenantType> = {
  AGENT: TenantType.AGENT,
  BUILDING_COMPANY_USER: TenantType.BUILDING_COMPANY,
  GOV_USER: TenantType.GOV,
  PLATFORM: TenantType.PLATFORM,
};

const TENANT_STATUS_BY_REGISTRATION: Record<RegistrationResult['status'], TenantStatus> = {
  active: TenantStatus.active,
  pending_review: TenantStatus.pending_review,
  training: TenantStatus.training,
};

const USER_ROLE_BY_REGISTRATION: Record<RegistrationRole, UserRole> = {
  AGENT: UserRole.AGENT,
  BUILDING_COMPANY_USER: UserRole.BUILDING_COMPANY_USER,
  GOV_USER: UserRole.GOV_USER,
  PLATFORM: UserRole.PLATFORM,
};

@Injectable()
export class AuthAccountRepository {
  constructor(@Inject(PrismaClient) private readonly prisma: PrismaClient) {}

  async createRegisteredAccount(input: AuthAccountRegistrationInput): Promise<RegistrationResult> {
    const phone = this.normalizePhone(input.phone);
    const passwordHash = this.createPasswordHash(input);
    const existing = await this.findByPhone(phone);
    if (existing) {
      throw new BusinessError({ code: ErrorCodes.FRAUD_RISK_DETECTED.code, details: { phoneMasked: this.maskPhone(phone) }, message: 'AUTH.REGISTER.PHONE_ALREADY_EXISTS' });
    }
    if (input.socialCreditCode) {
      const tenant = await this.prisma.tenant.findFirst({ where: { socialCreditCode: input.socialCreditCode }, select: { id: true } });
      if (tenant) {
        throw new BusinessError({ code: ErrorCodes.FRAUD_RISK_DETECTED.code, details: { socialCreditCodeTail: input.socialCreditCode.slice(-4) }, message: 'AUTH.REGISTER.TENANT_ALREADY_EXISTS' });
      }
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: input.name,
          socialCreditCode: input.socialCreditCode,
          status: TENANT_STATUS_BY_REGISTRATION[input.status],
          type: TENANT_TYPE_BY_ROLE[input.role],
        },
        select: { id: true },
      });
      const user = await tx.user.create({
        data: {
          name: input.name,
          passwordHash,
          phone,
          primaryRole: USER_ROLE_BY_REGISTRATION[input.role],
          status: UserStatus.active,
          tenantId: tenant.id,
        },
        select: { id: true },
      });
      return { tenantId: tenant.id, userId: user.id };
    });

    return {
      approvalRequired: input.approvalRequired,
      defaultDashboard: input.defaultDashboard,
      status: input.status,
      tenantId: created.tenantId,
      userId: created.userId,
    };
  }

  async findByPhone(phone: string): Promise<AuthAccountRecord | undefined> {
    const normalizedPhone = this.normalizePhone(phone);
    const user = await this.prisma.user.findUnique({
      select: {
        id: true,
        name: true,
        passwordHash: true,
        phone: true,
        platformRole: true,
        positionTags: true,
        primaryRole: true,
        status: true,
        tenantId: true,
      },
      where: { phone: normalizedPhone },
    });
    if (!user) return undefined;
    const tenant = await this.prisma.tenant.findUnique({ select: { status: true }, where: { id: user.tenantId } });
    return {
      defaultDashboard: this.defaultDashboard(user.primaryRole as RegistrationRole, user.platformRole ?? undefined, user.positionTags),
      name: user.name,
      passwordHash: user.passwordHash,
      phone: user.phone,
      platformRole: user.platformRole ?? undefined,
      positionTags: user.positionTags,
      role: user.primaryRole as RegistrationRole,
      status: user.status,
      tenantId: user.tenantId,
      tenantStatus: tenant?.status ?? 'suspended',
      userId: user.id,
    };
  }

  verifyPassword(passwordHash: string, password: string): boolean {
    const parts = passwordHash.split(':');
    if (parts.length !== 4 || parts[0] !== 'bcrypt' || parts[1] !== 'v1') return false;
    const hash = parts[3];
    return Boolean(hash && bcrypt.compareSync(password, hash));
  }

  private createPasswordHash(input: AuthAccountRegistrationInput): string {
    const password = input.password?.trim();
    if (password) {
      if (password.length < 8) {
        throw new BusinessError({ code: ErrorCodes.AUTH_LOGIN_PASSWORD_INVALID.code, details: { minLength: 8 }, message: 'AUTH.REGISTER.PASSWORD_TOO_SHORT' });
      }
      return this.hashPassword(password);
    }
    if (process.env.NODE_ENV !== 'production' && input.smsCode === '000000') {
      return this.hashPassword(randomUUID());
    }
    throw new BusinessError({ code: ErrorCodes.AUTH_LOGIN_PASSWORD_INVALID.code, message: 'AUTH.REGISTER.CREDENTIAL_REQUIRED' });
  }

  private defaultDashboard(role: RegistrationRole, platformRole?: string, positionTags: string[] = []): string {
    if (role === 'PLATFORM' || platformRole) return 'admin';
    if (role === 'AGENT') return 'agent';
    if (role === 'GOV_USER') return 'gov';
    if (positionTags.includes('FIN_DIRECTOR')) return 'finance';
    if (positionTags.some((tag) => tag.startsWith('PM'))) return 'pm';
    if (positionTags.includes('TENDER_WRITER')) return 'tender_writer';
    return 'owner';
  }

  private hashPassword(password: string): string {
    const cost = 12;
    const hash = bcrypt.hashSync(password, cost);
    return `bcrypt:v1:${cost}:${hash}`;
  }

  private maskPhone(phone: string): string {
    return phone.replace(/(\d{3})\d{4}(\d{4})/u, '$1****$2');
  }

  private normalizePhone(phone: string): string {
    const normalized = phone.trim();
    if (!/^1[3-9]\d{9}$/u.test(normalized)) {
      throw new BusinessError({ code: ErrorCodes.AUTH_LOGIN_PASSWORD_INVALID.code, details: { phoneMasked: normalized.slice(0, 3) }, message: 'AUTH.LOGIN.PHONE_INVALID' });
    }
    return normalized;
  }
}
