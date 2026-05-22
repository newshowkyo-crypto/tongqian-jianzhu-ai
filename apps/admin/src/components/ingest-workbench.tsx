'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@tongqian/api-client';
import { Button, DataTable, ErrorState, Input, LoadingState, PageContent, PageHeader, PageLayout, SectionCard, StatCard, StatusBadge, Toast } from '@tongqian/ui';
import { useMemo, useState } from 'react';

type IngestPageKind = 'court' | 'ocr' | 'overview' | 'policies' | 'regulations' | 'templates' | 'tenders' | 'tianyancha';

const pageMeta: Record<IngestPageKind, { breadcrumb: string; job: string; target: string; title: string }> = {
  court: { breadcrumb: '裁判文书 CSV', job: 'wenshu-csv-importer', target: 'court_judgments', title: '裁判文书 CSV' },
  ocr: { breadcrumb: 'OCR 任务', job: 'ocr-paper-import', target: 'ocr_tasks', title: 'OCR 任务' },
  overview: { breadcrumb: '采集大盘', job: 'legal-regulation-scraper', target: 'ingest_runs', title: '采集大盘' },
  policies: { breadcrumb: '政策资金采集', job: 'policy-fund-scraper', target: 'policy_funds', title: '政策资金采集' },
  regulations: { breadcrumb: '法规库采集', job: 'legal-regulation-scraper', target: 'regulations', title: '法规库采集' },
  templates: { breadcrumb: '标准模板采集', job: 'doc-template-scraper', target: 'standard_templates', title: '标准模板采集' },
  tenders: { breadcrumb: '招标公告采集', job: 'tender-announcement-scraper', target: 'tender_notices', title: '招标公告采集' },
  tianyancha: { breadcrumb: '天眼查（公司画像）', job: 'tianyancha-bulk-import', target: 'company_profiles', title: '天眼查采集' },
};

