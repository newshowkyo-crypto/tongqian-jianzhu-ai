import { PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

const hits = ['GB50500-2024 清单计价', 'GB50300-2013 质量验收', 'GB50720-2011 施工消防'];

export default function RegulationsPage(): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader breadcrumbs="首页 / 法规快查" description="从本地法规种子库快速定位 GB、合同范本和司法解释。" title="法规 RAG 快查" />
        <SectionCard title="查询结果">
          <div className="grid gap-4 lg:grid-cols-3">
            {hits.map((hit) => <div className="rounded-lg border border-stitch-outline-variant p-4 text-sm" key={hit}>{hit}</div>)}
          </div>
        </SectionCard>
      </PageContent>
    </PageLayout>
  );
}
