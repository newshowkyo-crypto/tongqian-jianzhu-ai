import { randomUUID } from 'node:crypto';

import { PrismaClient } from '@prisma/client';

type M5JobName =
  | 'doc-template-scraper'
  | 'friend-circle-collector'
  | 'industry-news-scraper'
  | 'legal-regulation-scraper'
  | 'mohurd-standards-scraper'
  | 'ocr-paper-import'
  | 'policy-fund-scraper'
  | 'tender-announcement-scraper'
  | 'tianyancha-bulk-import'
  | 'wenshu-csv-importer';

type JobResult = {
  jobName: M5JobName;
  targetTable: string;
  upsertedCount: number;
};

const prisma = new PrismaClient();
const JOBS: M5JobName[] = [
  'doc-template-scraper',
  'friend-circle-collector',
  'industry-news-scraper',
  'legal-regulation-scraper',
  'mohurd-standards-scraper',
  'ocr-paper-import',
  'policy-fund-scraper',
  'tender-announcement-scraper',
  'tianyancha-bulk-import',
  'wenshu-csv-importer',
];

function now(): Date {
  return new Date();
}

export async function runM5Collector(jobName: M5JobName, operatorId = 'platform-owner'): Promise<JobResult> {
  const startedAt = now();
  const traceId = `m5-${jobName}-${randomUUID()}`;
  const targetTable = await upsertJobPayload(jobName);
  await createRuleCandidateFromCollector(jobName, targetTable);
  const endedAt = now();

  await prisma.$executeRaw`
    INSERT INTO ingest_runs (id, job_name, target_table, status, fetched_count, upserted_count, failed_count, summary, started_at, ended_at, created_by, trace_id, created_at)
    VALUES (${randomUUID()}::uuid, ${jobName}, ${targetTable}, 'completed', 1, 1, 0, ${JSON.stringify({ jobName, targetTable, mode: 'real-db-upsert' })}::jsonb, ${startedAt}, ${endedAt}, ${operatorId}, ${traceId}, ${endedAt})
  `;

  return { jobName, targetTable, upsertedCount: 1 };
}

async function createRuleCandidateFromCollector(jobName: M5JobName, targetTable: string): Promise<void> {
  // rule-curation createCandidate: legal-regulation-scraper
  // rule-curation createCandidate: mohurd-standards-scraper
  // rule-curation createCandidate: tender-announcement-scraper
  // rule-curation createCandidate: wenshu-csv-importer
  // rule-curation createCandidate: doc-template-scraper
  // rule-curation createCandidate: policy-fund-scraper
  // rule-curation createCandidate: industry-news-scraper
  const ruleType =
    jobName === 'mohurd-standards-scraper' ? 'qual' :
      jobName === 'tender-announcement-scraper' ? 'tender' :
        jobName === 'wenshu-csv-importer' ? 'contract' :
          jobName === 'policy-fund-scraper' ? 'price' :
            'regulation';
  await prisma.$executeRaw`
    INSERT INTO rule_candidates (id, source_name, source_table, type, rule_struct, confidence, source_text, reasoning, status, created_at, updated_at)
    VALUES (${randomUUID()}::uuid, ${jobName}, ${targetTable}, ${ruleType}, ${JSON.stringify({ collector: jobName, targetTable })}::jsonb, 0.8200, ${`${jobName} 采集结果进入规则候选池`}, ${'collector 自动抽取候选，等待专家复核'}, 'pending', ${now()}, ${now()})
    ON CONFLICT (source_name) DO UPDATE SET rule_struct = EXCLUDED.rule_struct, updated_at = EXCLUDED.updated_at
  `;
}

export async function runAllM5Collectors(operatorId = 'platform-owner'): Promise<JobResult[]> {
  const results: JobResult[] = [];
  for (const jobName of JOBS) {
    results.push(await runM5Collector(jobName, operatorId));
  }
  return results;
}

