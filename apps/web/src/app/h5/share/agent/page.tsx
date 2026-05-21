'use client';

import { Button } from '@tongqian/ui';

export default function AgentShareH5Page() {
  return (
    <main className="tq-h5-shell mx-auto max-w-[430px]">
      <header className="fixed inset-x-0 top-0 z-20 mx-auto flex h-[calc(62px+env(safe-area-inset-top))] max-w-[430px] items-end bg-[#0a1d3d] px-4 pb-3 text-white"><h1 className="text-base font-semibold">智能管家招募</h1></header>
      <section className="space-y-4 px-4 py-5">
        <div className="rounded-3xl bg-[linear-gradient(135deg,#0a1d3d,#142a52)] p-6 text-white shadow-xl">
          <p className="text-sm text-[#d8dde5]">同乾方略合伙生态</p>
          <h2 className="mt-3 text-3xl font-semibold">把建筑经验变成可复利的接单能力</h2>
          <p className="mt-4 text-sm leading-6 text-[#d8dde5]">平台派单、信誉分、培训体系、分润规则和客户保护期一站式闭环。</p>
        </div>
        {['完成 6 节培训', '接入派单大厅', '按平台规则结算分润'].map((item, index) => <article key={item} className="rounded-2xl bg-white p-4 shadow-sm"><span className="text-xs text-[#d99880]">STEP {index + 1}</span><h3 className="mt-1 font-semibold text-[#0a1d3d]">{item}</h3></article>)}
        <div className="grid h-32 place-items-center rounded-2xl border border-dashed border-[#b5bcc8] bg-white text-sm text-neutral-500">二维码占位</div>
      </section>
      <footer className="fixed inset-x-0 bottom-0 z-20 mx-auto flex h-[calc(72px+env(safe-area-inset-bottom))] max-w-[430px] items-start bg-white/90 px-4 pt-3 shadow-2xl backdrop-blur"><Button className="min-h-11 w-full">立即试用 · www.tongqian.xin</Button></footer>
    </main>
  );
}
