import { PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

const annotations = ['A-3 轴梁高需复核', '门窗洞口尺寸影响清单', '材料说明需同步预算'];
const viewerRuntime = 'pdfjs-compatible preview without heavy viewer dependency';

export default function DrawingViewerPage({ params }: { params: { drawingId: string; id: string } }): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader breadcrumbs={`项目 / ${params.id} / 图纸 / ${params.drawingId}`} description="PDF 页图预览、坐标批注、AI 快照解释。" title="图纸轻量查看" />
        <section className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <div className="min-h-[520px] rounded-lg border border-stitch-outline-variant bg-stitch-surface-container-low p-4">
            <div className="text-xs text-stitch-on-surface-variant">{viewerRuntime}</div>
            <div className="mt-4 grid aspect-[4/3] place-items-center rounded-md border border-dashed border-stitch-outline text-sm text-stitch-on-surface-variant">Page 1 preview + annotation layer</div>
          </div>
          <SectionCard title="AI 快照解释">
            <ul className="space-y-2 text-sm text-stitch-on-surface-variant">
              {annotations.map((item) => <li key={item}>- {item}</li>)}
            </ul>
            <button className="mt-4 rounded-md bg-stitch-primary-container px-4 py-2 text-sm font-medium text-white">生成快照</button>
          </SectionCard>
        </section>
      </PageContent>
    </PageLayout>
  );
}
