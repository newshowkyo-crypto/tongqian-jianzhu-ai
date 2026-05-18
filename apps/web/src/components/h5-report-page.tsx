import { Button, ConfidenceDots, TierBadge } from '@tongqian/ui';

import type { H5ReportCopy } from '../h5-pages';

export function H5ReportPage({ copy }: { copy: H5ReportCopy }) {
  const confidenceScore = copy.confidence === 'high' ? 4 : copy.confidence === 'medium' ? 3 : 2;

  return (
    <main className="min-h-screen bg-neutral-100 px-3 py-4">
      <article className="mx-auto min-h-[calc(100vh-32px)] max-w-[375px] overflow-hidden rounded-lg bg-white shadow-card">
        <header className="bg-primary-900 px-5 py-6 text-white">
          <p className="text-xs font-medium text-accent-200">同乾方略 · 建筑 AI 经营管家</p>
          <h1 className="mt-3 text-2xl font-semibold">{copy.title}</h1>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-primary-100">{copy.type}</span>
            <TierBadge tier={copy.tier} />
          </div>
        </header>

        <section className="h-20 bg-warning-50 px-5 py-4">
          <p className="text-sm font-medium text-warning-700">总体风险</p>
          <p className="mt-1 text-xl font-semibold text-neutral-950">需要关注，但可执行</p>
        </section>

        <section className="space-y-4 px-5 py-5">
          <div className="flex items-center justify-between rounded-md border border-neutral-200 p-3">
            <span className="text-sm font-medium text-neutral-700">AI 信心度</span>
            <ConfidenceDots score={confidenceScore} />
          </div>

          <div className="space-y-3">
            {copy.findings.map((finding) => (
              <p key={finding} className="border-l-4 border-l-warning-500 bg-neutral-50 px-3 py-2 text-sm leading-6 text-neutral-700">
                {finding}
              </p>
            ))}
          </div>

          <div className="grid gap-2">
            {['自己执行', '申请智能管家', '申请同乾方略', '人工复核', '专家咨询'].map((action, index) => (
              <Button key={action} className="min-h-11 w-full" variant={index === 0 ? 'primary' : 'outline'}>
                {action}
              </Button>
            ))}
          </div>

          <p className="text-xs leading-5 text-neutral-400">
            AI 生成内容仅供经营决策参考，不构成法律、财务、招投标或政策申报承诺；重大事项请结合原始材料和人工复核。
          </p>
        </section>
      </article>
    </main>
  );
}
