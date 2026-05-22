import { randomUUID } from 'node:crypto';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const permissionPoints = [
  'contract:view', 'contract:create', 'contract:update', 'contract:delete', 'contract:approve', 'contract:review', 'contract:export',
  'subscription:view', 'subscription:upgrade', 'subscription:cancel', 'subscription:reactivate', 'subscription-invoice:view',
  'credit:view', 'credit:top-up', 'credit:gift', 'credit:refund',
  'dispatch:view', 'dispatch:create', 'dispatch:accept', 'dispatch:quote', 'dispatch:assign', 'dispatch:takeover',
  'data-export:trigger', 'data-export:approve', 'data-export:download',
  'withdrawal:request', 'withdrawal:approve', 'withdrawal:reject',
  'appeal:create', 'appeal:decide:initial', 'appeal:decide:risk', 'appeal:decide:final',
  'prompt:view', 'prompt:edit', 'model-route:view', 'model-route:edit', 'rule:view', 'rule:review',
  'reputation:view', 'reputation:adjust', 'system-config:view', 'system-config:edit', 'tenant:review', 'audit-log:view',
  'admin:ingest:run',
];

const rolePermissionMap: Record<string, string[]> = {
  OWNER: ['contract:approve', 'subscription:cancel', 'data-export:approve', 'withdrawal:approve'],
  PLATFORM_OWNER: permissionPoints,
  FIN: ['credit:view', 'credit:refund', 'subscription-invoice:view', 'withdrawal:approve', 'withdrawal:reject', 'audit-log:view'],
  RISK: ['contract:review', 'rule:review', 'appeal:decide:risk', 'reputation:adjust', 'audit-log:view'],
  EXPERT: ['contract:review', 'rule:review', 'prompt:view'],
  CSM: ['tenant:review', 'dispatch:view', 'appeal:decide:initial', 'reputation:view'],
};

