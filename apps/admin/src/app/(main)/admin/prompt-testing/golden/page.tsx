import { Badge, Button, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

const rows = [
  ['CONTRACT_REVIEW_PRO', '0.84', '8/10'],
  ['TENDER_SUMMARY', '0.79', '7/10'],
  ['QUALIFICATION_CHECKUP', '0.91', '9/10'],
  ['COST_ROUGH_ESTIMATE', '0.76', '7/10'],
  ['RED_FLAG_SCAN', '0.93', '9/10'],
  ['REPORT_QUALITY', '0.85', '8/10'],
  ['DUE_DILIGENCE', '0.81', '8/10'],
] as const;

export default function GoldenPromptTestingPage(): JSX.Element {
  return (
    <PageLayout>
      <PageContent>
        <PageHeader breadcrumbs="Admin / Prompt Testing" description="7 套黄金测试集，按 precision / recall / F1 评估 prompt 可上线性。" title="黄金测试评分" />
        <section className="grid gap-4 lg:grid-cols-3">
          {rows.map(([taskType, f1, pass]) => (
            <SectionCard actions={<Button size="sm">运行</Button>} key={taskType} title={taskType}>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">F1 Score</p>
                  <p className="mt-2 text-3xl font-semibold tabular-nums">{f1}</p>
                </div>
                <Badge tone={Number(f1) >= 0.8 ? 'success' : 'warning'}>{pass}</Badge>
              </div>
              <div className="mt-4 h-2 rounded-full bg-neutral-100">
                <div className="h-2 rounded-full bg-primary-500" style={{ width: `${Number(f1) * 100}%` }} />
              </div>
            </SectionCard>
          ))}
        </section>
      </PageContent>
    </PageLayout>
  );
}
