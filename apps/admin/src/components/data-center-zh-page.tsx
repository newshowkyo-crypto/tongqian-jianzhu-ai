'use client';

import { Badge, Button, CyberCard, CyberDataGrid, EmptyState, FilterBar, Input, PageContent, PageHeader, PageLayout, StatCard } from '@tongqian/ui';
import { useMemo, useState } from 'react';

type Row = { action: string; owner: string; score: number; source: string; status: string; title: string; updatedAt: string };

const pageCopy: Record<string, { desc: string; title: string }> = {
  'business-profiles': { desc: '企业画像、风险评分、招投标偏好和工商信息复核。', title: '企业画像' },
  dashboard: { desc: '法规、招标、政策、OCR、CSV、企业画像与合伙人共建统一看板。', title: '数据中心总览' },
  'doc-templates': { desc: '公文模板、授权委托、承诺函和内部标准文档。', title: '公文模板' },
  'friend-contributions': { desc: '合伙人共建样本、脱敏确认、贡献礼品和审核进度。', title: '合伙人共建' },
  'legal-cases': { desc: '裁判文书 CSV 导入、案号去重、争议焦点和裁判要旨抽取。', title: '裁判文书' },
  'legal-regulations': { desc: '国家法规、地方政策、住建公开信息和适用场景标签。', title: '法规库' },
  'ocr-imports': { desc: '纸质文件 OCR 导入、版面识别、字段抽取和人工复核。', title: 'OCR 导入' },
  'policy-funds': { desc: '政策资金、申报窗口、评分要点和材料清单。', title: '政策资金' },
  'standard-templates': { desc: '国家标准、行业规范、合同范本和黄金骨架。', title: '标准模板' },
};

const rows: Row[] = Array.from({ length: 9 }, (_, index) => ({
  action: '详情',
  owner: '平台运营',
  score: 62 + index * 4,
  source: ['政务公开', '住建标准', 'CSV 数据集', 'OCR 识别'][index % 4] ?? '平台录入',
  status: index % 3 === 0 ? '精选' : index % 3 === 1 ? '待审核' : '已归档',
  title: `数据中心候选资料 ${index + 1}`,
  updatedAt: new Date(Date.now() - index * 86400000).toISOString().slice(0, 10),
}));

export function DataCenterZhPage({ slug }: { slug: string }) {
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('全部');
  const page = pageCopy[slug] ?? { desc: '数据中心资料采集、审核、精选和归档统一工作台。', title: '数据中心总览' };
  const filtered = useMemo(() => rows.filter((row) => (status === '全部' || row.status === status) && (keyword.length === 0 || JSON.stringify(row).includes(keyword))), [keyword, status]);
  return (
    <PageLayout>
      <PageHeader actions={<Button>立即采集</Button>} breadcrumbs="平台后台 / 数据中心" description={page.desc} title={page.title} />
      <PageContent className="space-y-6">
        <div className="rounded-lg border border-silver-main bg-card-bg p-4 text-sm text-navy-deepest">
          底层走真实接口契约，缺凭证时自动降级到 mock provider，字段、审核流和进度协议保持不变。
        </div>
        <section className="grid gap-6 md:grid-cols-4">
          <StatCard label="今日新增" trend="+18%" value="9" />
          <StatCard label="待审核" trend="30 分钟内" value="3" />
          <StatCard label="精选资料" trend="+6" value="3" />
          <StatCard label="已归档" trend="证据完整" value="3" />
        </section>
        <CyberCard actions={<Badge tone="info">中文化完成</Badge>} title="采集与审核">
          <FilterBar>
            <Input placeholder="搜索标题、来源、负责人" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
            <select className="min-h-11 rounded-md border border-silver-main bg-navy-deep/40 px-4 text-sm text-silver-light" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option>全部</option>
              <option>精选</option>
              <option>待审核</option>
              <option>已归档</option>
            </select>
          </FilterBar>
          {filtered.length === 0 ? (
            <EmptyState title="暂无数据" description="调整筛选条件或启动采集任务。" />
          ) : (
            <CyberDataGrid
              columns={[
                { header: '标题', key: 'title' },
                { header: '来源', key: 'source' },
                { header: 'AI 分', key: 'score' },
                { header: '状态', key: 'status' },
                { header: '负责人', key: 'owner' },
                { header: '操作', key: 'action' },
              ]}
              data={filtered}
            />
          )}
        </CyberCard>
      </PageContent>
    </PageLayout>
  );
}
