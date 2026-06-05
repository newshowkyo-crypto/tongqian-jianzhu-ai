'use client';

import { Badge, Button, PageContent, PageLayout } from '@tongqian/ui';

const mockPoints = [
  { id: '1', action: '解锁担保总览卡片', credits: 50, description: '查看担保总览分析结果', isActive: true },
  { id: '2', action: '解锁担保详情卡片', credits: 80, description: '查看每笔担保的详细信息', isActive: true },
  { id: '3', action: '解锁混同风险卡片', credits: 80, description: '查看混同风险详细分析', isActive: true },
  { id: '4', action: '解锁交易对手卡片', credits: 50, description: '查看交易对手风险分析', isActive: true },
  { id: '5', action: '解锁应收账款卡片', credits: 50, description: '查看应收账款账龄分析', isActive: true },
  { id: '6', action: '生成综合风险报告', credits: 100, description: 'AI 生成完整的综合风险报告', isActive: true },
  { id: '7', action: '提交顾问复核', credits: 200, description: '提交高风险事项到顾问复核工作台', isActive: true },
  { id: '8', action: '导出 PDF 报告', credits: 20, description: '导出风险报告为 PDF 格式', isActive: false },
];

export default function AdminOwnerRiskPointsPage() {
  return (
    <PageLayout className="bg-[var(--bg)]">
      <PageContent className="space-y-6">
        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">点数配置</h1>
            <p className="text-sm text-[var(--text-secondary)]">管理企业主风险雷达各操作的点数消耗</p>
          </div>
        </section>

        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)]">
          <div className="divide-y divide-[var(--outline-variant)]">
            {mockPoints.map(point => (
              <div key={point.id} className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[var(--text-primary)]">{point.action}</span>
                    <Badge className={point.isActive ? 'bg-success-50 text-success-700' : 'bg-gray-50 text-gray-700'}>
                      {point.isActive ? '已启用' : '已禁用'}
                    </Badge>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">{point.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-[var(--primary)]">{point.credits} 点</span>
                  <Button size="sm" variant="outline">调整</Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </PageContent>
    </PageLayout>
  );
}
