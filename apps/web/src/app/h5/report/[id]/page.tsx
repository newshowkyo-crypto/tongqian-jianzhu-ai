'use client';

import { Button, ConfidenceDots, RiskBadge } from '@tongqian/ui';

export default function H5ReportPage() {
  return (
    <main className="tq-h5-shell mx-auto max-w-[430px] bg-slate-50">
      <header className="fixed inset-x-0 top-0 z-20 mx-auto flex h-[calc(62px+env(safe-area-inset-top))] max-w-[430px] items-end justify-between bg-navy-deepest px-4 pb-3 text-white">
        <div><p className="text-xs text-silver-main">同乾方略</p><h1 className="text-base font-semibold">AI 风险报告</h1></div><RiskBadge level="red" />
      </header>
      <section className="space-y-4 px-4 py-5">
        <div className="rounded-xl bg-[var(--gradient-navy-hero)] p-6 text-white shadow-md">
          <p className="text-xs text-silver-light">总体风险</p>
          <div className="mt-3 flex h-20 items-center justify-between rounded-xl bg-danger-500/20 px-4"><span className="text-3xl font-semibold">Tier 3</span><span className="text-sm">建议人工复核</span></div>
          <div className="mt-4 flex items-center justify-between text-sm"><span>AI 信心度</span><ConfidenceDots score={3} /></div>
        </div>
        {['付款周期过长，需锁定审计期限', '质保金返还条件缺少明确时间', '争议解决条款建议补充管辖地'].map((item) => <article key={item} className="rounded-xl border-l-4 border-l-rose-main bg-white p-4 shadow-sm"><h2 className="font-semibold text-navy-deepest">{item}</h2><p className="mt-2 text-sm leading-6 text-neutral-600">建议关注证据留存、责任人和下一步截止时间。</p></article>)}
        <p className="text-xs leading-5 text-neutral-400">AI 输出仅供经营决策参考，不替代律师、审计师或主管部门意见。</p>
      </section>
      <footer className="fixed inset-x-0 bottom-0 z-20 mx-auto flex h-[calc(72px+env(safe-area-inset-bottom))] max-w-[430px] items-start gap-4 bg-white/90 px-4 pt-3 shadow-md backdrop-blur">
        <Button className="min-h-11 flex-1">立即试用 · www.tongqian.xin</Button>
      </footer>
    </main>
  );
}
