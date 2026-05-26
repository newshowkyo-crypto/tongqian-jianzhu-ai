import { PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

const shortcuts = ['施工消防', '质量验收', '清单计价', '合同争议'];

export default function AgentRegulationsPage(): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader breadcrumbs="智能管家 / 法规快查" description="现场问题先查本地法规命中，再决定是否转人工复核。" title="智能管家法规快查" />
        <section className="grid gap-4 md:grid-cols-2">
          {shortcuts.map((item) => (
            <SectionCard key={item} title={item}>
              <p className="text-sm text-stitch-on-surface-variant">返回候选 GB 条文、适用场景和复核动作。</p>
            </SectionCard>
          ))}
        </section>
      </PageContent>
    </PageLayout>
  );
}
