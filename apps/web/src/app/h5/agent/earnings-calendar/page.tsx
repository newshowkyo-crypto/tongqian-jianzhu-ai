'use client';

import { Button, SuccessConfetti } from '@tongqian/ui';

export default function Page() {
  return (
    <main className="tq-h5-shell mx-auto max-w-[430px]">
      <header className="fixed inset-x-0 top-0 z-20 mx-auto flex h-[calc(62px+env(safe-area-inset-top))] max-w-[430px] items-end bg-[#0a1d3d] px-4 pb-3 text-white">
        <h1 className="text-base font-semibold">智能管家收益日历</h1>
      </header>
      <section className="space-y-4 px-4 py-5">
        <div className="rounded-3xl bg-white p-5 shadow-xl">
          <p className="text-xs font-medium text-[#d99880]">同乾方略 · 智能管家收益日历</p>
          <h2 className="mt-3 text-2xl font-semibold text-[#0a1d3d]">本月已入账 ¥18,420</h2>
          <div className="mt-5 grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, index) => (
              <span key={index} className={`grid h-9 place-items-center rounded text-xs ${index % 5 === 0 ? 'bg-[#d99880]/10 text-[#8f4f3f]' : 'bg-neutral-50 text-neutral-500'}`}>
                {index + 1}
              </span>
            ))}
          </div>
          <div className="mt-5 space-y-3">
            <div className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#d99880]/40 bg-[#d99880]/10 px-3 py-2 text-sm font-semibold text-[#8f4f3f]">
              <span aria-hidden="true" className="h-3 w-3 rounded-full bg-[#d99880] shadow-card [animation:tq-coin-drop_600ms_cubic-bezier(0.2,0.8,0.2,1)_both]" />
              <span>昨日入账 +420 credits</span>
            </div>
            <SuccessConfetti label="LV4 权益保持中" />
            <Button className="min-h-11 w-full">生成朋友圈卡片</Button>
          </div>
        </div>
      </section>
      <footer className="fixed inset-x-0 bottom-0 z-20 mx-auto flex h-[calc(72px+env(safe-area-inset-bottom))] max-w-[430px] items-start bg-white/90 px-4 pt-3 shadow-2xl backdrop-blur">
        <Button className="min-h-11 w-full">立即试用 · www.tongqian.xin</Button>
      </footer>
    </main>
  );
}
