import { PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

const drawings = [
  { id: 'dwg-001', name: '结构首层平面图.pdf', pages: 12, status: '已生成快照' },
  { id: 'dwg-002', name: '建筑变更版.pdf', pages: 8, status: '待复核' },
];

export default function ProjectDrawingsPage({ params }: { params: { id: string } }): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader breadcrumbs={`项目 / ${params.id} / 图纸`} description="轻量上传、预览、批注和 AI 快照解释。" title="项目图纸" />
        <section className="grid gap-4 lg:grid-cols-2">
          {drawings.map((drawing) => (
            <SectionCard key={drawing.id} title={drawing.name}>
              <div className="text-sm text-stitch-on-surface-variant">{drawing.pages} 页 · {drawing.status}</div>
              <a className="mt-4 inline-flex rounded-md bg-stitch-primary-container px-4 py-2 text-sm font-medium text-white" href={`/projects/${params.id}/drawings/${drawing.id}`}>打开图纸</a>
            </SectionCard>
          ))}
        </section>
      </PageContent>
    </PageLayout>
  );
}