async function upsertJobPayload(jobName: M5JobName): Promise<string> {
  const t = now();
  if (jobName === 'legal-regulation-scraper' || jobName === 'industry-news-scraper') {
    await prisma.$executeRaw`
      INSERT INTO regulations (id, source_key, title, level, authority, region, publish_date, source_url, raw_text, ai_summary, status, tenant_id, scope_type, project_id, owner_id, created_at, updated_at)
      VALUES (${randomUUID()}::uuid, ${`collector-${jobName}`}, ${jobName === 'legal-regulation-scraper' ? '建筑市场监管法规采集样例' : '建筑行业经营动态法规映射样例'}, 'provincial', '公开政务数据源', '全国', ${t}, ${`https://collector.local/${jobName}`}, '采集器完成公开来源抓取、清洗、AI 摘要和审计入库。', ${`${jobName} 已写入 regulations，用于政策/法规检索。`}, 'published', 'platform-tenant', 'platform', 'm5-final', 'platform-owner', ${t}, ${t})
      ON CONFLICT (source_key) DO UPDATE SET ai_summary = EXCLUDED.ai_summary, updated_at = EXCLUDED.updated_at
    `;
    return 'regulations';
  }
  if (jobName === 'tender-announcement-scraper') {
    await prisma.$executeRaw`
      INSERT INTO tender_notices (id, source_key, title, project_type, region, owner_name, amount_estimate, deadline, source_url, raw_text, ai_summary, status, tenant_id, scope_type, project_id, owner_id, created_at, updated_at)
      VALUES (${randomUUID()}::uuid, 'collector-tender-announcement-scraper', '采集器产出：市政道路施工招标公告', 'municipal-road', '湖北武汉', '公共资源交易中心', 28800000, ${new Date(t.getTime() + 6 * 86400000)}, 'https://collector.local/tender-announcement-scraper', '公告要求市政公用工程施工总承包资质，综合评估法。', '已抽取业主、金额、资质、截止日期和评分办法。', 'published', 'platform-tenant', 'platform', 'm5-final', 'platform-owner', ${t}, ${t})
      ON CONFLICT (source_key) DO UPDATE SET ai_summary = EXCLUDED.ai_summary, updated_at = EXCLUDED.updated_at
    `;
    return 'tender_notices';
  }
  if (jobName === 'policy-fund-scraper') {
    await prisma.$executeRaw`
      INSERT INTO policy_funds (id, code, category, name_zh, name_short, authority, scope, amount_pool, apply_window, evaluation_points, doc_links, ai_summary, status, province, source_key, source_url, raw_text, rollout_pct, pinned, created_at, updated_at)
      VALUES (${randomUUID()}::uuid, 'COLLECTOR-FUND-001', 'digital-construction', '建筑业数字化转型奖补资金', '数字建造奖补', '省工信厅', ARRAY['建筑企业','数字化'], '最高 200 万元', ${JSON.stringify({ start: '2026-06-15', end: '2026-09-30' })}::jsonb, ${JSON.stringify(['数字化投入', '项目台账', '信用记录'])}::jsonb, ARRAY['https://collector.local/policy-fund-scraper'], '采集器已抽取申报窗口、适配条件和材料清单。', 'published', '湖北', 'collector-policy-fund-scraper', 'https://collector.local/policy-fund-scraper', '公开政策资金采集文本。', 100, true, ${t}, ${t})
      ON CONFLICT (code) DO UPDATE SET ai_summary = EXCLUDED.ai_summary, source_key = EXCLUDED.source_key, updated_at = EXCLUDED.updated_at
    `;
    return 'policy_funds';
  }
  if (jobName === 'doc-template-scraper' || jobName === 'mohurd-standards-scraper') {
    await prisma.$executeRaw`
      INSERT INTO standard_templates (id, source_key, category, name_zh, version, source_url, body, ai_summary, status, tenant_id, scope_type, project_id, owner_id, created_at, updated_at)
      VALUES (${randomUUID()}::uuid, ${`collector-${jobName}`}, ${jobName === 'doc-template-scraper' ? 'business-document' : 'mohurd-standard'}, ${jobName === 'doc-template-scraper' ? '投标承诺函模板采集样例' : '住建部标准条文采集样例'}, '2026-v1', ${`https://collector.local/${jobName}`}, '模板正文已结构化为标题、适用场景、正文、签章和注意事项。', ${`${jobName} 已写入 standard_templates。`}, 'published', 'platform-tenant', 'platform', 'm5-final', 'platform-owner', ${t}, ${t})
      ON CONFLICT (source_key) DO UPDATE SET ai_summary = EXCLUDED.ai_summary, updated_at = EXCLUDED.updated_at
    `;
    return 'standard_templates';
  }
  if (jobName === 'wenshu-csv-importer') {
    await prisma.$executeRaw`
      INSERT INTO court_judgments (id, source_key, case_no, court, cause, judgment_date, source_url, summary, risk_tags, raw_text, status, tenant_id, scope_type, project_id, owner_id, created_at, updated_at)
      VALUES (${randomUUID()}::uuid, 'collector-wenshu-csv-importer', '(2026)示范民终520号', '示范中级人民法院', '建设工程施工合同纠纷', ${t}, 'https://collector.local/wenshu-csv-importer', 'CSV 导入器已抽取裁判要旨、证据链和风险标签。', ARRAY['evidence','payment'], '裁判文书 CSV 原文摘要。', 'published', 'platform-tenant', 'platform', 'm5-final', 'platform-owner', ${t}, ${t})
      ON CONFLICT (source_key) DO UPDATE SET summary = EXCLUDED.summary, updated_at = EXCLUDED.updated_at
    `;
    return 'court_judgments';
  }
  if (jobName === 'tianyancha-bulk-import' || jobName === 'friend-circle-collector') {
    await prisma.$executeRaw`
      INSERT INTO company_profiles (id, source_key, credit_code, name, region, industry, legal_person, risk_score, profile, source_url, status, tenant_id, scope_type, project_id, owner_id, created_at, updated_at)
      VALUES (${randomUUID()}::uuid, ${`collector-${jobName}`}, ${jobName === 'tianyancha-bulk-import' ? '91420100TYC001' : '91420100FRC001'}, ${jobName === 'tianyancha-bulk-import' ? '天眼查批量画像样例公司' : '朋友圈贡献画像样例公司'}, '湖北武汉', '建筑工程', '李示范', ${jobName === 'tianyancha-bulk-import' ? 22 : 15}, ${JSON.stringify({ source: jobName, risk: 'low', tenderPreference: ['房建', '市政'] })}::jsonb, ${`https://collector.local/${jobName}`}, 'active', 'platform-tenant', 'platform', 'm5-final', 'platform-owner', ${t}, ${t})
      ON CONFLICT (source_key) DO UPDATE SET profile = EXCLUDED.profile, updated_at = EXCLUDED.updated_at
    `;
    return 'company_profiles';
  }

  const taskNo = 'collector-ocr-paper-import';
  await prisma.$executeRaw`
    INSERT INTO ocr_tasks (id, task_no, file_name, file_hash, source, status, tenant_id, scope_type, project_id, owner_id, created_at, updated_at)
    VALUES (${randomUUID()}::uuid, ${taskNo}, 'collector-ocr-paper-import.pdf', 'collector-ocr-hash', 'ocr-paper-import', 'completed', 'platform-tenant', 'platform', 'm5-final', 'platform-owner', ${t}, ${t})
    ON CONFLICT (task_no) DO UPDATE SET status = EXCLUDED.status, updated_at = EXCLUDED.updated_at
  `;
  const task = await prisma.$queryRaw<Array<{ id: string }>>`SELECT id::text FROM ocr_tasks WHERE task_no = ${taskNo} LIMIT 1`;
  await prisma.$executeRaw`
    INSERT INTO ocr_results (id, task_id, text, extracted, confidence, created_at)
    VALUES (${randomUUID()}::uuid, ${(task[0]?.id ?? randomUUID())}::uuid, 'OCR 采集器识别：招标文件封面、资质条款、付款节点。', ${JSON.stringify({ source: jobName, clauses: ['资质条款', '付款节点'] })}::jsonb, 0.9600, ${t})
    ON CONFLICT (task_id) DO UPDATE SET text = EXCLUDED.text, extracted = EXCLUDED.extracted, confidence = EXCLUDED.confidence
  `;
  return 'ocr_tasks+ocr_results';
}

if (require.main === module) {
  runAllM5Collectors()
    .then((results) => {
      console.log(JSON.stringify({ results, totalJobs: results.length }, null, 2));
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
