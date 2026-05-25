import { EmptyState, ErrorState, LoadingState, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

export default function Page(): JSX.Element {
  const agent = true;
  return (
    <PageLayout className={agent ? 'bg-gradient-to-br from-steward-start via-steward-mid to-steward-end text-white' : 'border-t-4 border-danger-500 bg-stitch-surface text-stitch-on-surface text-base'}>
      <PageContent>
        <PageHeader title="????" description="?????????????????" breadcrumbs={agent ? '???? / ???' : '?? / ??'} actions={<button className={agent ? 'rounded-md bg-accent-500 px-4 py-2 text-sm font-semibold text-white' : 'rounded-md bg-primary-700 px-4 py-2 text-sm font-semibold text-white'}>{agent ? '????' : '????'}</button>} />
        <section className="grid gap-4 md:grid-cols-3">
          {['????', '????', '????'].map((item, index) => <SectionCard className={agent ? 'border-white/20 bg-white/10 text-white' : 'border-stitch-outline-variant bg-white shadow-none'} key={item}><div className="text-sm opacity-80">{item}</div><div className="mt-2 text-3xl font-semibold tabular-nums">{index === 0 ? '860' : index === 1 ? '12' : '?'}</div></SectionCard>)}
        </section>
        <section className="mt-4 grid gap-4 lg:grid-cols-3">
          <LoadingState label="??????" rows={2} />
          <EmptyState title="?????" description="?????????" />
          <ErrorState title="????" description="???????????" />
        </section>
      </PageContent>
    </PageLayout>
  );
}
