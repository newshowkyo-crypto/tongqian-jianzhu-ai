import { AiDisclaimer, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

const dimensions = [
  ['Qualification fit', 88],
  ['ROI estimate', 74],
  ['Cashflow pressure', 68],
  ['Peer competition', 62],
  ['Schedule fit', 80],
];

export default function TenderDecisionPage({ params }: { params: { id: string } }): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader breadcrumbs={`Tenders / ${params.id} / Decision`} description="Comprehensive go/no-go advice. Final authority stays with the owner." title="Bid decision advisor" />
        <SectionCard title="Recommendation: review before bid">
          <div className="text-3xl font-semibold text-stitch-primary">76</div>
          <div className="mt-4 grid gap-4 md:grid-cols-5">
            {dimensions.map(([name, value]) => <div className="rounded-lg border border-stitch-outline-variant p-4 text-sm" key={name}>{name}<strong className="block text-xl">{value}</strong></div>)}
          </div>
          <AiDisclaimer customText="AI advice is for reference. You keep final decision authority." variant="footer" />
        </SectionCard>
      </PageContent>
    </PageLayout>
  );
}
