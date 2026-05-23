'use client';

import { apiClient, type ReportDetail } from '@tongqian/api-client';
import { AiReportFooter, Badge, Button, ConfidenceDots, LoadingState, PageContent, PageLayout, SectionCard, TierBadge } from '@tongqian/ui';
import { useEffect, useState } from 'react';

const findingTone = {
  green: 'border-l-success-500',
  red: 'border-l-danger-500',
  yellow: 'border-l-warning-500',
} as const;

export default function ReportDetailPage({ params }: { params: { id: string } }) {
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [tab, setTab] = useState<'h5' | 'pdf'>('h5');

  useEffect(() => {
    let mounted = true;
    apiClient.report.get(params.id || 'rep-contract-monthly').then((next) => {
      if (mounted) setReport(next);
    });
    return () => {
      mounted = false;
    };
  }, [params.id]);

  if (!report) {
    return (
      <PageLayout>
        <PageContent>
          <LoadingState label="正在加载报告" />
        </PageContent>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="bg-[var(--bg)]">
      <PageContent className="space-y-6">
        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <Badge className="bg-[var(--surface-container-low)] text-[var(--primary)]">Report / {report.type}</Badge>
              <h1 className="text-3xl font-semibold text-[var(--text-primary)]">{report.title}</h1>
              <p className="text-sm text-[var(--text-secondary)]">
                {report.dateRange.from} 至 {report.dateRange.to} · {report.coBrand.tongqian ? '同乾方略联合品牌' : '标准品牌'} · {report.coBrand.clientName}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <TierBadge tier={report.tier} />
                <ConfidenceDots score={report.confidence === 'high' ? 4 : report.confidence === 'medium' ? 3 : 2} />
                <Badge>traceId: {report.traceId}</Badge>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void apiClient.report.download(report.id, 'pdf')} variant="outline">下载 PDF</Button>
              <Button onClick={() => void apiClient.report.download(report.id, 'h5')} variant="outline">下载 H5 单页</Button>
              <Button onClick={() => void apiClient.report.share(report.id, 'link')} variant="outline">分享</Button>
              <Button variant="primary">重新生成</Button>
            </div>
          </div>
        </section>

        <div className="flex gap-2">
          {(['h5', 'pdf'] as const).map((item) => (
            <button
              key={item}
              className={`min-h-10 rounded-md border px-4 text-sm ${tab === item ? 'border-[var(--accent-rose)] bg-[var(--surface-container-low)] text-[var(--text-primary)]' : 'border-[var(--outline-variant)] text-[var(--text-secondary)]'}`}
              onClick={() => setTab(item)}
              type="button"
            >
              {item === 'h5' ? 'H5 视图' : 'PDF 视图'}
            </button>
          ))}
        </div>

        <section className="grid gap-4 lg:grid-cols-[430px_1fr]">
          <article className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4 shadow-sm">
            <div className="rounded-lg bg-[var(--surface-container-low)] p-4">
              <p className="text-xs text-[var(--text-secondary)]">{tab === 'h5' ? 'H5 boss view' : 'PDF A4 preview'}</p>
              <h2 className="mt-2 text-2xl font-semibold leading-8 text-[var(--text-primary)]">{report.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                {tab === 'h5' ? '3 分钟读完的老板版，保留 5 个关键发现和底部引导按钮。' : 'PDF 详细版含封面、目录、正文、附录、数据源与水印。'}
              </p>
            </div>
            <AiReportFooter audience="owner" className="mt-4" confidence={report.confidence} disclaimer={report.disclaimer} tier={report.tier} />
          </article>

          <SectionCard title="5 个关键发现">
            <div className="grid gap-4">
              {report.findings.map((finding) => (
                <article key={finding.title} className={`rounded-md border border-[var(--outline-variant)] border-l-4 bg-[var(--surface-container-low)] p-4 ${findingTone[finding.level]}`}>
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-base font-semibold leading-6 text-[var(--text-primary)]">{finding.title}</h3>
                    <Badge>{finding.level}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{finding.detail}</p>
                </article>
              ))}
            </div>
          </SectionCard>
        </section>

        <footer className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4 text-xs leading-5 text-[var(--text-secondary)]">
          traceId: {report.traceId} · {report.disclaimer}
        </footer>
      </PageContent>
    </PageLayout>
  );
}
