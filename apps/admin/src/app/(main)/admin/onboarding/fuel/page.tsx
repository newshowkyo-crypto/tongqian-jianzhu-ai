import { EmptyState, ErrorState, LoadingState, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

const rows = ['???', '???', '???', '???'];

export default function Page(): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader title="??????" description="?????????????????" breadcrumbs="Admin / ??????" />
        <SectionCard className="border-stitch-outline-variant shadow-none" title="?????">
          <table className="w-full text-sm">
            <tbody>{rows.map((row, index) => <tr className="h-10 border-b border-stitch-outline-variant hover:bg-stitch-surface-container-low" key={row}><td className="px-4 text-xs text-stitch-on-surface-variant">{index + 1}</td><td className="px-4 text-stitch-on-surface">{row}</td><td className="px-4 text-right text-xs text-stitch-primary">conservative</td></tr>)}</tbody>
          </table>
        </SectionCard>
        <section className="mt-4 grid gap-4 lg:grid-cols-3">
          <LoadingState label="??????" rows={2} />
          <EmptyState title="????" description="???????????" />
          <ErrorState title="??????" description="???????????" />
        </section>
      </PageContent>
    </PageLayout>
  );
}
