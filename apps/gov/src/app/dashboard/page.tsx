import { Badge, PageContent, PageLayout, Progress, SectionCard } from '@tongqian/ui';

const subscriptions = [
  { level: '国家级', title: '绿色建造示范政策' },
  { level: '省级', title: '建筑业数字化转型资金' },
  { level: '市级', title: '政企协同项目申报窗口' },
];

const funds = [
  { amount: '最高 300 万元', score: 86, title: '绿色建造专项资金' },
  { amount: '最高 120 万元', score: 74, title: '智能工地试点补助' },
  { amount: '最高 80 万元', score: 68, title: '中小企业技改资金' },
];

const documents = [
  { due: '今日 18:00 前', title: '项目申报说明' },
  { due: '明日 12:00 前', title: '专家评审纪要' },
  { due: '本周五前', title: '资金拨付请示' },
];

export default function GovDashboardPage() {
  return (
    <PageLayout className="bg-[linear-gradient(180deg,#f8fafc,#eef3f9)]">
      <PageContent className="space-y-6 text-lg">
        <section className="rounded-xl border-l-4 border-l-danger-700 bg-[var(--gradient-navy-hero)] p-8 text-white shadow-md">
          <p className="text-base text-silver-light">政企工作台 / 国产模型专线</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">政策订阅、资金匹配、公文待写</h1>
          <p className="mt-3 max-w-3xl text-lg leading-8 text-silver-light">政企版统一使用国产模型链路，材料不出境，输出报告自动保留水印和审计链路。</p>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <SectionCard className="tq-glass-card border-t-4 border-t-danger-700" title="政策时间线">
            <div className="space-y-4">
              {subscriptions.map((item, index) => (
                <div className="relative pl-6" key={item.title}>
                  <span className="absolute left-0 top-2 h-3 w-3 rounded-full bg-danger-700" />
                  <span className="absolute bottom-[-22px] left-[5px] top-5 w-px bg-silver-light" />
                  <Badge tone="info">{item.level}</Badge>
                  <p className="mt-2 text-lg font-semibold text-navy-deepest">{item.title}</p>
                  <p className="text-sm text-neutral-500">节点 0{index + 1} / 已纳入政策跟踪</p>
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard className="tq-glass-card" title="资金匹配推送">
            {funds.map((item) => (
              <div className="mb-4 rounded-xl border border-silver-light bg-white/80 p-4" key={item.title}>
                <p className="font-semibold text-navy-deepest">{item.title}</p>
                <p className="text-base text-neutral-500">{item.amount}</p>
                <Progress className="mt-3" value={item.score} />
              </div>
            ))}
          </SectionCard>
          <SectionCard className="tq-glass-card bg-[linear-gradient(135deg,rgba(255,255,255,.9),rgba(216,221,229,.35))]" title="公文待写">
            {documents.map((item) => (
              <div className="mb-4 rounded-xl border border-silver-light bg-[repeating-linear-gradient(0deg,rgba(10,29,61,.04)_0_1px,transparent_1px_28px)] p-4" key={item.title}>
                <p className="text-lg font-semibold text-navy-deepest">{item.title}</p>
                <p className="mt-2 text-base text-danger-700">{item.due}</p>
              </div>
            ))}
          </SectionCard>
        </section>
      </PageContent>
    </PageLayout>
  );
}
