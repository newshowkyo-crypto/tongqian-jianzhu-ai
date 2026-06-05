'use client';

import { Badge, Button, EmptyState, PageContent, PageLayout, TabsList, TabsTrigger, TabsContent } from '@tongqian/ui';
import { useState } from 'react';

export default function AdminMarketSituationDashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <PageLayout className="bg-[var(--bg)]">
      <PageContent className="space-y-6">
        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="space-y-4">
            <Badge className="bg-[var(--primary)] text-white">企业管理</Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold leading-9 text-[var(--text-primary)]">AI 市场态势雷达 - 管理后台</h1>
              <p className="text-sm text-[var(--text-secondary)]">管理市场信号的配置、审核和日志</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {['总信号数', '今日新增', '高机会信号', '总收入(点)'].map((label) => (
            <article key={label} className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
              <p className="text-sm text-[var(--text-secondary)]">{label}</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--text-tertiary)]">—</p>
              <p className="mt-2 text-xs text-[var(--text-tertiary)]">实时统计即将接入</p>
            </article>
          ))}
        </section>

        <div className="space-y-4">
          <TabsList>
            <TabsTrigger onClick={() => setActiveTab('dashboard')} active={activeTab === 'dashboard'}>信号管理</TabsTrigger>
            <TabsTrigger onClick={() => setActiveTab('sources')} active={activeTab === 'sources'}>信号来源</TabsTrigger>
            <TabsTrigger onClick={() => setActiveTab('categories')} active={activeTab === 'categories'}>分类配置</TabsTrigger>
            <TabsTrigger onClick={() => setActiveTab('review')} active={activeTab === 'review'}>待审核</TabsTrigger>
            <TabsTrigger onClick={() => setActiveTab('rules')} active={activeTab === 'rules'}>规则配置</TabsTrigger>
            <TabsTrigger onClick={() => setActiveTab('points')} active={activeTab === 'points'}>点数配置</TabsTrigger>
            <TabsTrigger onClick={() => setActiveTab('logs')} active={activeTab === 'logs'}>操作日志</TabsTrigger>
          </TabsList>

          {activeTab === 'dashboard' && <TabsContent>
            <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-[var(--text-primary)]">市场信号列表</h2>
                <Button size="sm">添加信号</Button>
              </div>
              <div className="mt-4">
                <EmptyState title="市场信号即将接入" description="上线后此处展示各租户的市场信号列表与发布状态，支持编辑、上下架。" />
              </div>
            </section>
          </TabsContent>}

          {activeTab === 'sources' && <TabsContent>
            <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-[var(--text-primary)]">信号来源管理</h2>
                <Button size="sm">添加来源</Button>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { name: '政府采购网', type: 'government', signalsCount: 120, isActive: true },
                  { name: '招标投标公共服务平台', type: 'tender', signalsCount: 85, isActive: true },
                  { name: '企业信用信息公示系统', type: 'credit', signalsCount: 45, isActive: true },
                ].map((source, i) => (
                  <div key={i} className="rounded-lg border border-[var(--outline-variant)] p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-[var(--text-primary)]">{source.name}</h3>
                        <p className="text-sm text-[var(--text-secondary)]">类型: {source.type} • 信号数: {source.signalsCount}</p>
                      </div>
                      <Button size="sm" variant="outline">编辑</Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </TabsContent>}

          {activeTab === 'categories' && <TabsContent>
            <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
              <h2 className="text-lg font-medium text-[var(--text-primary)]">信号分类配置</h2>
              <div className="mt-4 space-y-3">
                {[
                  { name: '热门项目', key: 'project_hot', icon: '📊', isActive: true },
                  { name: '政企风险', key: 'party_risk', icon: '⚠️', isActive: true },
                  { name: '竞争对手动态', key: 'competitor_active', icon: '🏢', isActive: true },
                  { name: '资质动态', key: 'qualification_dynamic', icon: '📋', isActive: true },
                  { name: '政策窗口', key: 'policy_window', icon: '📜', isActive: true },
                  { name: '司法风险', key: 'judicial_risk', icon: '⚖️', isActive: true },
                ].map((cat, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-[var(--outline-variant)] p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <div>
                        <h3 className="font-medium text-[var(--text-primary)]">{cat.name}</h3>
                        <p className="text-xs text-[var(--text-tertiary)]">Key: {cat.key}</p>
                      </div>
                    </div>
                    <Badge className={cat.isActive ? 'bg-success-50 text-success-700' : 'bg-gray-50 text-gray-700'}>
                      {cat.isActive ? '已启用' : '已禁用'}
                    </Badge>
                  </div>
                ))}
              </div>
            </section>
          </TabsContent>}

          {activeTab === 'review' && <TabsContent>
            <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
              <h2 className="text-lg font-medium text-[var(--text-primary)]">待审核信号</h2>
              <div className="mt-4">
                <EmptyState title="暂无待审核信号" description="所有信号都已审核完成" />
              </div>
            </section>
          </TabsContent>}

          {activeTab === 'rules' && <TabsContent>
            <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-[var(--text-primary)]">信号生成规则</h2>
                <Button size="sm">添加规则</Button>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { name: '高风险供应商识别', description: '自动识别被列入经营异常的企业', isActive: true },
                  { name: '竞争对手中标监控', description: '监控竞争对手的中标记录', isActive: true },
                  { name: '政策窗口期识别', description: '自动识别政策发布后的市场机会', isActive: true },
                ].map((rule, i) => (
                  <div key={i} className="rounded-lg border border-[var(--outline-variant)] p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-[var(--text-primary)]">{rule.name}</h3>
                        <p className="text-sm text-[var(--text-secondary)]">{rule.description}</p>
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
                  { action: '解锁信号详情', credits: 50 },
                  { action: '市场影响模拟', credits: 80 },
                  { action: '生成态势报告', credits: 100 },
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
              <div className="mt-4">
                <EmptyState title="操作日志即将接入" description="上线后此处展示解锁、模拟、报告生成等操作的实时审计日志（含点数消耗与成功/失败状态）。" />
              </div>
            </section>
          </TabsContent>}
        </div>
      </PageContent>
    </PageLayout>
  );
}
