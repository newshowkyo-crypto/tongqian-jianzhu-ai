import { AiDisclaimer, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

const certs = ['一级建造师', '二级建造师', '监理工程师', '注册结构师'];

export default function CertMonitorPage(): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader breadcrumbs="个人办公 / 证书监控" description="到期提醒、继续教育学时和政策快查。" title="个人证书监控" />
        <section className="grid gap-4 md:grid-cols-2">
          {certs.map((cert) => <SectionCard key={cert} title={cert}><p className="text-sm text-stitch-on-surface-variant">继续教育学时待核查 · 到期提醒已开启。</p></SectionCard>)}
        </section>
        <AiDisclaimer variant="footer" />
      </PageContent>
    </PageLayout>
  );
}
