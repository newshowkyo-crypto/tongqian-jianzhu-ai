import { AiDisclaimer, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

const docs = ['证书库', '业绩材料', '个人简历', '投标格式简历'];

export default function PersonalDocPage(): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader breadcrumbs="个人办公 / 个人文档" description="证书、业绩、简历资料库，支持按招标格式生成简历。" title="个人文档库" />
        <section className="grid gap-4 md:grid-cols-2">
          {docs.map((doc) => <SectionCard key={doc} title={doc}><p className="text-sm text-stitch-on-surface-variant">上传 OCR 后可生成结构化材料草稿。</p></SectionCard>)}
        </section>
        <AiDisclaimer variant="footer" />
      </PageContent>
    </PageLayout>
  );
}
