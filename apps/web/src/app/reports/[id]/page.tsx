import { Badge, Button, EmptyState, ErrorState, LoadingState, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

const findings = [
  { color: 'border-danger-500', detail: '付款节点与验收口径不一致，建议在签署前补充触发条件。', level: '高风险', title: '回款条款存在争议空间' },
  { color: 'border-warning-500', detail: '工期顺延证明链条不足，需补齐监理签证与会议纪要。', level: '中风险', title: '履约证据需要加固' },
  { color: 'border-success-500', detail: '主体资质、项目范围和报价口径匹配，可进入下一轮复核。', level: '低风险', title: '核心资格条件匹配' },
] as const;

export default function ReportDetailPage(): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent className="space-y-6">
        <PageHeader
          actions={<Badge className="border-primary-200 bg-primary-50 text-primary-700">Tier 3 · 建议咨询</Badge>}
          breadcrumbs="报告中心 / AI 合同审查"
          description="面向老板的 H5 报告：先给结论，再给风险证据和下一步动作。"
          title="AI 合同审查报告"
        />

        <section className="grid gap-4 lg:grid-cols-[420px_1fr]">
          <SectionCard className="relative overflow-hidden border-danger-200 bg-danger-50 text-danger-700" title="总体风险">
            <div className="flex min-h-20 items-center justify-between gap-4">
              <div>
                <p className="text-3xl font-semibold">偏高</p>
                <p className="mt-2 text-sm leading-6">建议先补齐付款、验收、顺延三类关键条款，再进入盖章流程。</p>
              </div>
              <Badge className="absolute right-4 top-4 border-danger-200 bg-white text-danger-700">红灯</Badge>
            </div>
          </SectionCard>

          <SectionCard title="关键发现">
            <div className="grid gap-4">
              {findings.map((finding) => (
                <article className={`rounded-lg border border-stitch-outline-variant border-l-4 bg-white p-4 ${finding.color}`} key={finding.title}>
                  <div className="text-xs font-semibold uppercase text-stitch-on-surface-variant">{finding.level}</div>
                  <h2 className="mt-1 font-semibold text-stitch-on-surface">{finding.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-stitch-on-surface-variant">{finding.detail}</p>
                </article>
              ))}
            </div>
          </SectionCard>
        </section>

        <SectionCard title="AI 信心度">
          <div className="flex items-center gap-4">
            <span className="text-sm text-stitch-on-surface-variant">中高</span>
            <span className="flex gap-2" aria-label="AI 信心度 3/4">
              <span className="h-3 w-3 rounded-full bg-primary-500" />
              <span className="h-3 w-3 rounded-full bg-primary-500" />
              <span className="h-3 w-3 rounded-full bg-primary-500" />
              <span className="h-3 w-3 rounded-full bg-neutral-200" />
            </span>
          </div>
        </SectionCard>

        <section className="grid gap-4 lg:grid-cols-3">
          <Button>修改合同</Button>
          <Button variant="outline">下载 PDF</Button>
          <Button variant="secondary">申请人工复核</Button>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <LoadingState label="正在生成报告" rows={2} />
          <EmptyState title="暂无报告" description="提交合同后，AI 会在此生成审查结果。" />
          <ErrorState title="报告生成失败" description="AI 服务暂时不可用，请稍后重试或申请人工复核。" />
        </section>

        <p className="sticky bottom-0 rounded-md bg-stitch-surface/90 py-3 text-xs leading-5 text-neutral-400 backdrop-blur">
          免责声明：本报告由同乾方略 AI 根据您提供的材料生成，仅作经营决策参考，不替代律师、造价师或注册执业人员的正式意见。
        </p>
      </PageContent>
    </PageLayout>
  );
}
