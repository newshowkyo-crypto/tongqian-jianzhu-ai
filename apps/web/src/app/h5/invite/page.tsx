import { Button } from '@tongqian/ui';

export default function Page() {
  return (
    <main className="tq-h5-shell mx-auto max-w-[430px]">
      <header className="fixed inset-x-0 top-0 z-20 mx-auto flex h-[calc(62px+env(safe-area-inset-top))] max-w-[430px] items-end bg-[#0a1d3d] px-4 pb-3 text-white">
        <h1 className="text-base font-semibold">同乾方略邀请</h1>
      </header>
      <section className="space-y-4 px-4 py-5">
        <div className="rounded-3xl bg-white p-5 shadow-xl">
          <p className="text-xs font-medium text-[#d99880]">同乾方略邀请</p>
          <h2 className="mt-3 text-2xl font-semibold text-[#0a1d3d]">把建筑经营风险先看清楚</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">扫码进入建筑 AI 经营管家，领取试用点数并生成第一份经营诊断。</p>
          <div className="mt-6 grid aspect-square place-items-center rounded-2xl border border-dashed border-[#b5bcc8] bg-slate-50 text-sm text-neutral-500">[PLACEHOLDER_QR_CODE]</div>
          <Button className="mt-5 min-h-11 w-full">保存分享卡片</Button>
        </div>
      </section>
      <footer className="fixed inset-x-0 bottom-0 z-20 mx-auto flex h-[calc(72px+env(safe-area-inset-bottom))] max-w-[430px] items-start bg-white/90 px-4 pt-3 shadow-2xl backdrop-blur">
        <Button className="min-h-11 w-full">立即试用 · www.tongqian.xin</Button>
      </footer>
    </main>
  );
}
