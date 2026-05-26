import { PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

const schedule = [
  { owner: 'PM', status: 'on track', title: 'Foundation acceptance' },
  { owner: 'Commercial', status: 'watch', title: 'Material procurement' },
  { owner: 'Site lead', status: 'late risk', title: 'Main structure milestone' },
];

export default function ProjectSchedulePage({ params }: { params: { id: string } }): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader breadcrumbs={`Projects / ${params.id} / Schedule`} description="Simple schedule list. Critical path logic stays in backend for AI use." title="Project schedule" />
        <section className="grid gap-4">
          {schedule.map((item) => (
            <SectionCard key={item.title} title={item.title}>
              <div className="text-sm text-stitch-on-surface-variant">{item.owner} · {item.status}</div>
            </SectionCard>
          ))}
        </section>
      </PageContent>
    </PageLayout>
  );
}
