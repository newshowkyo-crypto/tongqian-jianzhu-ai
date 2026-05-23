'use client';

import { apiClient, type ReportType } from '@tongqian/api-client';
import { Badge, Button, Checkbox, Input, PageContent, PageLayout, SectionCard, Spinner } from '@tongqian/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const reportTypes: Array<{ description: string; label: string; taskType: string; value: ReportType }> = [
  { description: '合同风险、付款节点、争议条款和复核建议。', label: '合同审查月报', taskType: 'report.contract-monthly', value: 'contract-monthly' },
  { description: '投标参与、废标风险、报价与资格证据链。', label: '招标参与周报', taskType: 'report.tender-weekly', value: 'tender-weekly' },
  { description: '证书到期、升级缺口、人员社保和动态核查。', label: '资质合规月报', taskType: 'report.qualification-monthly', value: 'qualification-monthly' },
  { description: '经营线索、回款、风险和团队执行 KPI。', label: '经营 KPI 周报', taskType: 'report.kpi-weekly', value: 'kpi-weekly' },
  { description: '模型路由、成本率、缓存命中和异常调用。', label: 'AI 调用周报', taskType: 'report.ai-cost-weekly', value: 'ai-cost-weekly' },
];
const sourceOptions = ['client', 'project', 'contract', 'tender'];

export default function NewReportPage() {
  const router = useRouter();
  const [type, setType] = useState<ReportType>('contract-monthly');
  const [from, setFrom] = useState('2026-05-01');
  const [to, setTo] = useState('2026-05-22');
  const [dataSources, setDataSources] = useState(['client', 'contract']);
  const [coBrand, setCoBrand] = useState(true);
  const [running, setRunning] = useState(false);

  function toggleSource(value: string): void {
    setDataSources((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
  }

  async function createReport(): Promise<void> {
    if (running) return;
    setRunning(true);
    const selected = reportTypes.find((item) => item.value === type) ?? reportTypes[0]!;
    const context = { coBrand, dataSources, dateRange: { from, to }, type };
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const reply = await apiClient.aiGateway.invoke({
      context,
      taskType: selected.taskType,
      userInput: `请生成${selected.label}，包含 5 个关键发现、H5/PDF 双形态、traceId 和免责声明。`,
    });
    const created = await apiClient.report.create({
      aiTaskType: selected.taskType,
      dataSnapshot: { confidence: 'medium', disclaimer: 'AI 报告仅供经营决策参考。', nextStepHint: 'use-directly', tier: 2, traceId: reply.traceId ?? `m18-${Date.now()}` },
      sourceModule: '10-report-center',
      sourceTaskId: reply.traceId ?? 'mock-ai-task',
      type,
    });
    router.push(`/reports/${created.reportId ?? 'rep-contract-monthly'}`);
  }

  return (
    <PageLayout className="bg-[var(--bg)]">
      <PageContent className="space-y-6">
        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-6 shadow-sm">
          <Badge className="bg-[var(--surface-container-low)] text-[var(--primary)]">3 Step Wizard</Badge>
          <h1 className="mt-4 text-3xl font-semibold text-[var(--text-primary)]">新建报告</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">选择报告类型、时间范围与数据源，预览扣点后生成 H5 和 PDF。</p>
        </section>

        <SectionCard title="Step 1 选择报告类型">
          <div className="grid gap-4 md:grid-cols-5">
            {reportTypes.map((item) => (
              <button
                key={item.value}
                className={`min-h-32 rounded-lg border p-4 text-left transition-colors ${type === item.value ? 'border-[var(--accent-rose)] bg-[var(--surface-container-low)]' : 'border-[var(--outline-variant)] bg-[var(--surface)]'}`}
                onClick={() => setType(item.value)}
                type="button"
              >
                <p className="text-sm font-semibold text-[var(--text-primary)]">{item.label}</p>
                <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">{item.description}</p>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Step 2 时间范围与数据源">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2 text-sm text-[var(--text-secondary)]">
              <span>开始日期</span>
              <Input onChange={(event) => setFrom(event.target.value)} type="date" value={from} />
            </label>
            <label className="space-y-2 text-sm text-[var(--text-secondary)]">
              <span>结束日期</span>
              <Input onChange={(event) => setTo(event.target.value)} type="date" value={to} />
            </label>
            <label className="flex min-h-11 items-center gap-4 rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 text-sm">
              <Checkbox checked={coBrand} onChange={() => setCoBrand((current) => !current)} />
              联合品牌：同乾方略 + 客户公司
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {sourceOptions.map((item) => (
              <label key={item} className="flex min-h-10 items-center gap-4 rounded-md border border-[var(--outline-variant)] px-4 text-sm">
                <Checkbox checked={dataSources.includes(item)} onChange={() => toggleSource(item)} />
                {item}
              </label>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Step 3 扣点预览">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">预计扣点</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-[var(--accent-rose)]">300 点</p>
            </div>
            <Button disabled={running} onClick={createReport} variant="primary">
              {running ? <><Spinner className="mr-2" />AI 生成中</> : '立即生成'}
            </Button>
          </div>
        </SectionCard>
      </PageContent>
    </PageLayout>
  );
}
