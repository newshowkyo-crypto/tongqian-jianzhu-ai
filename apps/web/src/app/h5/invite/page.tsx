import { Button } from '@tongqian/ui';

export default function Page() {
  return (
    <main className="min-h-screen bg-primary-900 px-3 py-4 text-white">
      <section className="mx-auto max-w-[375px] rounded-lg bg-white p-5 text-neutral-950 shadow-card">
        <p className="text-xs font-medium text-accent-700">同乾方略邀请</p>
        <h1 className="mt-3 text-2xl font-semibold">把建筑经营风险先看清楚</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-600">扫码进入建筑 AI 经营管家，领取试用点数并生成第一份经营诊断。</p>
        <div className="mt-6 grid aspect-square place-items-center rounded-md border border-dashed border-neutral-300 bg-neutral-50 text-sm text-neutral-500">
          [PLACEHOLDER_QR_CODE]
        </div>
        <Button className="mt-5 min-h-11 w-full">保存分享卡片</Button>
      </section>
    </main>
  );
}