export function IngestWorkbench({ kind }: { kind: IngestPageKind }) {
  const meta = pageMeta[kind];
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState('Hubei construction');
  const [toast, setToast] = useState<string>();
  const [file, setFile] = useState<File>();
  const stats = useQuery({ queryFn: () => apiClient.admin.ingest.stats(), queryKey: ['admin', 'ingest', 'stats'] });
  const runs = useQuery({ queryFn: () => apiClient.admin.ingest.runs(kind === 'overview' ? undefined : meta.job), queryKey: ['admin', 'ingest', 'runs', kind] });
  const runJob = useMutation({
    mutationFn: () => apiClient.admin.ingest.run(meta.job),
    onSuccess: async (result) => {
      setToast(`${result.jobName} 已写入 ${result.targetTable}`);
      await Promise.all([queryClient.invalidateQueries({ queryKey: ['admin', 'ingest', 'stats'] }), queryClient.invalidateQueries({ queryKey: ['admin', 'ingest', 'runs'] })]);
    },
  });
  const courtUpload = useMutation({
    mutationFn: () => apiClient.admin.ingest.uploadCourtJudgments(file ?? emptyFile('court.csv')),
    onSuccess: async (result) => {
      setToast(`CSV 已导入 ${result.imported} 行`);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'ingest'] });
    },
  });
  const ocrSubmit = useMutation({
    mutationFn: () => apiClient.admin.ingest.submitOcr(file ?? emptyFile('ocr.pdf')),
    onSuccess: async (result) => {
      setToast(`OCR 任务 ${result.taskNo} 已完成`);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'ingest'] });
    },
  });
  const tycSearch = useMutation({
    mutationFn: () => apiClient.admin.ingest.searchTianyancha(keyword),
    onSuccess: async (result) => {
      setToast(`${result.keyword} 已写入 ${result.targetTable}`);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'ingest'] });
    },
  });

  const visibleCounts = useMemo(() => (stats.data?.counts ?? []).filter((item) => kind === 'overview' || item.table_name === meta.target || item.table_name === 'ingest_runs'), [kind, meta.target, stats.data]);

  return (
    <PageLayout>
      <PageHeader
        breadcrumbs={`后台首页 / 采集大盘 / ${meta.breadcrumb}`}
        description="平台数据采集控制台。所有操作真实调用 API 并写入运行审计。"
        title={meta.title}
        actions={<Button disabled={runJob.isPending} onClick={() => runJob.mutate()}>{runJob.isPending ? '运行中' : '立即采集'}</Button>}
      />
      <PageContent className="space-y-6">
        {stats.isLoading || runs.isLoading ? <LoadingState label="正在加载采集监控" /> : null}
        {stats.isError || runs.isError ? <ErrorState description="后端采集接口报错，请稍后重试或在「健康监控」查看后端状态" title="采集服务暂不可用" onRetry={() => void Promise.all([stats.refetch(), runs.refetch()])} /> : null}
        <div className="grid gap-4 md:grid-cols-4">
          {visibleCounts.map((item) => <StatCard key={item.table_name} label={item.table_name} value={String(item.count)} trend="数据库行数" />)}
        </div>
        <SectionCard title="采集器入口" description="运行按钮会把采集器写入 Prisma 目标表，并记录一条审计。">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <Input readOnly value={meta.job} />
            <Button disabled={runJob.isPending} onClick={() => runJob.mutate()} variant="outline">立即采集</Button>
          </div>
        </SectionCard>
        {kind === 'court' ? (
          <SectionCard title="裁判文书 CSV 上传" description="CSV 上传接口会写入 court_judgments 和 ingest_runs。">
            <div className="flex flex-wrap items-end gap-4">
              <Input accept=".csv,text/csv" onChange={(event) => setFile(event.target.files?.[0])} type="file" />
              <Button disabled={courtUpload.isPending} onClick={() => courtUpload.mutate()}>上传 CSV</Button>
            </div>
          </SectionCard>
        ) : null}
        {kind === 'ocr' ? (
          <SectionCard title="OCR 文件提交" description="OCR 提交接口会写入 ocr_tasks、ocr_results 和 ingest_runs。">
            <div className="flex flex-wrap items-end gap-4">
              <Input accept=".pdf,.png,.jpg,.jpeg" onChange={(event) => setFile(event.target.files?.[0])} type="file" />
              <Button disabled={ocrSubmit.isPending} onClick={() => ocrSubmit.mutate()}>提交 OCR</Button>
            </div>
          </SectionCard>
        ) : null}
        {kind === 'tianyancha' ? (
          <SectionCard title="关键词搜索" description="关键词搜索会写入 company_profiles 和 ingest_runs。">
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <Input onChange={(event) => setKeyword(event.target.value)} value={keyword} />
              <Button disabled={tycSearch.isPending} onClick={() => tycSearch.mutate()}>搜索</Button>
            </div>
          </SectionCard>
        ) : null}
        <SectionCard title="运行审计" description="最新 ingest_runs 记录，详情页按任务筛选。">
          <DataTable
            columns={[
              { header: '任务', key: 'job_name' },
              { header: '目标表', key: 'target_table' },
              { cell: (row) => <StatusBadge status={row.status === 'completed' ? 'completed' : 'pending'} />, header: '状态', key: 'status' },
              { header: 'Upsert 数', key: 'upserted_count' },
              { header: '追踪号', key: 'trace_id' },
            ]}
            data={(runs.data?.items ?? []).map((row) => ({ ...row }))}
            empty="暂无采集运行记录，点击右上角「立即采集」后会出现"
            getRowKey={(row) => String(row.id)}
          />
        </SectionCard>
        {toast ? <Toast className="fixed bottom-6 right-6 z-50" onClick={() => setToast(undefined)} tone="success">{toast}</Toast> : null}
      </PageContent>
    </PageLayout>
  );
}

function emptyFile(name: string): File {
  return new File(['m5-final ingest placeholder'], name, { type: name.endsWith('.csv') ? 'text/csv' : 'application/pdf' });
}
