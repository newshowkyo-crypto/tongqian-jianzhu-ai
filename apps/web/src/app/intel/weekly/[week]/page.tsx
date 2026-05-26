import { AiDisclaimer, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

const blocks = ['Industry news', 'Same-province peers', 'Policy windows', 'Tongqian viewpoint'];

export default function PeerIntelWeeklyPage({ params }: { params: { week: string } }): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader breadcrumbs={`Intel / ${params.week}`} description="Weekly peer intelligence for owner decisions." title="Peer intel weekly" />
        <section className="grid gap-4 md:grid-cols-2">
          {blocks.map((block) => <SectionCard key={block} title={block}><p className="text-sm text-stitch-on-surface-variant">Actionable summary and source review queue.</p></SectionCard>)}
        </section>
        <AiDisclaimer variant="footer" />
      </PageContent>
    </PageLayout>
  );
}
