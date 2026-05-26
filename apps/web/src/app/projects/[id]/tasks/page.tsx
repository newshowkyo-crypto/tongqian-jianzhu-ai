import { PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

const tasks = [
  { due: 'Today', owner: 'Finance', title: 'Confirm receivable evidence' },
  { due: '3 days', owner: 'Technical', title: 'Review drawing version change' },
  { due: '7 days', owner: 'PM', title: 'Submit site progress note' },
];

export default function ProjectTasksPage({ params }: { params: { id: string } }): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader breadcrumbs={`Projects / ${params.id} / Tasks`} description="Simple task list without drag board complexity." title="Project tasks" />
        <section className="grid gap-4">
          {tasks.map((task) => (
            <SectionCard key={task.title} title={task.title}>
              <div className="text-sm text-stitch-on-surface-variant">{task.owner} · due {task.due}</div>
            </SectionCard>
          ))}
        </section>
      </PageContent>
    </PageLayout>
  );
}
