import { AiDisclaimer, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

const steps = ['query data', 'write draft', 'send or export', 'track result'];

export default function WorkflowDetailPage({ params }: { params: { id: string } }): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader breadcrumbs={`Workflows / ${params.id}`} description="Step progress and graceful failure handling." title="Workflow detail" />
        <section className="grid gap-4">
          {steps.map((step, index) => <SectionCard key={step} title={`${index + 1}. ${step}`}><button className="rounded-md border border-stitch-outline-variant px-4 py-2 text-sm">Cancel</button></SectionCard>)}
        </section>
        <AiDisclaimer variant="footer" />
      </PageContent>
    </PageLayout>
  );
}