const credentialSeeds = [
  ['WECHAT_PAY_MCH_ID', 'wechat_pay', 'payment'],
  ['WECHAT_PAY_API_KEY', 'wechat_pay', 'payment'],
  ['WECHAT_PAY_CERT_PATH', 'wechat_pay', 'payment'],
  ['WECHAT_MP_APP_ID', 'wechat_mp', 'notification'],
  ['WECHAT_MP_APP_SECRET', 'wechat_mp', 'notification'],
  ['WECHAT_WORK_AGENT_ID', 'wechat_work', 'notification'],
  ['WECHAT_WORK_SECRET', 'wechat_work', 'notification'],
  ['ALIPAY_APP_ID', 'alipay', 'payment'],
  ['ALIPAY_PRIVATE_KEY', 'alipay', 'payment'],
  ['ALIYUN_OSS_ACCESS_KEY_ID', 'aliyun_oss', 'storage'],
  ['ALIYUN_OSS_ACCESS_KEY_SECRET', 'aliyun_oss', 'storage'],
  ['ALIYUN_OSS_BUCKET', 'aliyun_oss', 'storage'],
  ['ALIYUN_OSS_REGION', 'aliyun_oss', 'storage'],
  ['ALIYUN_OCR_ENABLED', 'aliyun_ocr', 'data_collection'],
  ['ALIYUN_DOCMIND_ENABLED', 'aliyun_docmind', 'data_collection'],
  ['ALIYUN_SLS_PROJECT', 'aliyun_sls', 'storage'],
  ['ALIYUN_SLS_LOGSTORE', 'aliyun_sls', 'storage'],
  ['ALIYUN_SLS_ENDPOINT', 'aliyun_sls', 'storage'],
  ['ALIYUN_SMS_ACCESS_KEY_ID', 'aliyun_sms', 'notification'],
  ['ALIYUN_SMS_ACCESS_KEY_SECRET', 'aliyun_sms', 'notification'],
  ['ALIYUN_SMS_SIGN_NAME', 'aliyun_sms', 'notification'],
  ['ALIYUN_SMS_TEMPLATE_VERIFY', 'aliyun_sms', 'notification'],
  ['DASHVECTOR_API_KEY', 'dashvector', 'ai_model'],
  ['TIANYANCHA_API_KEY', 'tianyancha', 'data_collection'],
  ['ICP_RECORD_NO', 'icp', 'compliance'],
  ['ALIYUN_DASHSCOPE_API_KEY', 'dashscope', 'ai_model'],
  ['OPENROUTER_API_KEY', 'openrouter', 'ai_model'],
  ['DEEPSEEK_API_KEY', 'deepseek', 'ai_model'],
] as const;

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
      platformRole: 'PLATFORM_OWNER',
      phone: '13900039999',
    },
  ];

  const users = tenants.map((tenant, index) => ({
    id: randomUUID(),
    tenantId: tenant.id,
    phone: tenant.phone,
    name: `${tenant.name} 用户`,
    role: tenant.role,
    platformRole: 'platformRole' in tenant ? tenant.platformRole : undefined,
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
      INSERT INTO users (id, tenant_id, phone, password_hash, name, primary_role, platform_role, position_tags, status, created_at)
      VALUES (${user.id}::uuid, ${user.tenantId}::uuid, ${user.phone}, 'dev-seed-password-hash', ${user.name}, ${user.role}::"UserRole", ${user.platformRole}, ARRAY[]::TEXT[], 'active'::"UserStatus", ${now})
      ON CONFLICT (phone) DO NOTHING
    `;
  }

  const phones = users.map((user) => user.phone);
  const actualUsers = await prisma.$queryRaw<Array<{ id: string; index: number; name: string; phone: string; role: string; tenantId: string }>>`
    SELECT id::text, tenant_id::text AS "tenantId", phone, name, primary_role::text AS role, 0 AS index
    FROM users
    WHERE phone = ANY(${phones}::text[])
  `;

  return { tenants, users: actualUsers.map((user, index) => ({ ...user, index })) };
}

async function seedAgents(users: Awaited<ReturnType<typeof seedTenantsAndUsers>>['users']) {
  const agentUsers = users.filter((user) => user.role === 'AGENT');

  for (const [index, user] of agentUsers.entries()) {
    await prisma.$executeRaw`
      INSERT INTO agent_profiles (id, user_id, tenant_id, subtype, region, promo_code, activity_status, trained_at, is_blacklisted)
      VALUES (${randomUUID()}::uuid, ${user.id}, ${user.tenantId}, ${index === 0 ? 'AGENT_PARTNER' : 'AGENT_QUAL'}, ${['上海', '江苏', '浙江', '安徽', '山东'][index]}, ${`TQAGENT${index + 1}`}, 'active', ${now}, false)
      ON CONFLICT DO NOTHING
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
    ['permissions.platform_owner', { permissions: ['admin:ingest:run'], role: 'PLATFORM_OWNER' }, 'permissions', 'PLATFORM_OWNER can run M5 admin ingest jobs'],
  ] as const;

  for (const [key, value, category, description] of configs) {
    await prisma.$executeRaw`
      INSERT INTO system_configs (id, key, value, description, category, is_active, is_overridable, created_at, updated_at)
      VALUES (${randomUUID()}::uuid, ${key}, ${JSON.stringify(value)}::jsonb, ${description}, ${category}, true, true, ${now}, ${now})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, category = EXCLUDED.category, updated_at = EXCLUDED.updated_at
    `;
  }
}

async function seedM6Rbac() {
  for (const point of permissionPoints) {
    await prisma.$executeRaw`
      INSERT INTO permissions (id, code, name, description, created_at, updated_at)
      VALUES (${randomUUID()}::uuid, ${point}, ${point}, 'Seeded from packages/permissions permission points', ${now}, ${now})
      ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, updated_at = EXCLUDED.updated_at
    `;
  }

  for (const [role, grants] of Object.entries(rolePermissionMap)) {
    await prisma.$executeRaw`
      INSERT INTO roles (id, code, name, description, created_at, updated_at)
      VALUES (${randomUUID()}::uuid, ${role}, ${role}, 'M6 seeded RBAC role', ${now}, ${now})
      ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, updated_at = EXCLUDED.updated_at
    `;
    for (const permission of grants) {
      await prisma.$executeRaw`
        INSERT INTO role_permissions (id, role_id, permission_id, created_at)
        SELECT ${randomUUID()}::uuid, r.id, p.id, ${now}
        FROM roles r, permissions p
        WHERE r.code = ${role} AND p.code = ${permission}
        ON CONFLICT (role_id, permission_id) DO NOTHING
      `;
    }
  }
}

async function seedM6CredentialsAndMetrics() {
  for (const [key, provider, category] of credentialSeeds) {
    const isReal = key === 'DEEPSEEK_API_KEY' || key === 'ALIYUN_DASHSCOPE_API_KEY';
    await prisma.$executeRaw`
      INSERT INTO secrets (id, key, provider, category, mode, encrypted_value, masked_value, health_status, schema, kms_level, last_switched_at, last_tested_at, created_at, updated_at)
      VALUES (${randomUUID()}::uuid, ${key}, ${provider}, ${category}, ${isReal ? 'real' : 'mock'}, ${`dev-encrypted-placeholder:${key}`}, ${`${key.slice(0, 4)}****${key.slice(-4)}`}, ${isReal ? 'ok' : 'mock'}, ${JSON.stringify({ fields: ['value'], editable: true })}::jsonb, 'dev', ${now}, ${now}, ${now}, ${now})
      ON CONFLICT (key) DO UPDATE SET provider = EXCLUDED.provider, category = EXCLUDED.category, mode = EXCLUDED.mode, health_status = EXCLUDED.health_status, updated_at = EXCLUDED.updated_at
    `;
  }

  const metrics = ['api.qps.24h', 'api.latency.p95', 'ai.calls.today', 'ai.cost.today', 'worker.queue.depth', 'db.slow.query.ms', 'online.users', 'alerts.open'];
  for (let index = 0; index < 40; index += 1) {
    await prisma.$executeRaw`
      INSERT INTO metrics_snapshots (id, metric_key, metric_value, unit, dimensions, captured_at)
      VALUES (${randomUUID()}::uuid, ${metrics[index % metrics.length]}, ${(index + 1) * 1.7}, ${index % 2 === 0 ? 'count' : 'ms'}, ${JSON.stringify({ source: 'm6-seed', bucket: index % 8 })}::jsonb, ${new Date(now.getTime() - index * 60_000)})
    `;
  }
}

async function seedM6DemoRows(users: Awaited<ReturnType<typeof seedTenantsAndUsers>>['users']) {
  const ownerUsers = users.filter((user) => user.role === 'BUILDING_COMPANY_USER');
  for (let index = 0; index < 20; index += 1) {
    const user = ownerUsers[index % ownerUsers.length] ?? users[0];
    await prisma.$executeRaw`
      INSERT INTO tender_projects (id, tenant_id, user_id, name, region, industry, amount_estimate, source_file_url, status, meta, created_at)
      VALUES (${randomUUID()}::uuid, ${user.tenantId}, ${user.id}, ${`M6 demo tender project ${index + 1}`}, ${['湖北', '江苏', '广东', '四川'][index % 4]}, ${index % 2 === 0 ? 'municipal' : 'housing'}, ${(500 + index * 60) * 10000}, ${`minio://m6/tenders/${index + 1}.pdf`}, ${index < 5 ? 'active' : 'completed'}, ${JSON.stringify({ seed: 'm6', deadlineDays: index + 2 })}::jsonb, ${now})
    `;
  }

  for (let index = 5; index < 15; index += 1) {
    const user = ownerUsers[index % ownerUsers.length] ?? users[0];
    await prisma.$executeRaw`
      INSERT INTO contract_reviews (id, tenant_id, user_id, type, contract_url, contract_type, project_amount, ai_task_id, report_id, overall_risk, finding_count, red_count, yellow_count, green_count, status, created_at)
      VALUES (${randomUUID()}::uuid, ${user.tenantId}, ${user.id}, 'construction_contract', ${`minio://m6/contracts/${index + 1}.pdf`}, '施工总承包', ${(300 + index * 88) * 10000}, ${randomUUID()}::uuid::text, ${`m6-report-${index + 1}`}, ${index % 3 === 0 ? 'red' : 'yellow'}, ${5 + index}, ${index % 3}, ${2 + index}, 1, 'completed', ${now})
    `;
  }

  for (let index = 0; index < 10; index += 1) {
    const user = ownerUsers[index % ownerUsers.length] ?? users[0];
    await prisma.$executeRaw`
      INSERT INTO qualification_certificates (id, tenant_id, category, sub_type, level, cert_no, issued_at, valid_until, issuer, raw_image_url, status, meta, created_at, updated_at)
      VALUES (${randomUUID()}::uuid, ${user.tenantId}, 'construction', 'general-contracting', ${index % 3 === 0 ? '一级' : '二级'}, ${`M6-CERT-${String(index + 1).padStart(3, '0')}`}, ${new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)}, ${new Date(now.getTime() + (index < 3 ? 25 : 180 + index) * 24 * 60 * 60 * 1000)}, '住房城乡建设主管部门', ${`minio://m6/certs/${index + 1}.png`}, ${index < 3 ? 'expiring' : 'valid'}, ${JSON.stringify({ seed: 'm6', redLight: index < 3 })}::jsonb, ${now}, ${now})
      ON CONFLICT (cert_no) DO UPDATE SET valid_until = EXCLUDED.valid_until, status = EXCLUDED.status, updated_at = EXCLUDED.updated_at
    `;
  }

  for (let index = 0; index < 50; index += 1) {
    await prisma.$executeRaw`
      INSERT INTO ai_cost_logs (id, ai_task_id, input_tokens, output_tokens, input_cost_rmb, output_cost_rmb, total_cost_rmb, credits_charged, profit_rmb, cache_hit, created_at)
      VALUES (${randomUUID()}::uuid, ${randomUUID()}::uuid, ${900 + index * 10}, ${260 + index * 3}, 0.001200, 0.002400, 0.0036, ${30 + (index % 5) * 10}, 0.2964, ${index % 4 === 0}, ${new Date(now.getTime() - index * 2 * 60 * 60 * 1000)})
      ON CONFLICT (ai_task_id) DO NOTHING
    `;
  }

  for (let index = 0; index < 100; index += 1) {
    await prisma.$executeRaw`
      INSERT INTO audit_logs (id, tenant_id, user_id, action, resource, resource_type, resource_id, trace_id, before, after, ip, user_agent, meta, created_at)
      VALUES (${randomUUID()}::uuid, NULL, NULL, ${index % 10 === 0 ? 'manual-run' : `m6.audit.${index % 8}`}, ${index % 10 === 0 ? 'cron' : 'm6'}, 'm6', ${`m6-${index}`}, ${`m6-seed-${index}`}, NULL, ${JSON.stringify({ ok: true })}::jsonb, '127.0.0.1', 'm6-seed', ${JSON.stringify({ module: index % 10 === 0 ? 'cron' : 'admin' })}::jsonb, ${new Date(now.getTime() - index * 60_000)})
    `;
  }
}

async function seedM5IngestTables() {
  const traceId = `seed-m5-${randomUUID()}`;

  await prisma.$executeRaw`
    INSERT INTO regulations (id, source_key, title, level, authority, region, publish_date, source_url, raw_text, ai_summary, status, tenant_id, scope_type, project_id, owner_id, created_at, updated_at)
    VALUES (${randomUUID()}::uuid, 'seed-regulation-001', '住房城乡建设领域安全生产治本攻坚三年行动样例', 'national', '住房和城乡建设部', '全国', ${now}, 'https://example.gov.cn/regulations/seed-001', '建筑施工企业应完善安全生产责任体系、危大工程管理和隐患闭环整改。', '提取重点：安全责任、危大工程、隐患整改闭环，可用于风险审查与资质提醒。', 'published', 'platform-tenant', 'platform', 'm5-final', 'platform-owner', ${now}, ${now})
    ON CONFLICT (source_key) DO UPDATE SET ai_summary = EXCLUDED.ai_summary, updated_at = EXCLUDED.updated_at
  `;

  await prisma.$executeRaw`
    INSERT INTO tender_notices (id, source_key, title, project_type, region, owner_name, amount_estimate, deadline, source_url, raw_text, ai_summary, status, tenant_id, scope_type, project_id, owner_id, created_at, updated_at)
    VALUES (${randomUUID()}::uuid, 'seed-tender-001', '武汉东湖高新区市政道路改造工程施工总承包招标公告', 'municipal-road', '湖北武汉', '武汉东湖高新区建设管理中心', 32000000, ${nextWeek}, 'https://example.ggzy.cn/tender/seed-001', '项目要求市政公用工程施工总承包三级及以上资质，采用综合评估法。', '资质门槛清晰、金额中等、截止日期临近，适合机会雷达推送。', 'published', 'platform-tenant', 'platform', 'm5-final', 'platform-owner', ${now}, ${now})
    ON CONFLICT (source_key) DO UPDATE SET ai_summary = EXCLUDED.ai_summary, updated_at = EXCLUDED.updated_at
  `;

  await prisma.$executeRaw`
    INSERT INTO policy_funds (id, code, category, name_zh, name_short, authority, scope, amount_pool, apply_window, evaluation_points, doc_links, ai_summary, status, province, source_key, source_url, raw_text, rollout_pct, pinned, created_at, updated_at)
    VALUES (${randomUUID()}::uuid, 'M5-FUND-001', 'green-building', '绿色建造示范项目专项资金', '绿色建造资金', '省住建厅', ARRAY['绿色建造','建筑企业'], '单项目最高 300 万元', ${JSON.stringify({ start: '2026-06-01', end: '2026-08-31' })}::jsonb, ${JSON.stringify(['绿色施工方案', '数字化管理能力', '近三年信用记录'])}::jsonb, ARRAY['https://example.gov.cn/funds/seed-001'], '适合具备绿色施工能力和数字化项目管理记录的中小建筑企业申报。', 'published', '湖北', 'seed-policy-fund-001', 'https://example.gov.cn/funds/seed-001', '专项资金支持绿色建造试点、装配式施工和数字化工地。', 100, true, ${now}, ${now})
    ON CONFLICT (code) DO UPDATE SET ai_summary = EXCLUDED.ai_summary, source_key = EXCLUDED.source_key, updated_at = EXCLUDED.updated_at
  `;

  await prisma.$executeRaw`
    INSERT INTO standard_templates (id, source_key, category, name_zh, version, source_url, body, ai_summary, status, tenant_id, scope_type, project_id, owner_id, created_at, updated_at)
    VALUES (${randomUUID()}::uuid, 'seed-template-001', 'tender-authorization', '投标法人授权委托书标准模板', '2026-v1', 'https://example.doc.cn/templates/seed-001', '授权委托书应列明项目名称、投标单位、授权期限、被授权人身份证明及签章页。', '用于标书工厂生成授权委托书，需人工核对项目名称与授权期限。', 'published', 'platform-tenant', 'platform', 'm5-final', 'platform-owner', ${now}, ${now})
    ON CONFLICT (source_key) DO UPDATE SET ai_summary = EXCLUDED.ai_summary, updated_at = EXCLUDED.updated_at
  `;

  await prisma.$executeRaw`
    INSERT INTO court_judgments (id, source_key, case_no, court, cause, judgment_date, source_url, summary, risk_tags, raw_text, status, tenant_id, scope_type, project_id, owner_id, created_at, updated_at)
    VALUES (${randomUUID()}::uuid, 'seed-judgment-001', '(2025)鄂01民终1001号', '湖北省武汉市中级人民法院', '建设工程施工合同纠纷', ${now}, 'https://example.court.gov.cn/judgment/seed-001', '法院认为工程量签证、付款节点和竣工验收资料构成结算核心证据链。', ARRAY['payment','variation','evidence'], '裁判要旨：承包人应保存签证、会议纪要、验收记录等证据。', 'published', 'platform-tenant', 'platform', 'm5-final', 'platform-owner', ${now}, ${now})
    ON CONFLICT (source_key) DO UPDATE SET summary = EXCLUDED.summary, updated_at = EXCLUDED.updated_at
  `;

  await prisma.$executeRaw`
    INSERT INTO company_profiles (id, source_key, credit_code, name, region, industry, legal_person, risk_score, profile, source_url, status, tenant_id, scope_type, project_id, owner_id, created_at, updated_at)
    VALUES (${randomUUID()}::uuid, 'seed-company-001', '91420100M5FINAL01X', '湖北同乾示范建设有限公司', '湖北武汉', '建筑工程', '张示范', 18, ${JSON.stringify({ qualification: '建筑工程施工总承包二级', tenderPreference: ['市政', '房建'], judicialRisk: 'low' })}::jsonb, 'https://example.tianyancha.com/company/seed-001', 'active', 'platform-tenant', 'platform', 'm5-final', 'platform-owner', ${now}, ${now})
    ON CONFLICT (source_key) DO UPDATE SET profile = EXCLUDED.profile, updated_at = EXCLUDED.updated_at
  `;

  const taskId = randomUUID();
  await prisma.$executeRaw`
    INSERT INTO ocr_tasks (id, task_no, file_name, file_hash, source, status, tenant_id, scope_type, project_id, owner_id, created_at, updated_at)
    VALUES (${taskId}::uuid, 'OCR-M5-SEED-001', 'm5-seed-contract-scan.pdf', 'm5-seed-hash-001', 'ocr-paper-import', 'completed', 'platform-tenant', 'platform', 'm5-final', 'platform-owner', ${now}, ${now})
    ON CONFLICT (task_no) DO UPDATE SET status = EXCLUDED.status, updated_at = EXCLUDED.updated_at
  `;
  const actualTask = await prisma.$queryRaw<Array<{ id: string }>>`SELECT id::text FROM ocr_tasks WHERE task_no = 'OCR-M5-SEED-001' LIMIT 1`;
  await prisma.$executeRaw`
    INSERT INTO ocr_results (id, task_id, text, extracted, confidence, created_at)
    VALUES (${randomUUID()}::uuid, ${(actualTask[0]?.id ?? taskId)}::uuid, '扫描件识别文本：施工合同付款节点、质保金比例、竣工资料清单。', ${JSON.stringify({ clauses: ['付款节点', '质保金', '竣工资料'], pages: 3 })}::jsonb, 0.9820, ${now})
    ON CONFLICT (task_id) DO UPDATE SET text = EXCLUDED.text, extracted = EXCLUDED.extracted, confidence = EXCLUDED.confidence
  `;

  await prisma.$executeRaw`
    INSERT INTO ingest_runs (id, job_name, target_table, status, fetched_count, upserted_count, failed_count, summary, started_at, ended_at, created_by, trace_id, created_at)
    VALUES (${randomUUID()}::uuid, 'seed-m5-ingest', 'all_m5_tables', 'completed', 8, 8, 0, ${JSON.stringify({ seededTables: ['regulations','tender_notices','policy_funds','standard_templates','court_judgments','company_profiles','ocr_tasks','ocr_results'] })}::jsonb, ${now}, ${now}, 'platform-owner', ${traceId}, ${now})
  `;
}

async function seedM8BusinessFuel() {
  const now = new Date();
  await prisma.$executeRaw`
    INSERT INTO rule_candidates (id, source_name, source_table, type, rule_struct, confidence, source_text, reasoning, status, created_at, updated_at)
    VALUES (${randomUUID()}::uuid, 'seed-m8-rule-candidate', 'regulations', 'contract', ${JSON.stringify({ clause: 'payment', level: 'yellow', ruleId: 'M8-CONTRACT-001' })}::jsonb, 0.9100, 'GF-2017 付款节点、验收条件、逾期责任条款。', '专家种子规则候选，用于 M8 审核流。', 'pending', ${now}, ${now})
    ON CONFLICT (source_name) DO UPDATE SET rule_struct = EXCLUDED.rule_struct, updated_at = EXCLUDED.updated_at
  `;
  await prisma.$executeRaw`
    INSERT INTO rule_versions (id, rule_table, rule_id, version, snapshot, changed_by, change_reason, gray_percent, created_at)
    VALUES (${randomUUID()}::uuid, 'contract_rules', 'M8-CONTRACT-001', 1, ${JSON.stringify({ clause: 'payment', level: 'yellow' })}::jsonb, 'platform-owner', 'M8 business fuel seed', 50, ${now})
  `;
  await prisma.$executeRaw`
    INSERT INTO prompt_quality_reports (id, report_month, task_type, pass_rate, case_count, failed_signals, created_at)
    VALUES (${randomUUID()}::uuid, '2026-05', 'contract.review.basic', 86.50, 12, ${JSON.stringify(['引用资料不足'])}::jsonb, ${now})
  `;
}

async function main(): Promise<void> {
  const seeded = await seedTenantsAndUsers();
  await seedAgents(seeded.users);
  await seedOpportunities();
  await seedContracts(seeded.users);
  await seedSystemConfigs();
  await seedM6Rbac();
  await seedM6CredentialsAndMetrics();
  await seedM6DemoRows(seeded.users);
  await seedM5IngestTables();
  await seedM8BusinessFuel();
  console.log('Prisma seed completed: core fixtures plus M5/M6 finish tables.');
}

void main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
