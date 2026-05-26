import { EmptyState, ErrorState, LoadingState, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

const metrics = [
  ['TBD_TEXT', '92%'],
  ['TBD_TEXT', '3'],
  ['AI ???', '?'],
];

export default function Page(): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader title="RFP TBD_TEXT" description="TBD_TEXT" breadcrumbs="?? / RFP TBD_TEXT" actions={<button className="rounded-md bg-stitch-primary-container px-4 py-2 text-sm font-medium text-white">TBD_TEXT</button>} />
        <section className="grid gap-4 md:grid-cols-3">
          {metrics.map(([label, value]) => <SectionCard key={label}><div className="text-xs text-stitch-on-surface-variant">{label}</div><div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div></SectionCard>)}
        </section>
        <section className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <SectionCard title="???" description="Stitch design system aligned dense enterprise surface.">
            <div className="grid gap-4 md:grid-cols-2">
              {['TBD_TEXT', 'TBD_TEXT', 'TBD_TEXT', 'TBD_TEXT'].map((item) => <div className="rounded-lg border border-stitch-outline-variant bg-stitch-surface-container-low p-4 text-sm" key={item}>{item}</div>)}
            </div>
          </SectionCard>
          <SectionCard title="TBD_TEXT">
            <div className="space-y-4">
              <LoadingState label="TBD_TEXT" rows={2} />
              <EmptyState title="TBD_TEXT" description="TBD_TEXT" />
              <ErrorState title="TBD_TEXT" description="AI TBD_TEXT" />
            </div>
          </SectionCard>
        </section>
      </PageContent>
    </PageLayout>
  );
}
