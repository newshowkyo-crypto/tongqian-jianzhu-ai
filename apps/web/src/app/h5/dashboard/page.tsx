'use client';

import { Button, RiskBadge } from '@tongqian/ui';

export default function H5DashboardPage() {
  return (
    <main className="tq-h5-shell mx-auto max-w-[430px]">
      <header className="fixed inset-x-0 top-0 z-20 mx-auto flex h-[calc(62px+env(safe-area-inset-top))] max-w-[430px] items-end bg-[#0a1d3d] px-4 pb-3 text-white"><h1 className="text-base font-semibold">老板移动首页</h1></header>
      <section className="space-y-4 px-4 py-5">
        <div className="rounded-3xl bg-[linear-gradient(135deg,#0a1d3d,#1e3a6f)] p-5 text-white"><p className="text-sm text-[#d8dde5]">今日经营简报</p><h2 className="mt-2 text-3xl font-semibold">18 个机会 · 4 个红灯</h2></div>
        <div className="grid grid-cols-2 gap-3">{[['机会', 18], ['审批', 6], ['点数', 8420], ['报告', 3]].map(([label, value]) => <div key={label} className="rounded-2xl bg-white p-4 shadow-sm"><p className="text-sm text-neutral-500">{label}</p><p className="mt-1 text-2xl font-semibold text-[#0a1d3d]">{value}</p></div>)}</div>
        <article className="rounded-2xl border-l-4 border-l-danger-500 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><h3 className="font-semibold text-[#0a1d3d]">付款节点风险</h3><RiskBadge level="red" /></div><p className="mt-2 text-sm text-neutral-600">建议今日先处理付款和验收证据链。</p></article>
      </section>
      <footer className="fixed inset-x-0 bottom-0 z-20 mx-auto flex h-[calc(72px+env(safe-area-inset-bottom))] max-w-[430px] items-start bg-white/90 px-4 pt-3 shadow-2xl backdrop-blur"><Button className="min-h-11 w-full">立即试用 · www.tongqian.xin</Button></footer>
    </main>
  );
}
