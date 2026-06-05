'use client';

import { apiClient, type MarketSignalView } from '@tongqian/api-client';
import { Badge, Button, PageContent, PageLayout, Spinner, Tabs, TabsContent, TabsList, TabsTrigger } from '@tongqian/ui';
import { useEffect, useState } from 'react';

const CHINESE_TEXT = {
  signalTypeLabels: {
    project_hot: '热门项目',
    party_risk: '政企风险',
    competitor_active: '竞争对手动态',
    qualification_dynamic: '资质动态',
    policy_window: '政策窗口',
    judicial_risk: '司法风险',
  } as Record<string, string>,
};

export default function MobileMarketSituationPage() {
  const [signals, setSignals] = useState<MarketSignalView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'opportunity' | 'risk'>('all');

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.marketSituation.listSignals();
      setSignals(result.list);
    } catch (err: unknown) {
      console.error(err);
      setError('加载失败，请重试');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const getSignalTypeLabel = (type: string) => {
    return CHINESE_TEXT.signalTypeLabels[type] || type;
  };

  return (
    <PageLayout className="bg-[var(--bg)]">
      <PageContent className="space-y-4">
        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
          <div className="flex justify-between items-center">
            <Badge className="bg-[var(--surface-container-low)] text-[var(--primary)]">AI 市场态势</Badge>
            <Button size="sm" variant="outline" onClick={loadData}>刷新</Button>
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">市场态势雷达</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">实时监控和决策推演</p>
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <p className="text-red-500 text-sm">{error}</p>
            <Button size="sm" onClick={loadData}>重试</Button>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-2 gap-3">
              {[
                ['监控信号', signals.length.toString()],
                ['高商机数', signals.filter((s) => s.opportunityLevel === 'high').length.toString()],
              ].map(([label, value]) => (
                <article key={label} className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-3 text-center">
                  <p className="text-sm text-[var(--text-secondary)]">{label}</p>
                  <p className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">{value}</p>
                </article>
              ))}
            </section>

            <Tabs className="space-y-3">
              <TabsList className="flex gap-2 overflow-x-auto">
                <TabsTrigger active={activeTab === 'all'} onClick={() => setActiveTab('all')} className="whitespace-nowrap">全部</TabsTrigger>
                <TabsTrigger active={activeTab === 'opportunity'} onClick={() => setActiveTab('opportunity')} className="whitespace-nowrap">机会</TabsTrigger>
                <TabsTrigger active={activeTab === 'risk'} onClick={() => setActiveTab('risk')} className="whitespace-nowrap">风险</TabsTrigger>
              </TabsList>

              {activeTab === 'all' && (
                <TabsContent>
                  <section className="space-y-3">
                    {signals.length === 0 ? (
                      <p className="text-sm text-[var(--text-secondary)] text-center py-8">暂无信号</p>
                    ) : (
                      signals.map(signal => (
                        <div key={signal.id} className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-[var(--surface-container-low)] text-[var(--text-secondary)]">{getSignalTypeLabel(signal.signalType)}</Badge>
                              <Badge className={signal.riskLevel === 'high' || signal.riskLevel === 'critical' ? 'bg-orange-50 text-orange-700' : 'bg-success-50 text-success-700'}>
                                {signal.riskLevel === 'high' || signal.riskLevel === 'critical' ? '重点风险' : '机会'}
                              </Badge>
                            </div>
                            <h3 className="font-medium text-[var(--text-primary)]">{signal.title}</h3>
                            <p className="text-sm text-[var(--text-secondary)]">{signal.summary}</p>
                            <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                              <span>地区: {signal.region}</span>
                              {signal.publishedAt && (
                                <>
                                  <span>•</span>
                                  <span>{new Date(signal.publishedAt).toLocaleDateString('zh-CN')}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </section>
                </TabsContent>
              )}

              {activeTab === 'opportunity' && (
                <TabsContent>
                  <section className="space-y-3">
                    {signals.filter(s => s.opportunityLevel === 'high').length === 0 ? (
                      <p className="text-sm text-[var(--text-secondary)] text-center py-8">暂无高机会信号</p>
                    ) : (
                      signals.filter(s => s.opportunityLevel === 'high').map(signal => (
                        <div key={signal.id} className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
                          <h3 className="font-medium text-[var(--text-primary)]">{signal.title}</h3>
                          <p className="mt-1 text-sm text-[var(--text-secondary)]">{signal.summary}</p>
                          <p className="mt-2 text-xs text-[var(--text-tertiary)]">地区: {signal.region}</p>
                        </div>
                      ))
                    )}
                  </section>
                </TabsContent>
              )}

              {activeTab === 'risk' && (
                <TabsContent>
                  <section className="space-y-3">
                    {signals.filter(s => s.riskLevel === 'high' || s.riskLevel === 'critical').length === 0 ? (
                      <p className="text-sm text-[var(--text-secondary)] text-center py-8">暂无高风险预警</p>
                    ) : (
                      signals.filter(s => s.riskLevel === 'high' || s.riskLevel === 'critical').map(signal => (
                        <div key={signal.id} className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                          <Badge className="bg-orange-100 text-orange-700">高风险</Badge>
                          <h3 className="mt-2 font-medium text-[var(--text-primary)]">{signal.title}</h3>
                          <p className="mt-1 text-sm text-[var(--text-secondary)]">{signal.summary}</p>
                        </div>
                      ))
                    )}
                  </section>
                </TabsContent>
              )}
            </Tabs>
          </>
        )}

        <section className="rounded-lg border border-orange-200 bg-orange-50 p-3">
          <p className="text-xs text-orange-800">免责声明：市场信号仅为 AI 整理和初筛，不构成投资建议。</p>
        </section>
      </PageContent>
    </PageLayout>
  );
}
