'use client';

import { Button, SuccessConfetti } from '@tongqian/ui';

export default function Page() {
  return (
    <main className="min-h-screen bg-neutral-100 px-3 py-4">
      <section className="mx-auto max-w-[375px] rounded-lg bg-white p-5 shadow-card">
        <p className="text-xs font-medium text-accent-700">同乾方略 · 智能管家收益日历</p>
        <h1 className="mt-3 text-2xl font-semibold text-neutral-950">本月已入账 ¥18,420</h1>
        <div className="mt-5 grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, index) => (
            <span key={index} className={`grid h-9 place-items-center rounded text-xs ${index % 5 === 0 ? 'bg-accent-50 text-accent-700' : 'bg-neutral-50 text-neutral-500'}`}>
              {index + 1}
            </span>
          ))}
        </div>
        <div className="mt-5 space-y-3">
          <div className="inline-flex min-h-10 items-center gap-2 rounded-md border border-warning-300 bg-warning-50 px-3 py-2 text-sm font-semibold text-warning-800">
            <span aria-hidden="true" className="h-3 w-3 rounded-full bg-warning-500 shadow-card [animation:tq-coin-drop_600ms_cubic-bezier(0.2,0.8,0.2,1)_both]" />
            <span>昨日入账 +420 credits</span>
          </div>
          <SuccessConfetti label="LV4 权益保持中" />
          <Button className="min-h-11 w-full">生成朋友圈卡片</Button>
        </div>
      </section>
    </main>
  );
}
