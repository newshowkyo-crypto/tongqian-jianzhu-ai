import { AiDisclaimer, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

const members = ['project_owner', 'finance', 'technical', 'subcontractor', 'supervisor'];
const resources = ['contract', 'progress', 'risk', 'receivable'];

export default function ProjectSpacePage({ params }: { params: { id: string } }): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader breadcrumbs={`Projects / ${params.id} / Space`} description="Invite collaborators and share project materials." title="Project collaboration space" />
        <section className="grid gap-4 md:grid-cols-2">
          <SectionCard title="Members">{members.map((item) => <div className="py-2 text-sm" key={item}>{item}</div>)}<button className="mt-4 rounded-md bg-stitch-primary-container px-4 py-2 text-sm text-white">Invite by SMS</button></SectionCard>
          <SectionCard title="Shared resources">{resources.map((item) => <div className="py-2 text-sm" key={item}>{item}</div>)}</SectionCard>
        </section>
        <AiDisclaimer variant="footer" />
      </PageContent>
    </PageLayout>
  );
}
