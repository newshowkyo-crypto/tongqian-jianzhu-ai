import { EmptyState, ErrorState, LoadingState, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

const findings = [
  ['red', '??????', '???????????????'],
  ['yellow', '??????', '????????????'],
  ['green', '??????', '??????????'],
];

export default function ReportDetailPage(): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader title="AI ??????" description="????????????CTA??????????? stitch _5?" breadcrumbs="???? / H5" actions={<button className="rounded-md bg-stitch-primary-container px-4 py-2 text-sm font-semibold text-white">????</button>} />
        <section className="grid gap-4 lg:grid-cols-[420px_1fr]">
          <SectionCard className="bg-stitch-error-container text-stitch-on-error-container" title="????">
            <div className="text-3xl font-semibold">??</div>
            <p className="mt-4 text-sm">AI ????????????????????</p>
          </SectionCard>
          <SectionCard title="????">
            <div className="grid gap-4">{findings.map(([level, title, detail]) => <article className="rounded-lg border border-stitch-outline-variant bg-stitch-surface-container-low p-4" key={title}><div className="text-xs uppercase text-stitch-on-surface-variant">{level}</div><h2 className="mt-1 font-semibold">{title}</h2><p className="mt-2 text-sm text-stitch-on-surface-variant">{detail}</p></article>)}</div>
          </SectionCard>
        </section>
        <section className="mt-4 grid gap-4 lg:grid-cols-3"><LoadingState label="??????" rows={2} /><EmptyState title="????" description="????????????" /><ErrorState title="????" description="AI ?????????????????????" /></section>
      </PageContent>
    </PageLayout>
  );
}
