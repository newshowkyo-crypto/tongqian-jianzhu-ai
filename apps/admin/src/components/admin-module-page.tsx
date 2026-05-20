'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient, type AdminModuleSummary } from '@tongqian/api-client';
import {
  Alert,
  Button,
  DataTable,
  EmptyState,
  ErrorState,
  FilterBar,
  Input,
  LoadingState,
  PageContent,
  PageHeader,
  PageLayout,
  SectionCard,
  StatCard,
  StatusBadge,
  Toast,
} from '@tongqian/ui';
import { useMemo, useState, type ReactNode } from 'react';

import type { AdminModulePageCopy } from '../m3-pages';

type AdminRow = Record<string, ReactNode> & {
  item: string;
  next: string;
  owner: string;
  status: 'active' | 'completed' | 'processing';
  updatedAt: string;
};

function fallbackSummary(copy: AdminModulePageCopy): AdminModuleSummary {
  return {
    alerts: [
      { level: 'success', message: `${copy.title} mock API 已接入` },
      { level: 'warning', message: '写操作需要 platform-owner 审批和审计留痕' },
    ],
    rows: copy.focus.slice(0, 3).map((item, index) => ({
      item: `${copy.title} · ${item}`,
      next: index === 0 ? copy.action : '写入 audit_log 后热更新',
      owner: index === 0 ? 'platform-owner' : 'ops-admin',
      status: index === 2 ? 'completed' : index === 1 ? 'processing' : 'active',
      updatedAt: `2026-05-20 1${index}:20`,
    })),
    stats: [
      { label: '今日变更', trend: '全部可追踪', value: '18' },
      { label: '待审批', trend: '二次确认', value: '7' },
      { label: '异常告警', trend: '无红线', value: '0' },
    ],
    workflow: ['查询模块数据', '提交审批动作', '写入审计日志', '触发热更新或回滚'],
  };
}

export function AdminModulePage({ copy }: { copy: AdminModulePageCopy }) {
  const slug = copy.title.toLowerCase().replace(/\s+/g, '-');
  const [keyword, setKeyword] = useState(copy.title);
  const [toast, setToast] = useState<string>();
  const query = useQuery({
    queryFn: () => apiClient.admin.module(slug),
    queryKey: ['admin-module', slug],
  });
  const action = useMutation({
    mutationFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 220));
      return `${copy.action} 已提交，等待 platform-owner 审批`;
    },
    onError: () => setToast('操作失败：权限或二次密码校验未通过'),
    onSuccess: (message) => setToast(message),
  });
  const summary = query.data ?? fallbackSummary(copy);
  const rows = useMemo(
    () =>
      summary.rows
        .filter((row) => JSON.stringify(row).toLowerCase().includes(keyword.toLowerCase()))
        .map((row): AdminRow => ({
          item: row.item ?? copy.title,
          next: row.next ?? '等待处理',
          owner: row.owner ?? 'ops-admin',
          status: (row.status as AdminRow['status']) ?? 'active',
          updatedAt: row.updatedAt ?? '刚刚',
        })),
    [copy.title, keyword, summary.rows],
  );

  return (
    <PageLayout>
      <PageHeader
        actions={
          <>
            <Button className="min-h-11" onClick={() => setToast('审计导出已生成 mock 下载任务')} variant="outline">
              导出审计
            </Button>
            <Button className="min-h-11" disabled={action.isPending} onClick={() => action.mutate()}>
              {action.isPending ? '提交中' : copy.action}
            </Button>
          </>
        }
        breadcrumbs="平台后台 / M3.8 可点击模块"
        description={copy.description}
        title={copy.title}
      />
      <PageContent className="space-y-5">
        {query.isLoading ? <LoadingState label="正在加载后台模块数据" /> : null}
        {query.isError ? <ErrorState actionLabel="重试" description="API 暂不可用，已切到 mock 数据兜底。" onRetry={() => void query.refetch()} title="加载失败" /> : null}
        {rows.length === 0 ? <EmptyState action={<Button onClick={() => setKeyword('')}>清空筛选</Button>} description="当前筛选条件下没有记录。" title="暂无记录" /> : null}

        <FilterBar>
          <label className="min-w-56 text-sm font-medium text-neutral-700">
            模块搜索
            <Input className="mt-1" onChange={(event) => setKeyword(event.target.value)} value={keyword} />
          </label>
          <label className="min-w-44 text-sm font-medium text-neutral-700">
            状态
            <select className="mt-1 min-h-11 w-full rounded-md border border-neutral-300 px-3 text-sm" defaultValue="active">
              <option value="active">运行中</option>
              <option value="processing">审批中</option>
              <option value="completed">已完成</option>
            </select>
          </label>
          <label className="min-w-48 text-sm font-medium text-neutral-700">
            traceId
            <Input className="mt-1" defaultValue="m38-admin-clickable" />
          </label>
        </FilterBar>

        <div className="grid gap-3 md:grid-cols-3">
          {summary.stats.map((item) => (
            <StatCard key={item.label} label={item.label} trend={item.trend} value={item.value} />
          ))}
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

        <SectionCard description="数据来自 packages/api-client；无后端时自动 mock，可点击动作会更新页面反馈。" title="近期操作">
          <DataTable
            columns={[
              { header: '事项', key: 'item' },
              { header: '操作人', key: 'owner' },
              { header: '更新时间', key: 'updatedAt' },
              { header: '下一步', key: 'next' },
              { cell: (row) => <StatusBadge status={row.status} />, header: '状态', key: 'status' },
            ]}
            data={rows}
            empty="暂无记录"
            getRowKey={(row) => `${copy.title}-${row.item}`}
          />
        </SectionCard>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <SectionCard description="每一步都保留审计线索，便于后续接真实 API。" title="业务流程">
            <ol className="space-y-3 text-sm text-neutral-700">
              {summary.workflow.map((item) => (
                <li key={item} className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">{item}</li>
              ))}
            </ol>
          </SectionCard>
          <SectionCard description="接口异常、空数据和加载态全部可见。" title="状态兜底">
            <div className="space-y-3">
              {summary.alerts.map((item) => (
                <Alert key={item.message} tone={item.level === 'warning' ? 'warning' : 'success'}>{item.message}</Alert>
              ))}
            </div>
          </SectionCard>
        </div>

        {toast ? <Toast onClick={() => setToast(undefined)}>{toast}</Toast> : null}
      </PageContent>
    </PageLayout>
  );
}
