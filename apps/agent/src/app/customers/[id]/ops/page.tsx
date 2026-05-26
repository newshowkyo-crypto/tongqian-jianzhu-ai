import { AiDisclaimer, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

const tabs = ['moments', 'holiday', 'followUp', 'renewal'];

export default function CustomerOpsPage({ params }: { params: { id: string } }): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader breadcrumbs={`Customers / ${params.id} / Ops`} description="Generate customer operation copy for four high-value scenarios." title="Customer ops assistant" />
        <section className="grid gap-4 md:grid-cols-4">
          {tabs.map((tab) => <SectionCard key={tab} title={tab}><button className="rounded-md bg-stitch-primary-container px-4 py-2 text-sm text-white">Generate</button></SectionCard>)}
        </section>
        <AiDisclaimer variant="footer" />
      </PageContent>
    </PageLayout>
  );
}
