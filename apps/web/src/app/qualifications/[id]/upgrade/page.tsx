import { apiClient } from '@tongqian/api-client';
import { AiReportFooter, Badge, CyberCard, CyberHero, SectionCard, TierBadge } from '@tongqian/ui';

export default async function QualificationUpgradePage({ params }: { params: { id: string } }) {
  const report = await apiClient.qualification.upgradePath(params.id, '一级');

  return (
    <main className="space-y-6 p-6">
      <CyberHero>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--text-secondary)]">升级路径</p>
            <h1 className="mt-2 text-3xl font-semibold leading-9 text-[var(--text-primary)]">{report.current} → {report.target}</h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">预计 {report.estimatedMonths} 个月 · 推荐 {report.recommendedRoute}</p>
          </div>
          <TierBadge tier={report.tier} />
        </div>
      </CyberHero>

      <section className="grid gap-4 md:grid-cols-4">
        {report.gaps.map((gap) => <CyberCard key={gap.dimension}><h2 className="text-lg font-semibold">{gap.dimension}</h2><p className="mt-2 text-sm text-[var(--text-secondary)]">要求：{gap.required}</p><p className="mt-2 text-sm">当前：{gap.current}</p><Badge className="mt-4" tone={gap.missing.includes('缺') ? 'warning' : 'success'}>{gap.missing}</Badge></CyberCard>)}
      </section>

      <SectionCard title="推荐路径">
        <div className="grid gap-4 md:grid-cols-3">
          {report.routes.map((route) => <article key={route.name} className="rounded-lg border border-[var(--border-silver)] p-4"><strong>{route.name}</strong><p className="mt-2 text-sm text-[var(--text-secondary)]">{route.description}</p></article>)}
        </div>
      </SectionCard>

      <AiReportFooter audience="owner" confidence={report.confidence} disclaimer={report.disclaimer} tier={report.tier} />
    </main>
  );
}
