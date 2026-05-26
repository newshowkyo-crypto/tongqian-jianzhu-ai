import { AiDisclaimer, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

const steps = ['Policy criteria', 'Evidence upload', 'Section draft', 'Quality review'];

export default function NewDeclarationPage(): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader breadcrumbs="Gov / Declarations / New" description="Generate declaration drafts from criteria and evidence." title="AI declaration generator" />
        <section className="grid gap-4 md:grid-cols-4">
          {steps.map((step) => <SectionCard key={step} title={step}><p className="text-sm text-stitch-on-surface-variant">Manual source review required.</p></SectionCard>)}
        </section>
        <AiDisclaimer variant="footer" />
      </PageContent>
    </PageLayout>
  );
}
