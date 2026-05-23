import { AiReportFooter, Badge, CyberHero, CyberKpi, SectionCard, TierBadge } from '@tongqian/ui';
import { apiClient } from '@tongqian/api-client';

export default async function QualificationCheckupPage() {
  const report = await apiClient.qualification.checkup();

  return (
    <main className="space-y-6 p-6">
      <CyberHero>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--text-secondary)]">2026 Q2 资质体检报告</p>
            <h1 className="mt-2 text-3xl font-semibold leading-9 text-[var(--text-primary)]">总评分 {report.overallScore}/100</h1>
          </div>
          <TierBadge tier={report.tier} />
        </div>
      </CyberHero>

      <section className="grid gap-4 md:grid-cols-4">
        <CyberKpi label="合规项" value="12" trend="通过" />
        <CyberKpi label="缺口项" value={String(report.gaps.length)} trend="待补" />
        <CyberKpi label="临期项" value={String(report.expiring.length)} trend="30 天" />
        <CyberKpi label="升级机会" value={String(report.upgradable.length)} trend="可推进" />
      </section>

      <SectionCard title="临期 30 天证书清单">
        <div className="grid gap-4">{report.expiring.map((cert) => <article key={cert.id} className="rounded-lg border border-danger-200 bg-danger-50 p-4"><strong>{cert.name}</strong><p className="mt-2 text-sm text-danger-700">到期 {cert.expiresAt}，剩余 {cert.daysToExpiry} 天</p></article>)}</div>
      </SectionCard>

      <SectionCard title="升级机会">
        <div className="grid gap-4 md:grid-cols-3">{report.upgradable.map((item) => <article key={item.from} className="rounded-lg border border-warning-100 bg-warning-50 p-4"><strong>{item.from} → {item.to}</strong><p className="mt-2 text-sm text-warning-700">潜力 {item.potential}%</p></article>)}</div>
      </SectionCard>

      <SectionCard title="缺口分析">
        <div className="grid gap-4">{report.gaps.map((gap) => <article key={gap.area} className="rounded-lg border border-[var(--border-silver)] bg-[var(--surface)] p-4"><strong>{gap.area}</strong><p className="mt-2 text-sm text-[var(--text-secondary)]">{gap.description}</p><p className="mt-2 text-sm text-[var(--accent-blue)]">{gap.suggestion}</p></article>)}</div>
      </SectionCard>

      <AiReportFooter audience="owner" confidence={report.confidence} disclaimer={report.disclaimer} tier={report.tier} />
    </main>
  );
}
