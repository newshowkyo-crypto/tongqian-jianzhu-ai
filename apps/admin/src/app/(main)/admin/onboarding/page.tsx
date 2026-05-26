import { EmptyState, ErrorState, LoadingState, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

const rows = ['???', '???', '???', '???'];

export default function Page(): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader title="TBD_TEXT" description="TBD_TEXT" breadcrumbs="Admin / TBD_TEXT" />
        <SectionCard className="border-stitch-outline-variant shadow-none" title="TBD_TEXT">
          <table className="w-full text-sm">
            <tbody>{rows.map((row, index) => <tr className="h-10 border-b border-stitch-outline-variant hover:bg-stitch-surface-container-low" key={row}><td className="px-4 text-xs text-stitch-on-surface-variant">{index + 1}</td><td className="px-4 text-stitch-on-surface">{row}</td><td className="px-4 text-right text-xs text-stitch-primary">conservative</td></tr>)}</tbody>
          </table>
        </SectionCard>
        <section className="mt-4 grid gap-4 lg:grid-cols-3">
          <LoadingState label="TBD_TEXT" rows={2} />
          <EmptyState title="TBD_TEXT" description="TBD_TEXT" />
          <ErrorState title="TBD_TEXT" description="TBD_TEXT" />
        </section>
      </PageContent>
    </PageLayout>
  );
}
