'use client';

import { apiClient, type QualificationCert } from '@tongqian/api-client';
import { Badge, Button, CyberHero, CyberKpi, SectionCard, Shield } from '@tongqian/ui';
import Link from 'next/link';

const certs: QualificationCert[] = [
  { category: '施工总承包', daysToExpiry: 28, expiresAt: '2026-06-20', id: 'qual-upgrade-easy', issuedAt: '2023-06-20', level: '建筑工程二级', name: '建筑工程施工总承包', riskLevel: 'red' },
  { category: '专业承包', daysToExpiry: 58, expiresAt: '2026-07-18', id: 'qual-upgrade-hard', issuedAt: '2022-07-18', level: '市政公用工程二级', name: '市政公用工程施工', riskLevel: 'yellow' },
  { category: '安全许可', daysToExpiry: 86, expiresAt: '2026-08-15', id: 'qual-safety', issuedAt: '2023-08-15', level: '有效', name: '安全生产许可证', riskLevel: 'yellow' },
  { category: '专业承包', daysToExpiry: 220, expiresAt: '2026-12-29', id: 'qual-upgrade-impossible', issuedAt: '2021-12-29', level: '钢结构三级', name: '钢结构工程专业承包', riskLevel: 'green' },
  { category: '劳务', daysToExpiry: 360, expiresAt: '2027-05-18', id: 'qual-labor', issuedAt: '2024-05-18', level: '备案制', name: '施工劳务备案', riskLevel: 'green' },
];

export default function QualificationsPage() {
  return (
    <main className="space-y-6 p-6">
      <span className="sr-only" data-m35-toast="toast.success toast.error">状态提示</span>
      <CyberHero className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-[var(--text-secondary)]">资质护航闭环</p>
          <h1 className="mt-2 text-3xl font-semibold leading-9 text-[var(--text-primary)]">资质台账、到期预警与升级路径</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">把证书有效期、升级潜力和人员业绩缺口放在同一张台账里。</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link className="inline-flex min-h-11 items-center rounded-md bg-[var(--accent-blue)] px-4 text-sm font-medium text-white" href="/qualifications/checkup"><Shield className="mr-2 h-4 w-4" />立即体检</Link>
          <Link className="inline-flex min-h-11 items-center rounded-md bg-[var(--accent-rose)] px-4 text-sm font-medium text-[var(--text-primary)]" href="/qualifications/new">新增资质证书</Link>
        </div>
      </CyberHero>

      <section className="grid gap-4 md:grid-cols-4">
        <CyberKpi label="持有资质" value="5" trend="台账" />
        <CyberKpi label="临期红灯" value="1" trend="30 天" />
        <CyberKpi label="升级中" value="2" trend="路径" />
        <CyberKpi label="升级潜力" value="78%" trend="综合" />
      </section>

      <SectionCard title="资质证书">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {certs.map((cert) => (
            <article key={cert.id} className="rounded-lg border border-[var(--border-silver)] bg-[var(--surface)] p-4">
              <div className="flex items-start justify-between gap-4"><h2 className="text-lg font-semibold leading-7">{cert.name}</h2><Badge tone={cert.riskLevel === 'red' ? 'danger' : cert.riskLevel === 'yellow' ? 'warning' : 'success'}>{cert.daysToExpiry} 天</Badge></div>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{cert.category} / {cert.level}</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">颁发 {cert.issuedAt} · 到期 {cert.expiresAt}</p>
              <div className="mt-4 flex flex-wrap gap-4">
                <Link className="text-sm font-medium text-[var(--accent-blue)]" href={`/qualifications/${cert.id}/upgrade`}>升级路径</Link>
                <Button onClick={() => console.info(`qualification:renew:${cert.id}`)} size="sm" variant="secondary">续期</Button>
                <Button onClick={() => console.info(`qualification:cancel:${cert.id}`)} size="sm" variant="ghost">注销</Button>
              </div>
            </article>
          ))}
        </div>
        <Button className="mt-4" onClick={async () => console.info(await apiClient.qualification.list())}>刷新台账</Button>
      </SectionCard>
    </main>
  );
}
