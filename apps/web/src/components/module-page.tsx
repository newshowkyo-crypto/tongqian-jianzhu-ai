'use client';

import {
  Alert,
  Button,
  DataTable,
  EmptyState,
  LoadingState,
  PageContent,
  PageHeader,
  PageLayout,
  RiskMonitorCard,
  SectionCard,
  StatCard,
  StatusBadge,
  type DataTableColumn,
  emptyStateIllustrationAssets,
} from '@tongqian/ui';

import type { WebModulePageCopy } from '../m3-pages';

const rows = [
  { id: 'TQ-001', name: '华中市政项目经营复盘', owner: '张总', status: 'processing' },
  { id: 'TQ-002', name: '央国企分包机会跟进', owner: '李经理', status: 'pending' },
  { id: 'TQ-003', name: '合同风险人工复核', owner: '王法务', status: 'completed' },
] as const;

const columns: Array<DataTableColumn<Record<string, string>>> = [
  { header: '编号', key: 'id' },
  { header: '事项', key: 'name' },
  { header: '负责人', key: 'owner' },
  { cell: (row) => <StatusBadge status={row.status as 'completed' | 'pending' | 'processing'} />, header: '状态', key: 'status' },
];

export function ModulePage({ copy }: { copy: WebModulePageCopy }) {
  return (
    <PageLayout>
      <PageHeader
        actions={<Button>{copy.action}</Button>}
        description={copy.description}
        title={copy.title}
      />
      <PageContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label={copy.metric} trend="较上周 +12.3%" value="18" />
          <StatCard label="风险红灯" trend="2 项需要您处理" value="2" />
          <StatCard label="AI 报告" trend="本周已生成" value="9" />
          <StatCard label="点数余额" trend="预计可用 17 天" value="12,860" />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <SectionCard title="关键事项">
            <DataTable columns={columns} data={[...rows]} empty={<EmptyState title={copy.empty} />} />
          </SectionCard>
          <SectionCard title="经营提醒">
            <div className="space-y-4">
              <RiskMonitorCard level="yellow" />
              <Alert tone="info">系统已为您保留移动端、公众号和 PDF 报告入口。</Alert>
            </div>
          </SectionCard>
        </div>

        <EmptyState
          action={<Button variant="outline">{copy.action}</Button>}
          description={`${copy.empty} 视觉资产：${emptyStateIllustrationAssets.reports}`}
          title="空状态预览"
        />
        <LoadingState label="数据加载中" />
      </PageContent>
    </PageLayout>
  );
}
