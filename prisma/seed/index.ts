import { randomUUID } from 'node:crypto';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const now = new Date();
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

async function seedTenantsAndUsers() {
  const tenants = [
    ...Array.from({ length: 10 }, (_, index) => ({
      id: randomUUID(),
      name: `同乾演示建筑企业 ${index + 1}`,
      type: 'BUILDING_COMPANY',
      role: 'BUILDING_COMPANY_USER',
      phone: `13900010${String(index + 1).padStart(2, '0')}`,
    })),
    ...Array.from({ length: 5 }, (_, index) => ({
      id: randomUUID(),
      name: `同乾智能管家工作室 ${index + 1}`,
      type: 'AGENT',
      role: 'AGENT',
      phone: `13900020${String(index + 1).padStart(2, '0')}`,
    })),
    ...Array.from({ length: 3 }, (_, index) => ({
      id: randomUUID(),
      name: `政企协同单位 ${index + 1}`,
      type: 'GOV',
      role: 'GOV_USER',
      phone: `13900030${String(index + 1).padStart(2, '0')}`,
    })),
    {
      id: randomUUID(),
      name: '同乾平台运营',
      type: 'PLATFORM',
      role: 'PLATFORM',
      phone: '13900039999',
    },
  ];

  const users = tenants.map((tenant, index) => ({
    id: randomUUID(),
    tenantId: tenant.id,
    phone: tenant.phone,
    name: `${tenant.name} 用户`,
    role: tenant.role,
    index,
  }));

  for (const tenant of tenants) {
    await prisma.$executeRaw`
      INSERT INTO tenants (id, type, name, status, created_at, updated_at)
      VALUES (${tenant.id}::uuid, ${tenant.type}::"TenantType", ${tenant.name}, 'active'::"TenantStatus", ${now}, ${now})
      ON CONFLICT (id) DO NOTHING
    `;
  }

  for (const user of users) {
    await prisma.$executeRaw`
      INSERT INTO users (id, tenant_id, phone, password_hash, name, primary_role, position_tags, status, created_at)
      VALUES (${user.id}::uuid, ${user.tenantId}::uuid, ${user.phone}, 'dev-seed-password-hash', ${user.name}, ${user.role}::"UserRole", ARRAY[]::TEXT[], 'active'::"UserStatus", ${now})
      ON CONFLICT (phone) DO NOTHING
    `;
  }

  return { tenants, users };
}

async function seedAgents(users: Awaited<ReturnType<typeof seedTenantsAndUsers>>['users']) {
  const agentUsers = users.filter((user) => user.role === 'AGENT');

  for (const [index, user] of agentUsers.entries()) {
    await prisma.$executeRaw`
      INSERT INTO agent_profiles (id, user_id, tenant_id, subtype, region, promo_code, activity_status, trained_at, is_blacklisted)
      VALUES (${randomUUID()}::uuid, ${user.id}, ${user.tenantId}, 'construction_runner', ${['上海', '江苏', '浙江', '安徽', '山东'][index]}, ${`TQAGENT${index + 1}`}, 'active', ${now}, false)
      ON CONFLICT (user_id) DO NOTHING
    `;
    await prisma.$executeRaw`
      INSERT INTO reputation_scores (id, entity_id, entity_type, score, level, created_at, updated_at)
      VALUES (${randomUUID()}::uuid, ${user.id}, 'agent', ${620 + index * 45}, ${index >= 3 ? 'LV5' : index >= 1 ? 'LV4' : 'LV3'}, ${now}, ${now})
      ON CONFLICT (entity_id, entity_type) DO NOTHING
    `;
  }
}

async function seedOpportunities() {
  for (let index = 0; index < 50; index += 1) {
    const title = `长三角市政与房建机会 ${String(index + 1).padStart(2, '0')}`;
    await prisma.$executeRaw`
      INSERT INTO opportunities (id, title, source, region, industry, amount_estimate, owner_name, publish_date, deadline, raw_url, meta, created_at)
      VALUES (
        ${randomUUID()}::uuid,
        ${title},
        'mock-provider',
        ${['上海', '江苏', '浙江', '安徽', '山东'][index % 5]},
        ${index % 2 === 0 ? '市政工程' : '房建工程'},
        ${(80 + index * 9) * 10000},
        ${`业主单位 ${index + 1}`},
        ${now},
        ${index % 3 === 0 ? tomorrow : nextWeek},
        ${`https://example.test/opportunities/${index + 1}`},
        ${JSON.stringify({ mock: true, stage: 'm2-e2e' })}::jsonb,
        ${now}
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }
}

async function seedContracts(users: Awaited<ReturnType<typeof seedTenantsAndUsers>>['users']) {
  const ownerUsers = users.filter((user) => user.role === 'BUILDING_COMPANY_USER').slice(0, 5);

  for (const [index, user] of ownerUsers.entries()) {
    await prisma.$executeRaw`
      INSERT INTO contract_reviews (
        id, tenant_id, user_id, type, contract_url, contract_type, project_amount,
        ai_task_id, report_id, overall_risk, finding_count, red_count, yellow_count,
        green_count, status, created_at
      )
      VALUES (
        ${randomUUID()}::uuid,
        ${user.tenantId},
        ${user.id},
        'construction_contract',
        ${`minio://mock/contracts/${index + 1}.pdf`},
        ${index % 2 === 0 ? '施工总承包' : '专业分包'},
        ${(300 + index * 120) * 10000},
        ${`seed-ai-task-contract-${index + 1}`},
        ${`seed-report-${index + 1}`},
        ${index % 2 === 0 ? 'yellow' : 'red'},
        ${4 + index},
        ${index % 2},
        ${2 + index},
        1,
        'completed',
        ${now}
      )
      ON CONFLICT (ai_task_id) DO NOTHING
    `;
  }
}

async function seedSystemConfigs() {
  const configs = [
    ['credentials.payment.wechat', { mode: 'mock' }, 'credentials', '微信支付开发期 mock provider'],
    ['credentials.storage.oss', { mode: 'mock' }, 'credentials', '对象存储开发期 mock provider'],
    ['ai.provider.deepseek', { mode: 'real', health: 'ready' }, 'ai', 'P0 AI key verified outside seed'],
    ['feature.partner.enabled', false, 'feature_flag', 'M1-M3 关闭 PARTNER'],
  ] as const;

  for (const [key, value, category, description] of configs) {
    await prisma.$executeRaw`
      INSERT INTO system_configs (id, key, value, description, category, is_active, is_overridable, created_at, updated_at)
      VALUES (${randomUUID()}::uuid, ${key}, ${JSON.stringify(value)}::jsonb, ${description}, ${category}, true, true, ${now}, ${now})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, category = EXCLUDED.category, updated_at = EXCLUDED.updated_at
    `;
  }
}

async function main(): Promise<void> {
  const seeded = await seedTenantsAndUsers();
  await seedAgents(seeded.users);
  await seedOpportunities();
  await seedContracts(seeded.users);
  await seedSystemConfigs();
  console.log('Prisma seed completed: 10 users, 5 agents, 3 gov users, 50 opportunities, 5 contracts.');
}

void main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
