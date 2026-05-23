import { AiReportFooter, Badge, Button, ConfidenceDots, SectionCard, Shield, TierBadge } from '@tongqian/ui';
import { AlertTriangle, FileSearch } from '@tongqian/ui';
import { apiClient, type RiskReviewFinding } from '@tongqian/api-client';

const riskTone = { green: 'success', red: 'danger', yellow: 'warning' } as const;

export default async function ContractReviewDetailPage({ params }: { params: { id: string } }) {
  const detail = await apiClient.riskReview.get(params.id);
  const attentionCount = detail.findings.filter((finding: RiskReviewFinding) => finding.level !== 'green').length;

  return (
    <main className="space-y-6 p-6">
      <nav className="text-sm text-[var(--text-secondary)]">合同审查 / {detail.title}</nav>
      <header className="rounded-lg border border-[var(--border-silver)] bg-[var(--bg-glass)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--text-secondary)]">{detail.counterparty} · {detail.amount}</p>
            <h1 className="mt-2 text-3xl font-semibold leading-9 text-[var(--text-primary)]">{detail.title}</h1>
          </div>
          <TierBadge tier={detail.tier} />
        </div>
        <div className={`mt-6 rounded-lg border p-5 ${detail.riskLevel === 'red' ? 'border-danger-200 bg-danger-50 text-danger-700' : detail.riskLevel === 'yellow' ? 'border-warning-100 bg-warning-50 text-warning-700' : 'border-success-100 bg-success-50 text-success-700'}`}>
          <AlertTriangle className="mr-2 inline h-5 w-5" />
          总体风险：{detail.riskLevel}，发现 {attentionCount} 处需关注
        </div>
        <div className="mt-4 flex items-center gap-3 text-sm text-[var(--text-secondary)]">
          <span>AI 信心度</span>
          <ConfidenceDots score={detail.confidence === 'high' ? 4 : detail.confidence === 'medium' ? 3 : 2} />
        </div>
      </header>

      <section className="grid gap-4">
        {detail.findings.map((finding: RiskReviewFinding) => (
          <article key={finding.id} className={`rounded-lg border border-[var(--border-silver)] bg-[var(--surface)] p-5 ${finding.level === 'red' ? 'border-l-4 border-l-danger-500' : finding.level === 'yellow' ? 'border-l-4 border-l-warning-500' : 'border-l-4 border-l-success-500'}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold leading-7 text-[var(--text-primary)]">{finding.type}</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">触发条款：{finding.clause}</p>
              </div>
              <Badge tone={riskTone[finding.level]}>{finding.level}</Badge>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">{finding.impact}</p>
            <div className="mt-4 rounded-lg bg-[var(--surface-container-low)] p-4 text-sm leading-6 text-[var(--text-primary)]">
              <strong>修改建议：</strong>{finding.suggestion}
              {finding.standardWording ? <p className="mt-2"><strong>标准措辞：</strong>{finding.standardWording}</p> : null}
            </div>
          </article>
        ))}
      </section>

      <SectionCard title="下一步动作">
        <AiReportFooter audience="owner" confidence={detail.confidence} disclaimer={detail.disclaimer} tier={detail.tier} />
        <div className="mt-4 flex flex-wrap gap-3">
          <Button><FileSearch className="mr-2 h-4 w-4" />导出修改清单</Button>
          <Button variant="secondary"><Shield className="mr-2 h-4 w-4" />记录人工复核</Button>
        </div>
      </SectionCard>
      <footer className="rounded-lg border border-[var(--border-silver)] p-4 text-xs leading-5 text-[var(--text-secondary)]">{detail.disclaimer}</footer>
    </main>
  );
}
