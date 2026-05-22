'use client';

import { Button, Progress } from '@tongqian/ui';

const demoMap: Record<string, { title: string; subtitle: string; steps: string[] }> = {
  'contract-review': {
    title: '合同审查演示流',
    subtitle: '3 份脱敏合同：高风险付款、中风险质保、低风险模板复核。',
    steps: ['载入脱敏合同', 'AI 扫描条款', '识别付款与质保风险', '生成证据缺口', '进入试用 CTA'],
  },
  'tender-framework': {
    title: '标书框架演示',
    subtitle: '从招标文件速读到商务、技术、资信三段框架。',
    steps: ['载入招标文件', '抽取评分点', '生成目录', '补齐响应矩阵', '进入试用 CTA'],
  },
  'qualification-upgrade': {
    title: '资质升级演示',
    subtitle: '人员、业绩、社保、设备和时间窗口一屏判断。',
    steps: ['读取企业画像', '匹配资质标准', '定位短板', '生成 90 天路径', '进入试用 CTA'],
  },
  'policy-fund-match': {
    title: '政策资金匹配演示',
    subtitle: '中央、省、市、园区四层政策窗口综合排序。',
    steps: ['载入项目画像', '召回政策库', '评分匹配', '生成申报清单', '进入试用 CTA'],
  },
  'morning-briefing': {
    title: '早安简报演示',
    subtitle: '老板每天 7:30 看到机会、风险、审批和点数余额。',
    steps: ['汇总昨日数据', '生成机会雷达', '压缩风险红灯', '推送行动清单', '进入试用 CTA'],
  },
};
const fallbackDemo = demoMap['contract-review'] as { title: string; subtitle: string; steps: string[] };

export default function DemoPage({ params }: { params: { slug: string } }) {
  const demo = demoMap[params.slug] ?? fallbackDemo;

  return (
    <main className="tq-product-surface min-h-screen px-6 py-8">
      <section className="relative z-[1] mx-auto max-w-6xl space-y-6">
        <div className="tq-particles rounded-xl bg-[var(--gradient-navy-hero)] p-8 text-white shadow-md">
          <p className="text-sm text-silver-main">同乾方略 · 内测客户演示</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">{demo.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-silver-light">{demo.subtitle}</p>
          <Button className="mt-8 min-h-12 bg-rose-main text-navy-deepest hover:bg-rose-main" size="lg">进入演示</Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          {demo.steps.map((step, index) => <article key={step} className="tq-glass-card rounded-xl p-6"><span className="text-xs font-semibold text-rose-main">STEP {index + 1}</span><h2 className="mt-2 font-semibold text-navy-deepest">{step}</h2><Progress className="mt-5" value={(index + 1) * 20} /></article>)}
        </div>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
          <div className="tq-glass-card rounded-xl p-6"><p className="text-sm text-neutral-500">AI 审查动画</p><div className="mt-5 h-56 rounded-xl bg-[linear-gradient(90deg,rgba(10,29,61,.08),rgba(74,142,255,.18),rgba(217,152,128,.22))] tq-shimmer" /></div>
          <div className="tq-glass-card rounded-xl p-6"><p className="text-sm text-neutral-500">演示结果</p><h3 className="mt-3 text-2xl font-semibold text-navy-deepest">已生成风险报告、行动清单和 CTA</h3><Button className="mt-6 w-full">立即试用</Button></div>
        </section>
      </section>
    </main>
  );
}
