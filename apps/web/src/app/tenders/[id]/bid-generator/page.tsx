import { AiDisclaimer, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

const steps = ['RFP ingest', 'Scoring extraction', 'Evidence match', 'Section drafting', 'DOCX export'];

export default function BidGeneratorPage({ params }: { params: { id: string } }): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader breadcrumbs={`Tenders / ${params.id} / Bid generator`} description="Generate bid sections from scoring criteria, RFP RAG, quality check, and DOCX export." title="AI bid proposal generator" />
        <AiDisclaimer variant="banner" />
        <section className="grid gap-4 md:grid-cols-5">
          {steps.map((step, index) => (
            <SectionCard key={step} title={`${index + 1}. ${step}`}>
              <p className="text-sm text-stitch-on-surface-variant">Requires human review before submission.</p>
            </SectionCard>
          ))}
        </section>
      </PageContent>
    </PageLayout>
  );
}
