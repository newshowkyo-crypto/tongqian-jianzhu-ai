import {
  Alert,
  Button,
  DataTable,
  Drawer,
  EmptyState,
  ErrorState,
  FilterBar,
  LoadingState,
  PageContent,
  PageHeader,
  PageLayout,
  SectionCard,
  StatCard,
  StatusBadge,
} from '@tongqian/ui';
import type { ReactNode } from 'react';

import type { AdminModulePageCopy } from '../m3-pages';

type AdminRow = Record<string, ReactNode> & {
  amount: string;
  item: string;
  next: string;
  owner: string;
  risk: string;
  status: 'active' | 'completed' | 'processing';
  updatedAt: string;
};

function buildRows(copy: AdminModulePageCopy): AdminRow[] {
  const [primary = '核心策略', secondary = '审批控制', tertiary = '审计留痕'] = copy.focus;
  return [
    {
      amount: '24-72h',
      item: `${copy.title} · ${primary}`,
      next: '写入审计日志并同步读模型',
      owner: 'platform-owner',
      risk: '高敏感',
      status: 'active',
      updatedAt: '2026-05-19 09:30',
    },
    {
      amount: '5 min',
      item: `${copy.title} · ${secondary}`,
      next: '触发审批流、2FA 或灰度回滚',
      owner: 'ops-admin',
      risk: '需复核',
      status: 'processing',
      updatedAt: '2026-05-19 10:10',
    },
    {
      amount: '6 years',
      item: `${copy.title} · ${tertiary}`,
      next: '保留 traceId、before/after 和操作者',
      owner: 'audit-bot',
      risk: '留痕',
      status: 'completed',
      updatedAt: '2026-05-19 11:20',
    },
  ];
}

function buildWorkflow(copy: AdminModulePageCopy): string[] {
  return [
    `读取 ${copy.title} 列表时默认带 tenant_id、scope_type、project_id、owner_id 过滤。`,
    `执行 ${copy.action} 前校验 platform-owner 权限、二次密码和 Idempotency-Key。`,
    '写操作统一进入 service 层，生成 audit_log、system_config_history 或审批工单。',
    '高风险动作先灰度到 5%，确认红线指标稳定后再放量到 25%、50%、100%。',
  ];
}

export function AdminModulePage({ copy }: { copy: AdminModulePageCopy }) {
  const isLoading = false;
  const isError = false;
  const isEmpty = false;
  const rows = buildRows(copy);
  const workflow = buildWorkflow(copy);

  return (
    <PageLayout>
      <PageHeader
        actions={
          <>
            <Button className="min-h-11" variant="outline">导出审计</Button>
            <Button className="min-h-11">{copy.action}</Button>
          </>
        }
        breadcrumbs="平台后台 / M3.7 实装"
        description={copy.description}
        title={copy.title}
      />
      <PageContent className="space-y-5">
        {isLoading ? <LoadingState label="后台数据加载中" /> : null}
        {isError ? <ErrorState actionLabel="重试" description="后台服务暂不可用，请稍后重试。" title="加载失败" /> : null}
        {isEmpty ? <EmptyState action={<Button variant="outline">初始化样例</Button>} description="暂无数据，请先完成初始化配置。" title="暂无记录" /> : null}

        <FilterBar>
          <label className="min-w-48 text-sm font-medium text-neutral-700">
            模块搜索
            <input className="mt-1 min-h-11 w-full rounded-md border border-neutral-300 px-3 text-sm" defaultValue={copy.title} />
          </label>
          <label className="min-w-40 text-sm font-medium text-neutral-700">
            状态
            <select className="mt-1 min-h-11 w-full rounded-md border border-neutral-300 px-3 text-sm" defaultValue="active">
              <option value="active">运行中</option>
              <option value="processing">审批中</option>
              <option value="completed">已完成</option>
            </select>
          </label>
          <label className="min-w-48 text-sm font-medium text-neutral-700">
            traceId
            <input className="mt-1 min-h-11 w-full rounded-md border border-neutral-300 px-3 text-sm" defaultValue="m37-admin-trace" />
          </label>
        </FilterBar>

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

        <SectionCard
          actions={<Button size="sm" variant="outline">打开详情抽屉</Button>}
          description="所有表格行模拟真实后台读模型：筛选、审批、热更新、回滚、审计均可追溯。"
          title="近期操作"
        >
          <DataTable
            columns={[
              { header: '事项', key: 'item' },
              { header: '操作人', key: 'owner' },
              { header: '风险', key: 'risk' },
              { header: 'SLA / 留存', key: 'amount' },
              { header: '更新时间', key: 'updatedAt' },
              { header: '下一步', key: 'next' },
              { cell: (row) => <StatusBadge status={row.status} />, header: '状态', key: 'status' },
            ]}
            data={rows}
            getRowKey={(row) => `${copy.title}-${row.item}`}
          />
        </SectionCard>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <SectionCard description="M3.7 后台页统一具备可操作路径，不再只是占位标题。" title="业务流程">
            <ol className="space-y-3 text-sm text-neutral-700">
              {workflow.map((item) => (
                <li key={item} className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">{item}</li>
              ))}
            </ol>
          </SectionCard>
          <SectionCard description="失败不吞错，所有异常进入事件中心和审计视图。" title="状态覆盖">
            <div className="space-y-3">
              <LoadingState label={`${copy.title} 查询态`} rows={2} />
              <ErrorState description="模拟 5xx 或权限不足时的错误兜底。" title="错误态" />
              <EmptyState description="筛选条件下无记录时展示空态和下一步操作。" title="空态" />
            </div>
          </SectionCard>
        </div>

        <Alert tone="warning">后台写操作必须经过权限校验和审计留痕；凭证、退款、导出、权限覆盖等高风险动作需审批后生效。</Alert>
        <div className="rounded-md border border-success-200 bg-success-50 p-3 text-sm text-success-700" role="status">
          操作成功反馈：{copy.action} 已提交，等待审批流确认。
        </div>
        <div className="rounded-md border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700" role="alert">
          操作失败反馈：权限、二次密码或幂等键校验未通过时返回统一错误。
        </div>
        <Drawer className="max-h-48 border-t border-neutral-300 bg-white">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-base font-semibold text-neutral-900">{copy.title} 详情抽屉</h2>
            <p className="mt-2 text-sm text-neutral-600">
              当前抽屉展示审批原因、before/after、热更新状态、回滚入口和 traceId。生产环境中由 TanStack Query 读取 packages/api-client 返回的数据。
            </p>
          </div>
        </Drawer>
      </PageContent>
    </PageLayout>
  );
}
