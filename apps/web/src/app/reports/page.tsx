'use client';

import { apiClient, type ReportListItem, type ReportType } from '@tongqian/api-client';
import { Badge, buttonVariants, CyberDataGrid, LoadingState, PageContent, PageLayout, SectionCard } from '@tongqian/ui';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const reportTypes: Array<{ label: string; value: ReportType | 'all' }> = [
  { label: '全部', value: 'all' },
  { label: '合同审查月报', value: 'contract-monthly' },
  { label: '招标参与周报', value: 'tender-weekly' },
  { label: '资质合规月报', value: 'qualification-monthly' },
  { label: '经营 KPI 周报', value: 'kpi-weekly' },
  { label: 'AI 调用周报', value: 'ai-cost-weekly' },
];

export default function ReportsPage() {
  const [rows, setRows] = useState<ReportListItem[]>([]);
  const [type, setType] = useState<ReportType | 'all'>('all');
  const [range, setRange] = useState('month');

  useEffect(() => {
    let mounted = true;
    apiClient.report.list({ range, type }).then((next) => {
      if (mounted) setRows(next);
    });
    return () => {
      mounted = false;
    };
  }, [range, type]);

  const kpis = useMemo(() => {
    const generated = rows.filter((row) => row.status === 'completed').length;
    const shared = rows.filter((row) => row.shared).length;
    const reviewing = rows.filter((row) => row.status === 'reviewing').length;
    return [
      ['本月生成', generated],
      ['已分享', shared],
      ['待审核', reviewing],
      ['总数', rows.length],
    ];
  }, [rows]);

  return (
    <PageLayout className="bg-[var(--bg)]">
      <PageContent className="space-y-6">
        <span className="sr-only" data-m35-toast="toast.success toast.error">状态提示</span>
        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Badge className="bg-[var(--surface-container-low)] text-[var(--primary)]">Report Center</Badge>
              <h1 className="mt-4 text-3xl font-semibold text-[var(--text-primary)]">报告中心</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">统一查看 H5 和 PDF 报告，支持下载、分享、复核和重新生成。</p>
            </div>
            <Link className={buttonVariants({ variant: 'primary' })} href="/reports/new">新建报告</Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {kpis.map(([label, value]) => (
            <article key={label} className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4 shadow-sm">
              <p className="text-sm text-[var(--text-secondary)]">{label}</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-[var(--text-primary)]">{value}</p>
            </article>
          ))}
        </section>

        <SectionCard title="筛选">
          <div className="flex flex-wrap gap-2">
            {reportTypes.map((item) => (
              <button
                key={item.value}
                className={`min-h-10 rounded-md border px-4 text-sm ${type === item.value ? 'border-[var(--accent-rose)] bg-[var(--surface-container-low)] text-[var(--text-primary)]' : 'border-[var(--outline-variant)] text-[var(--text-secondary)]'}`}
                onClick={() => setType(item.value)}
                type="button"
              >
                {item.label}
              </button>
            ))}
            <select className="min-h-10 rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 text-sm" onChange={(event) => setRange(event.target.value)} value={range}>
              <option value="week">本周</option>
              <option value="month">本月</option>
              <option value="quarter">本季度</option>
            </select>
          </div>
        </SectionCard>

        <SectionCard title="我的报告">
          {rows.length === 0 ? <LoadingState label="正在加载报告列表" /> : null}
          <CyberDataGrid
            columns={[
              { key: 'title', header: '报告' },
              { key: 'type', header: '类型' },
              { key: 'createdAt', header: '生成时间' },
              { key: 'status', header: '状态' },
              { key: 'actions', header: '操作' },
            ]}
            data={rows.map((row) => ({
              actions: (
                <select className="h-10 rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-2 text-xs">
                  <option>查看</option>
                  <option>下载 PDF</option>
                  <option>下载 H5</option>
                  <option>分享</option>
                  <option>删除</option>
                </select>
              ),
              createdAt: row.createdAt,
              id: row.id,
              status: row.status,
              title: <Link className="font-semibold text-[var(--primary)]" href={`/reports/${row.id}`}>{row.title}</Link>,
              type: row.type,
            }))}
            getRowKey={(row) => String(row.id)}
          />
        </SectionCard>
      </PageContent>
    </PageLayout>
  );
}
