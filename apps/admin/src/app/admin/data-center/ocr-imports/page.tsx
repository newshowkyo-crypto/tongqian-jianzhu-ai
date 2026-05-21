'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, DataTable, EmptyState, ErrorState, FilterBar, Input, LoadingState, PageContent, PageHeader, PageLayout, SectionCard, StatCard, StatusBadge } from '@tongqian/ui';
import { useMemo, useState } from 'react';

type DataRow = { actions: string; id: string; title: string; source: string; score: number; status: 'archived' | 'golden' | 'pending_review'; updatedAt: string; owner: string };

const collectors = ['legal-regulation-scraper', 'tender-announcement-scraper', 'policy-fund-scraper', 'industry-news-scraper', 'doc-template-scraper', 'mohurd-standards-scraper', 'wenshu-csv-importer', 'tianyancha-bulk-import', 'ocr-paper-import', 'friend-circle-collector'];
const seedRows: DataRow[] = Array.from({ length: 9 }, (_, index) => ({ actions: 'detail', id: 'ocr-imports-' + (index + 1), title: 'OCR Imports golden candidate ' + (index + 1), source: ['gov.cn', 'mohurd.gov.cn', 'csv-dataset', 'aliyun-ocr-mock'][index % 4] ?? 'mock', score: 58 + index * 5, status: index % 3 === 0 ? 'golden' : index % 3 === 1 ? 'pending_review' : 'archived', updatedAt: new Date(Date.now() - index * 86400000).toISOString().slice(0, 10), owner: 'platform-owner' }));

async function mockFetch(): Promise<{ rows: DataRow[]; stats: Array<{ label: string; value: string; trend: string }> }> {
  await new Promise((resolve) => setTimeout(resolve, 120));
  return { rows: seedRows, stats: [{ label: 'Today', value: String(seedRows.length), trend: '+18%' }, { label: 'Review', value: String(seedRows.filter((item) => item.status === 'pending_review').length), trend: '30min' }, { label: 'Golden', value: String(seedRows.filter((item) => item.status === 'golden').length), trend: '+6' }, { label: 'Archived', value: String(seedRows.filter((item) => item.status === 'archived').length), trend: 'evidence' }] };
}

function statusToUi(status: DataRow['status']): 'completed' | 'failed' | 'pending' { return status === 'golden' ? 'completed' : status === 'pending_review' ? 'pending' : 'failed'; }

export default function DataCenterOcrImportsPage() {
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState<DataRow | null>(null);
  const [toast, setToast] = useState('');
  const query = useQuery({ queryFn: mockFetch, queryKey: ['admin', 'data-center', 'ocr-imports'], staleTime: 30000 });
  const trigger = useMutation({ mutationFn: async (collector: string) => ({ collector, jobId: collector + '-' + Date.now() }), onSuccess: (result) => setToast('Started ' + result.collector + ' / ' + result.jobId) });
  const rows = query.data?.rows ?? [];
  const filtered = useMemo(() => rows.filter((row) => (status === 'all' || row.status === status) && (keyword.length === 0 || JSON.stringify(row).toLowerCase().includes(keyword.toLowerCase()))).sort((a, b) => b.score - a.score), [keyword, rows, status]);

  return (
    <PageLayout>
      <PageHeader breadcrumbs="Admin / Data Center / OCR Imports" description="Paper contracts, tenders, feasibility and funding files digitized." title="OCR Imports" actions={<Button className="min-h-11 data-ripple" onClick={() => trigger.mutate('ocr-imports')}>Collect now</Button>} />
      <PageContent className="space-y-5 data-center-surface">
        {query.isLoading ? <LoadingState label="Loading data center records" /> : null}
        {query.isError ? <ErrorState title="Data center failed" description="Retry keeps mock-real interface available." onRetry={() => void query.refetch()} /> : null}
        <div className="rounded-lg border border-[#b5bcc8] bg-white/80 p-4 text-sm text-[#0a1d3d]">Interface-first pipeline: missing API/OCR/CSV credentials use mock providers while preserving the exact fields, review flow and progress contract.</div>
        <div className="grid gap-3 md:grid-cols-4">{(query.data?.stats ?? []).map((item) => <StatCard key={item.label} label={item.label} value={item.value} trend={item.trend} />)}</div>
        <SectionCard title="OCR upload progress" description="Paper contracts, tender files, feasibility studies and funding applications go through OCR plus structured extraction."><div className="rounded-xl border border-dashed border-[#4a8eff] p-6"><p className="text-sm text-neutral-600">mock-contract.pdf / 3 pages / OCR processing mock</p><div className="mt-3 h-3 overflow-hidden rounded-full bg-neutral-100"><div className="h-full w-3/4 bg-[#4a8eff] data-progress-fill" /></div></div></SectionCard>
        <SectionCard title="Collector control" description="6 cron jobs plus 4 manual collectors. Founder review focuses on pending and low-confidence rows.">
          <div className="grid gap-2 md:grid-cols-5">{collectors.map((collector) => <Button key={collector} className="min-h-11 data-ripple" onClick={() => trigger.mutate(collector)} variant="outline">{collector}</Button>)}</div>
        </SectionCard>
        <FilterBar>
          <Input placeholder="Search title, source, owner" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
          <select className="min-h-11 rounded-md border border-neutral-300 px-3" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All</option><option value="golden">Golden</option><option value="pending_review">Pending</option><option value="archived">Archived</option>
          </select>
        </FilterBar>
        <SectionCard title="AI scored records" description="Authority 30%, timeliness 20%, completeness 25%, applicability 15%, uniqueness 10%.">
          {filtered.length === 0 ? <EmptyState title="No data" description="Start a collector or upload CSV/OCR samples." action={<Button onClick={() => setStatus('all')}>Clear filters</Button>} /> : <DataTable columns={[{ key: 'title', header: 'Title' }, { key: 'source', header: 'Source' }, { key: 'score', header: 'AI Score' }, { key: 'status', header: 'Status', cell: (row: DataRow) => <StatusBadge status={statusToUi(row.status)} /> }, { key: 'updatedAt', header: 'Updated' }, { key: 'actions', header: 'Action', cell: (row: DataRow) => <Button onClick={() => setSelected(row)} variant="outline">Detail</Button> }]} data={filtered} />}
        </SectionCard>
        {selected ? <SectionCard title="AI scoring detail" description="Drawer-equivalent review panel for founder 30-minute daily workflow."><div className="space-y-3 text-sm"><p>Title: {selected.title}</p><p>Score: {selected.score}</p><p>Reason: authoritative source, complete structure and strong construction applicability. Review weak dimensions before promoting to golden library.</p><div className="flex gap-2"><Button onClick={() => setToast('Promoted to golden')}>Promote</Button><Button variant="outline" onClick={() => setToast('Archived')}>Archive</Button><Button variant="ghost" onClick={() => setSelected(null)}>Close</Button></div></div></SectionCard> : null}
        {toast ? <div className="rounded-md border border-success-500 bg-success-50 p-3 text-sm text-success-700">{toast}</div> : null}
      </PageContent>
    </PageLayout>
  );
}

