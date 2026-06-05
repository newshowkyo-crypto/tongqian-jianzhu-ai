'use client';

import { Badge, Button, PageContent, PageLayout } from '@tongqian/ui';

const mockRules = [
  { id: '1', name: '担保风险阈值', description: '单笔担保超过设定金额触发高风险预警', threshold: '500万', riskLevel: 'high', isActive: true },
  { id: '2', name: '混同风险识别', description: '企业与个人账户资金往来超过阈值', threshold: '100万/月', riskLevel: 'high', isActive: true },
  { id: '3', name: '交易对手黑名单', description: '与黑名单企业交易触发风险预警', threshold: 'N/A', riskLevel: 'critical', isActive: true },
  { id: '4', name: '应收账款账龄', description: '应收账款账龄超过设定天数触发风险', threshold: '180天', riskLevel: 'medium', isActive: true },
];

export default function AdminOwnerRiskRulesPage() {
  return (
    <PageLayout className="bg-[var(--bg)]">
      <PageContent className="space-y-6">
        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-[var(--text-primary)]">规则配置</h1>
              <p className="text-sm text-[var(--text-secondary)]">管理企业主风险分析的规则</p>
            </div>
            <Button size="sm">添加规则</Button>
          </div>
        </section>

        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
          <div className="space-y-4">
            {mockRules.map(rule => (
              <div key={rule.id} className="rounded-lg border border-[var(--outline-variant)] p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-[var(--text-primary)]">{rule.name}</h3>
                      <Badge className={rule.riskLevel === 'critical' ? 'bg-red-50 text-red-700' : rule.riskLevel === 'high' ? 'bg-orange-50 text-orange-700' : 'bg-yellow-50 text-yellow-700'}>
                        {rule.riskLevel === 'critical' ? '极高' : rule.riskLevel === 'high' ? '高' : '中'}
                      </Badge>
                      <Badge className={rule.isActive ? 'bg-success-50 text-success-700' : 'bg-gray-50 text-gray-700'}>
                        {rule.isActive ? '已启用' : '已禁用'}
                      </Badge>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">{rule.description}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">阈值: {rule.threshold}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">编辑</Button>
                    <Button size="sm" variant="outline">{rule.isActive ? '禁用' : '启用'}</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </PageContent>
    </PageLayout>
  );
}
