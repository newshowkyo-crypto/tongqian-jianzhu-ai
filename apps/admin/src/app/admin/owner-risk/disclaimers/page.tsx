'use client';

import { Badge, Button, PageContent, PageLayout } from '@tongqian/ui';

const mockDisclaimers = [
  { id: '1', type: 'general', title: '通用免责声明', content: '本结果仅为 AI 初筛和经营风险提示，不构成法律、税务、财务或投资建议。高风险事项建议提交专业顾问、律师或税务顾问复核。', isActive: true },
  { id: '2', type: 'legal', title: '法律风险提示', content: '法律相关内容（包括但不限于担保、合同纠纷、诉讼等）的分析和建议仅供参考，不能替代专业法律意见。请务必咨询持牌律师。', isActive: true },
  { id: '3', type: 'tax', title: '税务风险提示', content: '税务相关内容（包括但不限于税务筹划、发票问题、税率适用等）的分析仅供参考，不能替代专业税务意见。请务必咨询税务顾问。', isActive: true },
  { id: '4', type: 'financial', title: '财务风险提示', content: '财务相关内容（包括但不限于账务处理、资金往来、资产配置等）的分析仅供参考，不能替代专业财务意见。', isActive: false },
  { id: '5', type: 'ai_screening', title: 'AI 初筛标识', content: '本报告由 AI 生成，可能存在偏差。关键决策请务必咨询专业人士。', isActive: true },
];

export default function AdminOwnerRiskDisclaimersPage() {
  return (
    <PageLayout className="bg-[var(--bg)]">
      <PageContent className="space-y-6">
        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-[var(--text-primary)]">免责声明管理</h1>
              <p className="text-sm text-[var(--text-secondary)]">管理企业主风险雷达的免责声明</p>
            </div>
            <Button size="sm">添加免责声明</Button>
          </div>
        </section>

        <section className="space-y-4">
          {mockDisclaimers.map(disc => (
            <div key={disc.id} className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[var(--surface-container-low)] text-[var(--text-secondary)]">{disc.type}</Badge>
                    <h3 className="font-medium text-[var(--text-primary)]">{disc.title}</h3>
                    <Badge className={disc.isActive ? 'bg-success-50 text-success-700' : 'bg-gray-50 text-gray-700'}>
                      {disc.isActive ? '已启用' : '已禁用'}
                    </Badge>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">{disc.content}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">编辑</Button>
                  <Button size="sm" variant="outline">{disc.isActive ? '禁用' : '启用'}</Button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </PageContent>
    </PageLayout>
  );
}
