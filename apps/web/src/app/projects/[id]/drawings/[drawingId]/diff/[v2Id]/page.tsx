import { PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

const changes = [
  { impact: '钢筋和混凝土工程量需复核', location: 'A-3 轴', title: '梁截面调整' },
  { impact: '预算清单材料项需同步', location: '总说明', title: '混凝土等级变化' },
  { impact: '施工前交底需确认', location: '门窗表', title: '门窗编号更新' },
];

export default function DrawingDiffPage({ params }: { params: { drawingId: string; id: string; v2Id: string } }): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader breadcrumbs={`项目 / ${params.id} / 图纸差异`} description={`${params.drawingId} → ${params.v2Id}`} title="图纸版本对比" />
        <section className="grid gap-4 lg:grid-cols-3">
          {changes.map((change) => (
            <SectionCard key={change.title} title={change.title}>
              <div className="text-sm text-stitch-on-surface-variant">{change.location}</div>
              <p className="mt-3 text-sm text-stitch-on-surface">{change.impact}</p>
            </SectionCard>
          ))}
        </section>
      </PageContent>
    </PageLayout>
  );
}
