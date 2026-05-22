import { AiReportFooter, Badge, BrandHeader, ConfidenceDots, SectionCard, Shield, TierBadge } from '@tongqian/ui';
import { AlertTriangle, FileSearch } from '@tongqian/ui';

const findings = [
  { level: 'red', title: '付款节点缺少验收期限', type: '现金流风险', advice: '补充“提交资料后 7 日内确认，逾期视为认可”的节点约束。' },
  { level: 'yellow', title: '违约责任存在单方加重', type: '责任风险', advice: '将总违约金上限限定为合同价款的 10%，并区分一般违约和根本违约。' },
  { level: 'yellow', title: '签证变更流程证据链不足', type: '结算风险', advice: '增加现场签证、影像资料、监理确认和业主回复四类证据清单。' },
  { level: 'green', title: '工期顺延已有基础条款', type: '履约保护', advice: '保留现有不可抗力条款，并补充政府审批延迟场景。' },
  { level: 'red', title: '争议解决地点不利于施工方', type: '诉讼成本', advice: '优先改为项目所在地仲裁或施工方所在地法院管辖。' },
] as const;

const disclaimer = 'AI 生成内容仅供经营决策参考，不构成法律、财务、招投标或政策申报承诺；重大事项请结合原始材料和人工复核。';

export default function ContractReviewH5Page() {
  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-6">
      <article className="mx-auto max-w-[430px] space-y-4 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4 shadow-sm">
        <BrandHeader name="同乾方略 × 湖北某建设有限公司" />
        <header className="space-y-4 rounded-lg bg-[var(--surface-container-low)] p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-[var(--text-secondary)]">合同审查 H5 报告</p>
              <h1 className="mt-2 text-2xl font-semibold leading-8 text-[var(--text-primary)]">中度风险，可先改条款再签</h1>
            </div>
            <TierBadge tier={3} />
          </div>
          <div className="rounded-lg border border-warning-100 bg-warning-50 p-4">
            <div className="flex items-center gap-2 text-warning-700">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm font-semibold">总体风险：黄色偏红</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">建议先处理付款、违约和管辖三类条款，再进入盖章流程。</p>
          </div>
        </header>

        <SectionCard className="border-[var(--outline-variant)] bg-[var(--surface)]" title="关键发现">
          <div className="space-y-4">
            {findings.map((finding) => (
              <article
                key={finding.title}
                className={`rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4 ${finding.level === 'red' ? 'border-l-4 border-l-danger-500' : finding.level === 'yellow' ? 'border-l-4 border-l-warning-500' : 'border-l-4 border-l-success-500'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold leading-6 text-[var(--text-primary)]">{finding.title}</h2>
                    <p className="mt-2 text-xs text-[var(--text-secondary)]">{finding.type}</p>
                  </div>
                  <Badge tone={finding.level === 'red' ? 'danger' : finding.level === 'yellow' ? 'warning' : 'success'}>{finding.level === 'red' ? '高' : finding.level === 'yellow' ? '中' : '低'}</Badge>
                </div>
                <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">{finding.advice}</p>
              </article>
            ))}
          </div>
        </SectionCard>

        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]"><Shield className="h-4 w-4" />AI 信心度</span>
            <ConfidenceDots score={3} />
          </div>
        </section>

        <AiReportFooter audience="owner" confidence="medium" disclaimer={disclaimer} tier={3} />

        <footer className="flex items-center gap-2 rounded-lg bg-[var(--surface-container-low)] p-4 text-xs leading-5 text-[var(--text-secondary)]">
          <Shield className="h-4 w-4 shrink-0" />
          <span>{disclaimer}</span>
        </footer>
        <div className="hidden"><FileSearch /></div>
      </article>
    </main>
  );
}
