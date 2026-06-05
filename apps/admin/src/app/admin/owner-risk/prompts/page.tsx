'use client';

import { Badge, Button, PageContent, PageLayout } from '@tongqian/ui';

const mockPrompts = [
  { id: '1', name: 'owner_risk_summary', version: 'v2', description: '生成企业主综合风险摘要', taskType: 'OWNER_RISK_SUMMARY', isActive: true },
  { id: '2', name: 'owner_guarantee_risk', version: 'v1', description: '分析担保风险', taskType: 'OWNER_GUARANTEE_RISK_ANALYSIS', isActive: true },
  { id: '3', name: 'owner_mixing_risk', version: 'v1', description: '分析混同风险', taskType: 'OWNER_COMPANY_MIXING_RISK_ANALYSIS', isActive: true },
  { id: '4', name: 'counterparty_risk', version: 'v1', description: '分析交易对手风险', taskType: 'COUNTERPARTY_RISK_ANALYSIS', isActive: true },
  { id: '5', name: 'receivable_risk', version: 'v1', description: '分析应收账款风险', taskType: 'RECEIVABLE_RISK_ANALYSIS', isActive: true },
  { id: '6', name: 'owner_risk_report', version: 'v1', description: '生成完整风险报告', taskType: 'OWNER_RISK_REPORT_GENERATION', isActive: true },
];

export default function AdminOwnerRiskPromptsPage() {
  return (
    <PageLayout className="bg-[var(--bg)]">
      <PageContent className="space-y-6">
        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Prompt 管理</h1>
              <p className="text-sm text-[var(--text-secondary)]">管理企业主风险雷达的 AI Prompt 模板</p>
            </div>
            <Button size="sm">添加 Prompt</Button>
          </div>
        </section>

        <section className="space-y-4">
          {mockPrompts.map(prompt => (
            <div key={prompt.id} className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-[var(--text-primary)]">{prompt.name}</h3>
                    <Badge className="bg-[var(--surface-container-low)] text-[var(--text-secondary)]">{prompt.version}</Badge>
                    <Badge className={prompt.isActive ? 'bg-success-50 text-success-700' : 'bg-gray-50 text-gray-700'}>
                      {prompt.isActive ? '已启用' : '已禁用'}
                    </Badge>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">{prompt.description}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">Task Type: {prompt.taskType}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">编辑</Button>
                  <Button size="sm" variant="outline">测试</Button>
                  <Button size="sm" variant="outline">{prompt.isActive ? '禁用' : '启用'}</Button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </PageContent>
    </PageLayout>
  );
}
