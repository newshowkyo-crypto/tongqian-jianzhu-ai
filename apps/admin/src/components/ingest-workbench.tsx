'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@tongqian/api-client';
import { Button, DataTable, ErrorState, Input, LoadingState, PageContent, PageHeader, PageLayout, SectionCard, StatCard, StatusBadge, Toast } from '@tongqian/ui';
import { useMemo, useState } from 'react';

type IngestPageKind = 'court' | 'ocr' | 'overview' | 'policies' | 'regulations' | 'templates' | 'tenders' | 'tianyancha';

const pageMeta: Record<IngestPageKind, { job: string; target: string; title: string }> = {
  court: { job: 'wenshu-csv-importer', target: 'court_judgments', title: 'Court CSV ingest' },
  ocr: { job: 'ocr-paper-import', target: 'ocr_tasks', title: 'OCR ingest' },
  overview: { job: 'legal-regulation-scraper', target: 'ingest_runs', title: 'Ingest overview' },
  policies: { job: 'policy-fund-scraper', target: 'policy_funds', title: 'Policy fund ingest' },
  regulations: { job: 'legal-regulation-scraper', target: 'regulations', title: 'Regulation ingest' },
  templates: { job: 'doc-template-scraper', target: 'standard_templates', title: 'Template ingest' },
  tenders: { job: 'tender-announcement-scraper', target: 'tender_notices', title: 'Tender ingest' },
  tianyancha: { job: 'tianyancha-bulk-import', target: 'company_profiles', title: 'Tianyancha ingest' },
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
      setToast(`${result.jobName} wrote ${result.targetTable}`);
      await Promise.all([queryClient.invalidateQueries({ queryKey: ['admin', 'ingest', 'stats'] }), queryClient.invalidateQueries({ queryKey: ['admin', 'ingest', 'runs'] })]);
    },
  });
  const courtUpload = useMutation({
    mutationFn: () => apiClient.admin.ingest.uploadCourtJudgments(file ?? emptyFile('court.csv')),
    onSuccess: async (result) => {
      setToast(`CSV imported ${result.imported} row`);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'ingest'] });
    },
  });
  const ocrSubmit = useMutation({
    mutationFn: () => apiClient.admin.ingest.submitOcr(file ?? emptyFile('ocr.pdf')),
    onSuccess: async (result) => {
      setToast(`OCR task ${result.taskNo} completed`);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'ingest'] });
    },
  });
  const tycSearch = useMutation({
    mutationFn: () => apiClient.admin.ingest.searchTianyancha(keyword),
    onSuccess: async (result) => {
      setToast(`${result.keyword} upserted to ${result.targetTable}`);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'ingest'] });
    },
  });

  const visibleCounts = useMemo(() => (stats.data?.counts ?? []).filter((item) => kind === 'overview' || item.table_name === meta.target || item.table_name === 'ingest_runs'), [kind, meta.target, stats.data]);

  return (
    <PageLayout>
      <PageHeader
        breadcrumbs={`Admin / Ingest / ${meta.target}`}
        description="M5-FINAL data collection control plane. All actions call packages/api-client and write ingest_runs audit records."
        title={meta.title}
        actions={<Button disabled={runJob.isPending} onClick={() => runJob.mutate()}>{runJob.isPending ? 'Running' : `Run ${meta.job}`}</Button>}
      />
      <PageContent className="space-y-5">
        {stats.isLoading || runs.isLoading ? <LoadingState label="Loading ingest telemetry" /> : null}
        {stats.isError || runs.isError ? <ErrorState description="The ingest API returned an error." title="Ingest API unavailable" onRetry={() => void Promise.all([stats.refetch(), runs.refetch()])} /> : null}
        <div className="grid gap-3 md:grid-cols-4">
          {visibleCounts.map((item) => <StatCard key={item.table_name} label={item.table_name} value={String(item.count)} trend="db count" />)}
        </div>
        <SectionCard title="Collector endpoint" description="The run button maps each collector to a Prisma-backed table and records an audit row.">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <Input readOnly value={meta.job} />
            <Button disabled={runJob.isPending} onClick={() => runJob.mutate()} variant="outline">Run collector</Button>
          </div>
        </SectionCard>
        {kind === 'court' ? (
          <SectionCard title="Court CSV upload" description="Multipart CSV upload endpoint writes court_judgments and ingest_runs.">
            <div className="flex flex-wrap items-end gap-3">
              <Input accept=".csv,text/csv" onChange={(event) => setFile(event.target.files?.[0])} type="file" />
              <Button disabled={courtUpload.isPending} onClick={() => courtUpload.mutate()}>Upload CSV</Button>
            </div>
          </SectionCard>
        ) : null}
        {kind === 'ocr' ? (
          <SectionCard title="OCR file submit" description="Multipart OCR submission writes ocr_tasks, ocr_results and ingest_runs.">
            <div className="flex flex-wrap items-end gap-3">
              <Input accept=".pdf,.png,.jpg,.jpeg" onChange={(event) => setFile(event.target.files?.[0])} type="file" />
              <Button disabled={ocrSubmit.isPending} onClick={() => ocrSubmit.mutate()}>Submit OCR</Button>
            </div>
          </SectionCard>
        ) : null}
        {kind === 'tianyancha' ? (
          <SectionCard title="Company search" description="Keyword search writes company_profiles and ingest_runs.">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <Input onChange={(event) => setKeyword(event.target.value)} value={keyword} />
              <Button disabled={tycSearch.isPending} onClick={() => tycSearch.mutate()}>Search</Button>
            </div>
          </SectionCard>
        ) : null}
        <SectionCard title="Audit runs" description="Latest ingest_runs rows, filtered by job on detail pages.">
          <DataTable
            columns={[
              { header: 'Job', key: 'job_name' },
              { header: 'Table', key: 'target_table' },
              { cell: (row) => <StatusBadge status={row.status === 'completed' ? 'completed' : 'pending'} />, header: 'Status', key: 'status' },
              { header: 'Upserted', key: 'upserted_count' },
              { header: 'Trace', key: 'trace_id' },
            ]}
            data={(runs.data?.items ?? []).map((row) => ({ ...row }))}
            empty="No ingest runs yet"
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
