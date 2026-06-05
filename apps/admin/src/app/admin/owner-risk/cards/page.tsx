'use client';

import { Badge, Button, PageContent, PageLayout } from '@tongqian/ui';

const defaultCards = [
  { id: '1', cardKey: 'guarantee_overview', title: '担保总览', description: '展示担保总额、涉及企业数、在保余额等', unlockCredits: 50, isActive: true },
  { id: '2', cardKey: 'guarantee_detail', title: '担保详情', description: '每笔担保的详细信息包括被担保方、金额、期限', unlockCredits: 80, isActive: true },
  { id: '3', cardKey: 'mixing_risk', title: '混同风险', description: '企业与个人之间的资金、资产、债务混同分析', unlockCredits: 80, isActive: true },
  { id: '4', cardKey: 'counterparty_risk', title: '交易对手风险', description: '交易对手的信用风险、诉讼风险分析', unlockCredits: 50, isActive: true },
  { id: '5', cardKey: 'receivable_aging', title: '应收账款账龄', description: '应收账款账龄分析和催收建议', unlockCredits: 50, isActive: true },
  { id: '6', cardKey: 'executive_summary', title: '执行摘要', description: '综合风险评估的简明摘要', unlockCredits: 30, isActive: true },
];

export default function AdminOwnerRiskCardsPage() {
  return (
    <PageLayout className="bg-[var(--bg)]">
      <PageContent className="space-y-6">
        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-[var(--text-primary)]">卡片管理</h1>
              <p className="text-sm text-[var(--text-secondary)]">管理企业主风险雷达的展示卡片</p>
            </div>
            <Button size="sm">添加卡片</Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {defaultCards.map(card => (
            <div key={card.id} className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-[var(--text-primary)]">{card.title}</h3>
                    <Badge className={card.isActive ? 'bg-success-50 text-success-700' : 'bg-gray-50 text-gray-700'}>
                      {card.isActive ? '已启用' : '已禁用'}
                    </Badge>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">{card.description}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">Key: {card.cardKey} • 解锁点数: {card.unlockCredits}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">编辑</Button>
                  <Button size="sm" variant="outline">{card.isActive ? '禁用' : '启用'}</Button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </PageContent>
    </PageLayout>
  );
}
