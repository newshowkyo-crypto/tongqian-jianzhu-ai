import { AiDisclaimer, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

const workflows = ['bulk_collection', 'bid_prep', 'qual_renew', 'customer_dd', 'opp_mining'];

export default function WorkflowsPage(): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader breadcrumbs="Workflows" description="AI turns intent into multi-tool execution." title="AI workflows" />
        <section className="grid gap-4 md:grid-cols-2">
          {workflows.map((item) => <SectionCard key={item} title={item}><p className="text-sm text-stitch-on-surface-variant">Template is ready for serial tool execution.</p></SectionCard>)}
        </section>
        <AiDisclaimer variant="footer" />
      </PageContent>
    </PageLayout>
  );
}
