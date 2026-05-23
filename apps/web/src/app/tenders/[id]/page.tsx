import { apiClient, type TenderEligibilityCheck, type TenderTimeline } from '@tongqian/api-client';
import { AiReportFooter, Badge, CyberHero, FileSearch, SectionCard, TierBadge } from '@tongqian/ui';
import Link from 'next/link';

export default async function TenderDetailPage({ params }: { params: { id: string } }) {
  const detail = await apiClient.tender.get(params.id);

  return (
    <main className="space-y-6 p-6">
      <nav className="text-sm text-[var(--text-secondary)]">招标中心 / {detail.title}</nav>
      <CyberHero>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--text-secondary)]">{detail.owner} · {detail.amount}</p>
            <h1 className="mt-2 text-3xl font-semibold leading-9 text-[var(--text-primary)]">{detail.title}</h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">匹配度 {detail.matchScore}% · 截止 {detail.deadline}</p>
          </div>
          <TierBadge tier={detail.tier} />
        </div>
      </CyberHero>

      <SectionCard title="10 项速读">
        <div className="grid gap-4 md:grid-cols-2">
          {detail.keyPoints.map((point, index) => <div key={point} className="rounded-lg border border-[var(--border-silver)] p-4 text-sm leading-6"><Badge tone="neutral">{index + 1}</Badge><span className="ml-2">{point}</span></div>)}
        </div>
      </SectionCard>

      <SectionCard title="资格自查清单">
        <div className="grid gap-4">
          {detail.eligibility.map((item: TenderEligibilityCheck) => (
            <article key={item.item} className="rounded-lg border border-[var(--border-silver)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-4"><strong>{item.item}</strong><Badge tone={item.match ? 'success' : 'warning'}>{item.match ? '满足' : '差距'}</Badge></div>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">要求：{item.required}；我方：{item.ourStatus}</p>
              {item.gap ? <p className="mt-2 text-sm text-warning-700">补救建议：{item.gap}</p> : null}
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="关键时间表">
        <div className="grid gap-4 md:grid-cols-5">
          {detail.timeline.map((item: TenderTimeline) => <div key={item.milestone} className="rounded-lg border border-[var(--border-silver)] p-4"><strong>{item.milestone}</strong><p className="mt-2 text-sm text-[var(--text-secondary)]">{item.date}</p><p className="text-xs text-[var(--text-secondary)]">剩余 {item.daysFromNow} 天</p></div>)}
        </div>
      </SectionCard>

      <SectionCard title="评分预判">
        <div className="grid gap-4 md:grid-cols-3">
          <Badge tone="success">技术 {detail.scorePrediction.technical}</Badge>
          <Badge tone="warning">商务 {detail.scorePrediction.commercial}</Badge>
          <Badge tone="neutral">价格 {detail.scorePrediction.price}</Badge>
        </div>
        <ul className="mt-4 grid gap-2 text-sm text-[var(--text-secondary)]">{detail.scorePrediction.suggestions.map((item) => <li key={item}>{item}</li>)}</ul>
      </SectionCard>

      <SectionCard title="下一步">
        <AiReportFooter audience="owner" confidence={detail.confidence} disclaimer={detail.disclaimer} tier={detail.tier} />
        <Link className="mt-4 inline-flex min-h-11 items-center rounded-md bg-[var(--accent-blue)] px-4 text-sm font-medium text-white" href={`/tenders/${detail.id}/framework`}><FileSearch className="mr-2 h-4 w-4" />生成投标框架</Link>
      </SectionCard>
    </main>
  );
}
