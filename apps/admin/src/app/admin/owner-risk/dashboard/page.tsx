'use client';

import { Badge, Button, PageContent, PageLayout, TabsContent, TabsList, TabsTrigger } from '@tongqian/ui';
import { useState } from 'react';

// Default card catalog — these are the platform's real default risk-card
// definitions (mirrors backend defaults), shown for configuration reference.
const defaultCards = [
  { id: '1', cardKey: 'guarantee_overview', title: '担保总览', unlockCredits: 50, isActive: true },
  { id: '2', cardKey: 'mixing_risk', title: '混同风险', unlockCredits: 80, isActive: true },
  { id: '3', cardKey: 'counterparty_risk', title: '交易对手', unlockCredits: 50, isActive: true },
  { id: '4', cardKey: 'receivable_aging', title: '应收账款', unlockCredits: 50, isActive: true },
];

export default function AdminOwnerRiskDashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <PageLayout className="bg-[var(--bg)]">
      <PageContent className="space-y-6">
        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="space-y-4">
            <Badge className="bg-[var(--primary)] text-white">企业管理</Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold leading-9 text-[var(--text-primary)]">企业主风险雷达 - 管理后台</h1>
              <p className="text-sm text-[var(--text-secondary)]">管理企业主风险分析的规则、卡片、配置和日志</p>
            </div>
          </div>
        </section>

        <div className="space-y-4">
          <TabsList>
            <TabsTrigger onClick={() => setActiveTab('dashboard')} active={activeTab === 'dashboard'}>数据概览</TabsTrigger>
            <TabsTrigger onClick={() => setActiveTab('rules')} active={activeTab === 'rules'}>规则配置</TabsTrigger>
            <TabsTrigger onClick={() => setActiveTab('cards')} active={activeTab === 'cards'}>卡片管理</TabsTrigger>
            <TabsTrigger onClick={() => setActiveTab('disclaimers')} active={activeTab === 'disclaimers'}>免责声明</TabsTrigger>
            <TabsTrigger onClick={() => setActiveTab('points')} active={activeTab === 'points'}>点数配置</TabsTrigger>
            <TabsTrigger onClick={() => setActiveTab('logs')} active={activeTab === 'logs'}>操作日志</TabsTrigger>
          </TabsList>

          {activeTab === 'dashboard' && <TabsContent>
            <div className="grid gap-4 md:grid-cols-4">
              {['总分析次数', '今日新增', '高风险档案', '总收入(点)'].map((label) => (
                <article key={label} className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
                  <p className="text-sm text-[var(--text-secondary)]">{label}</p>
                  <p className="mt-2 text-3xl font-semibold text-[var(--text-tertiary)]">—</p>
                  <p className="mt-2 text-xs text-[var(--text-tertiary)]">实时统计即将接入</p>
                </article>
              ))}
            </div>

            <section className="mt-6 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
              <h2 className="text-lg font-medium text-[var(--text-primary)]">最近分析记录</h2>
              <div className="mt-4 rounded-lg border border-dashed border-[var(--outline-variant)] p-8 text-center">
                <p className="text-sm text-[var(--text-secondary)]">实时分析记录即将接入</p>
                <p className="mt-1 text-xs text-[var(--text-tertiary)]">上线后此处展示各租户最近的企业主风险分析记录。</p>
              </div>
            </section>
          </TabsContent>}

          {activeTab === 'rules' && <TabsContent>
            <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-[var(--text-primary)]">风险规则配置</h2>
                <Button size="sm">添加规则</Button>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { name: '担保风险阈值', description: '单笔担保超过设定金额触发高风险预警', threshold: '500万', riskLevel: 'high' },
                  { name: '账龄风险阈值', description: '应收账款账龄超过设定天数触发风险', threshold: '180天', riskLevel: 'medium' },
                ].map((rule, i) => (
                  <div key={i} className="rounded-lg border border-[var(--outline-variant)] p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-[var(--text-primary)]">{rule.name}</h3>
                        <p className="text-sm text-[var(--text-secondary)]">{rule.description}</p>
                        <p className="mt-1 text-xs text-[var(--text-tertiary)]">阈值: {rule.threshold}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">编辑</Button>
                        <Button size="sm" variant="outline">禁用</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </TabsContent>}

          {activeTab === 'cards' && <TabsContent>
            <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-[var(--text-primary)]">风险卡片管理</h2>
                <Button size="sm">添加卡片</Button>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {defaultCards.map(card => (
                  <div key={card.id} className="rounded-lg border border-[var(--outline-variant)] p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-[var(--text-primary)]">{card.title}</h3>
                        <p className="text-sm text-[var(--text-secondary)]">Key: {card.cardKey}</p>
                        <p className="mt-1 text-xs text-[var(--text-tertiary)]">解锁点数: {card.unlockCredits}</p>
                      </div>
                      <Badge className={card.isActive ? 'bg-success-50 text-success-700' : 'bg-gray-50 text-gray-700'}>
                        {card.isActive ? '已启用' : '已禁用'}
                      </Badge>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline">编辑</Button>
                      <Button size="sm" variant="outline">{card.isActive ? '禁用' : '启用'}</Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </TabsContent>}

          {activeTab === 'disclaimers' && <TabsContent>
            <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-[var(--text-primary)]">免责声明管理</h2>
                <Button size="sm">添加免责声明</Button>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { type: 'general', content: '本结果仅为 AI 初筛和经营风险提示，不构成法律、税务、财务或投资建议。', isActive: true },
                  { type: 'legal', content: '法律相关内容建议咨询专业律师。', isActive: true },
                  { type: 'tax', content: '税务相关内容建议咨询专业税务顾问。', isActive: true },
                ].map((d, i) => (
                  <div key={i} className="rounded-lg border border-[var(--outline-variant)] p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge className="bg-[var(--surface-container-low)] text-[var(--text-secondary)]">{d.type}</Badge>
                        <p className="mt-2 text-sm text-[var(--text-secondary)]">{d.content}</p>
                      </div>
                      <Button size="sm" variant="outline">编辑</Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </TabsContent>}

          {activeTab === 'points' && <TabsContent>
            <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
              <h2 className="text-lg font-medium text-[var(--text-primary)]">点数价格配置</h2>
              <div className="mt-4 space-y-3">
                {[
                  { action: '解锁担保总览卡片', credits: 50 },
                  { action: '解锁混同风险卡片', credits: 80 },
                  { action: '解锁交易对手卡片', credits: 50 },
                  { action: '解锁应收账款卡片', credits: 50 },
                  { action: '生成综合风险报告', credits: 100 },
                  { action: '提交顾问复核', credits: 200 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-[var(--outline-variant)] p-3">
                    <span className="text-[var(--text-primary)]">{item.action}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--text-primary)]">{item.credits} 点</span>
                      <Button size="sm" variant="outline">调整</Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </TabsContent>}

          {activeTab === 'logs' && <TabsContent>
            <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
              <h2 className="text-lg font-medium text-[var(--text-primary)]">操作日志</h2>
              <div className="mt-4 rounded-lg border border-dashed border-[var(--outline-variant)] p-8 text-center">
                <p className="text-sm text-[var(--text-secondary)]">操作日志即将接入</p>
                <p className="mt-1 text-xs text-[var(--text-tertiary)]">上线后此处展示解锁、分析、复核等操作的审计日志。</p>
              </div>
            </section>
          </TabsContent>}
        </div>
      </PageContent>
    </PageLayout>
  );
}
