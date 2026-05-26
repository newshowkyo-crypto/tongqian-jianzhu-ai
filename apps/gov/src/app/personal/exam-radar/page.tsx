import { AiDisclaimer, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

const exams = ['一建报名', '二建报名', '监理考试', '造价工程师', '安全工程师'];

export default function ExamRadarPage(): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader breadcrumbs="个人办公 / 考试雷达" description="注册类考试报名截止和政策变化提醒。" title="考试雷达" />
        <section className="grid gap-4 md:grid-cols-2">
          {exams.map((exam) => <SectionCard key={exam} title={exam}><p className="text-sm text-stitch-on-surface-variant">报名窗口、材料清单和复习节点提醒。</p></SectionCard>)}
        </section>
        <AiDisclaimer variant="footer" />
      </PageContent>
    </PageLayout>
  );
}
