import {
  Alert,
  Button,
  DataTable,
  EmptyState,
  ErrorState,
  LoadingState,
  PageContent,
  PageHeader,
  PageLayout,
  SectionCard,
  StatCard,
  StatusBadge,
} from '@tongqian/ui';

import type { AdminModulePageCopy } from '../m3-pages';

const rows = [
  { owner: 'platform-owner', status: 'active' as const, updatedAt: '2026-05-18 09:30', item: '关键配置已审批' },
  { owner: 'ops-admin', status: 'processing' as const, updatedAt: '2026-05-18 10:10', item: '运营任务处理中' },
  { owner: 'audit-bot', status: 'completed' as const, updatedAt: '2026-05-18 11:20', item: '审计日志已写入' },
];

export function AdminModulePage({ copy }: { copy: AdminModulePageCopy }) {
  const isLoading = false;
  const isError = false;
  const isEmpty = false;

  return (
    <PageLayout>
      <PageHeader actions={<Button className="min-h-11">{copy.action}</Button>} description={copy.description} title={copy.title} />
      <PageContent className="space-y-5">
        {isLoading ? <LoadingState label="后台数据加载中" /> : null}
        {isError ? <ErrorState actionLabel="重试" description="后台服务暂不可用，请稍后重试。" title="加载失败" /> : null}
        {isEmpty ? <EmptyState description="暂无数据，请先完成初始化配置。" title="暂无记录" /> : null}

        <div className="grid gap-3 md:grid-cols-3">
          <StatCard label="今日变更" trend="全部写入审计日志" value="18" />
          <StatCard label="待审批" trend="platform-owner 处理" value="7" />
          <StatCard label="异常告警" trend="无红线触发" value="0" />
        </div>

        <SectionCard title="权限与控制点">
          <div className="grid gap-3 md:grid-cols-3">
            {copy.focus.map((item) => (
              <label key={item} className="flex min-h-12 items-center justify-between rounded-md border border-neutral-200 bg-neutral-50 px-3 text-sm">
                <span className="font-medium text-neutral-800">{item}</span>
                <input className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-neutral-300 transition-colors checked:bg-primary-600 before:block before:h-5 before:w-5 before:rounded-full before:bg-white before:shadow-sm before:transition-transform checked:before:translate-x-4" defaultChecked type="checkbox" />
              </label>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="近期操作">
          <DataTable
            columns={[
              { header: '事项', key: 'item' },
              { header: '操作人', key: 'owner' },
              { header: '更新时间', key: 'updatedAt' },
              { cell: (row) => <StatusBadge status={row.status} />, header: '状态', key: 'status' },
            ]}
            data={rows}
            getRowKey={(row) => `${copy.title}-${row.item}`}
          />
        </SectionCard>

        <Alert tone="warning">后台写操作必须经过权限校验和审计留痕；凭证、退款、导出、权限覆盖等高风险动作需审批后生效。</Alert>
      </PageContent>
    </PageLayout>
  );
}
