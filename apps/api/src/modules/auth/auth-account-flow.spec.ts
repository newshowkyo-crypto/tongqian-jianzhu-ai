import assert from 'node:assert/strict';
import test from 'node:test';
import 'reflect-metadata';

import { BusinessError } from '@tongqian/errors';

import { AuthAccountRepository } from './auth-account.repository.js';
import { JwtTokenService } from './login/jwt.service.js';
import { LockoutService } from './login/lockout.service.js';
import { LoginService } from './login/login.service.js';
import { TwoFactorService } from './login/two-factor.service.js';
import { AgentRegistrationService } from './registration/agent-registration.service.js';
import { AttributionService } from './registration/attribution.service.js';
import { BuildingCompanyRegistrationService } from './registration/building-company-registration.service.js';
import { ConflictDetectorService } from './registration/conflict-detector.service.js';
import { DomainRouterService } from './registration/domain-router.service.js';
import { GovRegistrationService } from './registration/gov-registration.service.js';
import { UnifiedRegistrationService } from './registration/unified-registration.service.js';

interface MemoryTenant {
  id: string;
  socialCreditCode?: string;
  status: 'active' | 'pending_review' | 'rejected' | 'suspended' | 'training';
}

interface MemoryUser {
  id: string;
  name: string;
  passwordHash: string;
  phone: string;
  platformRole: string | null;
  positionTags: string[];
  primaryRole: 'AGENT' | 'BUILDING_COMPANY_USER' | 'GOV_USER' | 'PLATFORM';
  status: 'active' | 'deleted' | 'suspended';
  tenantId: string;
}

class MemoryPrisma {
  readonly tenants = new Map<string, MemoryTenant>();
  readonly users = new Map<string, MemoryUser>();

  readonly tenant = {
    create: async ({ data, select }: { data: MemoryTenant; select: { id: true } }): Promise<{ id: string }> => {
      const id = crypto.randomUUID();
      this.tenants.set(id, { ...data, id });
      return select.id ? { id } : { id };
    },
    findFirst: async ({ where, select }: { select: { id: true }; where: { socialCreditCode?: string } }): Promise<{ id: string } | null> => {
      for (const tenant of this.tenants.values()) {
        if (tenant.socialCreditCode && tenant.socialCreditCode === where.socialCreditCode) return select.id ? { id: tenant.id } : { id: tenant.id };
      }
      return null;
    },
    findUnique: async ({ where }: { select: { status: true }; where: { id: string } }): Promise<{ status: MemoryTenant['status'] } | null> => {
      const tenant = this.tenants.get(where.id);
      return tenant ? { status: tenant.status } : null;
    },
  };

  readonly user = {
    create: async ({ data, select }: { data: Omit<MemoryUser, 'id' | 'platformRole' | 'positionTags'>; select: { id: true } }): Promise<{ id: string }> => {
      const id = crypto.randomUUID();
      this.users.set(data.phone, { ...data, id, platformRole: null, positionTags: [] });
      return select.id ? { id } : { id };
    },
    findUnique: async ({ where }: { where: { phone: string } }): Promise<MemoryUser | null> => this.users.get(where.phone) ?? null,
  };

  async $transaction<T>(fn: (tx: MemoryPrisma) => Promise<T>): Promise<T> {
    return fn(this);
  }
}

function build(): { login: LoginService; registration: UnifiedRegistrationService; twoFactor: TwoFactorService } {
  const prisma = new MemoryPrisma();
  const accounts = new AuthAccountRepository(prisma as never);
  const twoFactor = new TwoFactorService();
  return {
    login: new LoginService(accounts, new JwtTokenService(), new LockoutService(), twoFactor),
    registration: new UnifiedRegistrationService(
      new AgentRegistrationService(),
      accounts,
      new BuildingCompanyRegistrationService(new AttributionService()),
      new ConflictDetectorService(),
      new DomainRouterService(),
      new GovRegistrationService(),
    ),
    twoFactor,
  };
}

test('building company registration persists an account that can log in with password', async () => {
  const { login, registration } = build();
  const registered = await registration.register({
    name: '湖北同乾建设有限公司',
    password: 'Passw0rd!',
    phone: '13900010001',
    role: 'BUILDING_COMPANY_USER',
    socialCreditCode: '91420100MA4K3ABCD1',
  } as never);

  const result = await login.login({ password: 'Passw0rd!', phone: '13900010001' });
  assert.equal(result.userId, registered.userId);
  assert.equal(result.tenantId, registered.tenantId);
  assert.equal(result.defaultDashboard, 'owner');
});

test('unregistered phone cannot log in with arbitrary password', async () => {
  const { login } = build();
  await assert.rejects(
    () => login.login({ password: 'Passw0rd!', phone: '13900010002' }),
    (err: unknown) => err instanceof BusinessError,
  );
});

test('wrong password increments lockout and blocks after five attempts', async () => {
  const { login, registration } = build();
  await registration.register({ name: '武汉样例建筑', password: 'Passw0rd!', phone: '13900010003', role: 'BUILDING_COMPANY_USER' } as never);

  for (let index = 0; index < 5; index += 1) {
    await assert.rejects(() => login.login({ password: 'wrong-password', phone: '13900010003' }), BusinessError);
  }
  await assert.rejects(() => login.login({ password: 'Passw0rd!', phone: '13900010003' }), BusinessError);
});

test('development SMS mock works only outside production', async () => {
  const oldEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'test';
  try {
    const { login, registration } = build();
    await registration.register({ name: '短信测试企业', phone: '13900010004', role: 'BUILDING_COMPANY_USER', smsCode: '000000' });
    const result = await login.login({ phone: '13900010004', smsCode: '000000' });
    assert.equal(result.defaultDashboard, 'owner');
  } finally {
    if (oldEnv === undefined) {
      Reflect.deleteProperty(process.env, 'NODE_ENV');
    } else {
      process.env.NODE_ENV = oldEnv;
    }
  }
});

test('production login rejects universal SMS mock code', async () => {
  const oldEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try {
    const { login, registration } = build();
    await registration.register({ name: '生产短信测试企业', password: 'Passw0rd!', phone: '13900010005', role: 'BUILDING_COMPANY_USER' } as never);
    await assert.rejects(() => login.login({ phone: '13900010005', smsCode: '000000' }), BusinessError);
  } finally {
    if (oldEnv === undefined) {
      Reflect.deleteProperty(process.env, 'NODE_ENV');
    } else {
      process.env.NODE_ENV = oldEnv;
    }
  }
});
