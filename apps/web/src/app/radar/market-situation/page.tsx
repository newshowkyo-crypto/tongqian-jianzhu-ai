'use client';

import {
  apiClient,
  type MarketSignalView,
  type MarketSignalSimulationView,
  type MarketSignalReportView,
  type MarketSignalFeedbackView,
  type MarketSignalSourceView,
  type MarketSignalTagView,
  type MarketSignalGenerationLogView,
} from '@tongqian/api-client';
import { Badge, Button, EmptyState, PageContent, PageLayout, SectionCard, Spinner, Tabs, TabsContent, TabsList, TabsTrigger } from '@tongqian/ui';
import { useEffect, useState } from 'react';

const CHINESE_TEXT = {
  tag: 'AI 市场态势',
  title: 'AI 市场态势雷达',
  subtitle: '实时监控市场异动、竞争对手动态、政策窗口和潜在风险，把握商机，规避风险。',
  disclaimer: '免责声明：市场信号仅为 AI 整理和初筛，不构成投资建议。重要商业决策请咨询专业顾问。',
  signalTypeLabels: {
    project_hot: '热门项目',
    party_risk: '政企风险',
    competitor_active: '竞争对手动态',
    qualification_dynamic: '资质动态',
    policy_window: '政策窗口',
    judicial_risk: '司法风险',
  } as Record<string, string>,
  riskLabels: {
    low: '低风险',
    medium: '中风险',
    high: '高风险',
    critical: '极高风险',
  } as Record<string, string>,
  oppLabels: {
    low: '低机会',
    medium: '中机会',
    high: '高机会',
  } as Record<string, string>,
};

export default function MarketSituationRadarPage() {
  const [signals, setSignals] = useState<MarketSignalView[]>([]);
  const [totalSignals, setTotalSignals] = useState(0);
  const [featuredSignals, setFeaturedSignals] = useState<MarketSignalView[]>([]);
  const [sources, setSources] = useState<MarketSignalSourceView[]>([]);
  const [tags, setTags] = useState<MarketSignalTagView[]>([]);
  const [generationLogs, setGenerationLogs] = useState<MarketSignalGenerationLogView[]>([]);

  // Selected details
  const [selectedSignal, setSelectedSignal] = useState<MarketSignalView | null>(null);
  const [simulations, setSimulations] = useState<MarketSignalSimulationView[]>([]);
  const [reports, setReports] = useState<MarketSignalReportView[]>([]);
  const [feedbacks, setFeedbacks] = useState<MarketSignalFeedbackView[]>([]);

  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Form states
  const [simType, setSimType] = useState('project_participation');
  const [simParams, setSimParams] = useState('{\n  "targetMargin": 0.08,\n  "partnerCount": 2\n}');
  const [reportType, setReportType] = useState('situation_summary');
  const [feedbackType, setFeedbackType] = useState('accuracy');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Active tab state
  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'opportunity' | 'risk' | 'sources' | 'logs'>('all');
  const [detailTab, setDetailTab] = useState<'simulation' | 'report' | 'feedback'>('simulation');

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [sResult, fList, srcList, tList, logList] = await Promise.all([
        apiClient.marketSituation.listSignals(),
        apiClient.marketSituation.listFeaturedSignals(),
        apiClient.marketSituation.listSources(),
        apiClient.marketSituation.listTags(),
        apiClient.marketSituation.listGenerationLogs(),
      ]);
      setSignals(sResult.list);
      setTotalSignals(sResult.total);
      setFeaturedSignals(fList);
      setSources(srcList);
      setTags(tList);
      setGenerationLogs(logList);
    } catch (err: unknown) {
      console.error(err);
      setError('数据加载失败，请重试');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSelectSignal(sig: MarketSignalView) {
    setSelectedSignal(sig);
    setSimulations([]);
    setReports([]);
    setFeedbacks([]);
    setActionError(null);
    try {
      // Get detailed version
      const detail = await apiClient.marketSituation.getSignal(sig.id);
      setSelectedSignal(detail);

      const [sims, reps, fbs] = await Promise.all([
        apiClient.marketSituation.listSimulations(sig.id),
        apiClient.marketSituation.listReports(sig.id),
        apiClient.marketSituation.listFeedbacks(sig.id),
      ]);
      setSimulations(sims);
      setReports(reps);
      setFeedbacks(fbs);
    } catch (err: unknown) {
      console.error(err);
      setActionError('加载信号详情失败');
    }
  }

  async function handleUnlock(unlockType: 'impact_analysis' | 'simulation' | 'report' | 'full') {
    if (!selectedSignal) return;
    setActionLoading(`unlock-${unlockType}`);
    setActionError(null);
    try {
      const updated = await apiClient.marketSituation.unlockSignal(selectedSignal.id, { unlockType });
      setSelectedSignal(updated);
      await loadData(); // refresh points / signals
    } catch (err: unknown) {
      console.error(err);
      setActionError('解锁失败（可能点数不足或权限受限）');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCreateSimulation() {
    if (!selectedSignal) return;
    setActionLoading('create-sim');
    setActionError(null);
    try {
      let paramsObj: Record<string, unknown> = {};
      try {
        paramsObj = JSON.parse(simParams);
      } catch {
        setActionError('输入参数必须是合法的 JSON 格式');
        setActionLoading(null);
        return;
      }
      await apiClient.marketSituation.createSimulation({
        signalId: selectedSignal.id,
        simulationType: simType,
        inputParams: paramsObj,
      });
      // refresh simulations
      const sims = await apiClient.marketSituation.listSimulations(selectedSignal.id);
      setSimulations(sims);
    } catch (err: unknown) {
      console.error(err);
      setActionError('创建推演失败');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCreateReport() {
    if (!selectedSignal) return;
    setActionLoading('create-report');
    setActionError(null);
    try {
      await apiClient.marketSituation.createReport({
        signalId: selectedSignal.id,
        reportType,
      });
      // refresh reports
      const reps = await apiClient.marketSituation.listReports(selectedSignal.id);
      setReports(reps);
    } catch (err: unknown) {
      console.error(err);
      setActionError('报告生成失败');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCreateFeedback() {
    if (!selectedSignal) return;
    setActionLoading('create-fb');
    setActionError(null);
    try {
      await apiClient.marketSituation.createFeedback({
        signalId: selectedSignal.id,
        feedbackType,
        rating,
        comment: comment.trim() || undefined,
      });
      setComment('');
      // refresh feedbacks
      const fbs = await apiClient.marketSituation.listFeedbacks(selectedSignal.id);
      setFeedbacks(fbs);
    } catch (err: unknown) {
      console.error(err);
      setActionError('反馈提交失败');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleAIAnalyze(sigId: string) {
    setActionLoading(`ai-analyze-${sigId}`);
    setActionError(null);
    try {
      await apiClient.marketSituation.generateAnalysis({
        signalId: sigId,
        analysisType: 'summary',
      });
      await loadData();
      if (selectedSignal?.id === sigId) {
        await handleSelectSignal(selectedSignal);
      }
    } catch (err: unknown) {
      console.error(err);
      setActionError('AI 分析失败');
    } finally {
      setActionLoading(null);
    }
  }

  const getRiskColor = (level: string) => {
    const colors: Record<string, string> = { low: 'text-success-700 bg-success-50', medium: 'text-yellow-700 bg-yellow-50', high: 'text-orange-700 bg-orange-50', critical: 'text-red-700 bg-red-50' };
    return colors[level] || colors.medium;
  };

  const getOpportunityColor = (level: string) => {
    const colors: Record<string, string> = { low: 'text-gray-700 bg-gray-50', medium: 'text-blue-700 bg-blue-50', high: 'text-green-700 bg-green-50' };
    return colors[level] || colors.medium;
  };

  const getSignalTypeLabel = (type: string) => {
    return CHINESE_TEXT.signalTypeLabels[type] || type;
  };

  // Filter signals based on current tab
  const getVisibleSignals = () => {
    if (activeTab === 'featured') return featuredSignals;
    if (activeTab === 'opportunity') return signals.filter((s) => s.opportunityLevel === 'high');
    if (activeTab === 'risk') return signals.filter((s) => s.riskLevel === 'high' || s.riskLevel === 'critical');
    return signals;
  };

  return (
    <PageLayout className="bg-[var(--bg)]">
      <PageContent className="space-y-6">
        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <Badge className="bg-[var(--surface-container-low)] text-[var(--primary)]">{CHINESE_TEXT.tag}</Badge>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold leading-9 text-[var(--text-primary)]">{CHINESE_TEXT.title}</h1>
                <p className="max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">{CHINESE_TEXT.subtitle}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadData}>刷新数据</Button>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <p className="text-red-500">{error}</p>
            <Button onClick={loadData}>重新加载</Button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left/Master Panel */}
            <div className={selectedSignal ? 'lg:col-span-7 space-y-6' : 'lg:col-span-12 space-y-6'}>
              <section className="grid gap-4 sm:grid-cols-4">
                {[
                  ['全部市场信号', totalSignals.toString(), '全面覆盖'],
                  ['高价值商机', signals.filter((s) => s.opportunityLevel === 'high').length.toString(), '值得争取'],
                  ['重点安全预警', signals.filter((s) => s.riskLevel === 'high' || s.riskLevel === 'critical').length.toString(), '及时避险'],
                  ['可研判源渠道', sources.length.toString(), '极速抓取'],
                ].map(([label, value, trend]) => (
                  <article key={label} className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4 shadow-sm">
                    <p className="text-sm text-[var(--text-secondary)]">{label}</p>
                    <p className="mt-2 text-3xl font-semibold tabular-nums text-[var(--text-primary)]">{value}</p>
                    <p className="mt-2 text-xs text-[var(--primary)]">{trend}</p>
                  </article>
                ))}
              </section>

              <Tabs className="space-y-4">
                <TabsList>
                  <TabsTrigger active={activeTab === 'all'} onClick={() => setActiveTab('all')}>全部信号</TabsTrigger>
                  <TabsTrigger active={activeTab === 'featured'} onClick={() => setActiveTab('featured')}>精选信号</TabsTrigger>
                  <TabsTrigger active={activeTab === 'opportunity'} onClick={() => setActiveTab('opportunity')}>机会信号</TabsTrigger>
                  <TabsTrigger active={activeTab === 'risk'} onClick={() => setActiveTab('risk')}>风险预警</TabsTrigger>
                  <TabsTrigger active={activeTab === 'sources'} onClick={() => setActiveTab('sources')}>监控源站</TabsTrigger>
                  <TabsTrigger active={activeTab === 'logs'} onClick={() => setActiveTab('logs')}>AI 研判日志</TabsTrigger>
                </TabsList>

                {activeTab !== 'sources' && activeTab !== 'logs' && (
                  <TabsContent>
                    <SectionCard className="border-[var(--outline-variant)] bg-[var(--surface)]" title="AI 初筛信号池">
                      {getVisibleSignals().length === 0 ? (
                        <EmptyState title="暂无信号" description="未筛选到对应类型的市场信号" />
                      ) : (
                        <div className="space-y-4">
                          {getVisibleSignals().map((signal) => (
                            <div
                              key={signal.id}
                              className={`rounded-lg border p-4 cursor-pointer transition-all ${selectedSignal?.id === signal.id ? 'border-[var(--primary)] bg-[var(--surface-container-low)] shadow-sm' : 'border-[var(--outline-variant)] hover:bg-[var(--surface-container-low)]'}`}
                              onClick={() => handleSelectSignal(signal)}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge className="bg-[var(--surface-container-low)] text-[var(--text-secondary)]">
                                      {getSignalTypeLabel(signal.signalType)}
                                    </Badge>
                                    <Badge className={getRiskColor(signal.riskLevel)}>风险: {CHINESE_TEXT.riskLabels[signal.riskLevel] || signal.riskLevel}</Badge>
                                    <Badge className={getOpportunityColor(signal.opportunityLevel)}>机会: {CHINESE_TEXT.oppLabels[signal.opportunityLevel] || signal.opportunityLevel}</Badge>
                                    {signal.isFeatured && (
                                      <Badge className="bg-[var(--primary)] text-white">精选</Badge>
                                    )}
                                  </div>
                                  <h3 className="font-semibold text-base text-[var(--text-primary)]">{signal.title}</h3>
                                  <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{signal.summary}</p>
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-tertiary)]">
                                    <span>地区: {signal.region}</span>
                                    {signal.publishedAt && (
                                      <span>发布: {new Date(signal.publishedAt).toLocaleDateString('zh-CN')}</span>
                                    )}
                                    {signal.tags.length > 0 && (
                                      <span>标签: {signal.tags.join(', ')}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2 shrink-0">
                                  <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleSelectSignal(signal); }}>研判决策</Button>
                                  <Button size="sm" variant="outline" disabled={actionLoading === `ai-analyze-${signal.id}`} onClick={(e) => { e.stopPropagation(); handleAIAnalyze(signal.id); }}>
                                    {actionLoading === `ai-analyze-${signal.id}` ? '生成中' : 'AI重构'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </SectionCard>
                  </TabsContent>
                )}

                {activeTab === 'sources' && (
                  <TabsContent>
                    <SectionCard className="border-[var(--outline-variant)] bg-[var(--surface)]" title="数据采集渠道">
                      <div className="space-y-4">
                        {sources.map((source) => (
                          <div key={source.id} className="rounded-lg border border-[var(--outline-variant)] p-4 bg-[var(--surface)]">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold text-[var(--text-primary)]">{source.sourceName}</h3>
                                <p className="text-sm text-[var(--text-secondary)] mt-1">覆盖领域: {source.dataTypes.join(', ')} | 监控频次: 每 {source.crawlIntervalMin} 分钟</p>
                              </div>
                              <Badge className={source.healthStatus === 'healthy' ? 'text-success-700 bg-success-50' : 'text-yellow-700 bg-yellow-50'}>
                                {source.healthStatus === 'healthy' ? '采集正常' : '采集异常'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  </TabsContent>
                )}

                {activeTab === 'logs' && (
                  <TabsContent>
                    <SectionCard className="border-[var(--outline-variant)] bg-[var(--surface)]" title="AI 数据处理与审计链路">
                      <div className="space-y-4">
                        {generationLogs.map((log) => (
                          <div key={log.id} className="rounded-lg border border-[var(--outline-variant)] p-4 bg-[var(--surface)] text-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-[var(--text-primary)]">研判任务: {log.generationType}</span>
                              <Badge className={log.status === 'success' ? 'text-success-700 bg-success-50' : 'text-red-700 bg-red-50'}>
                                {log.status === 'success' ? '执行成功' : '失败'}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center text-xs text-[var(--text-secondary)] mt-2">
                              <span>TraceId: {log.traceId}</span>
                              <span>扣除点数: {log.creditsCost} 点</span>
                              <span>研判时间: {new Date(log.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  </TabsContent>
                )}
              </Tabs>
            </div>

            {/* Right/Detail Panel */}
            {selectedSignal && (
              <div className="lg:col-span-5 space-y-6">
                <SectionCard
                  className="border-[var(--outline-variant)] bg-[var(--surface)]"
                  title="信号研判控制台"
                  actions={<Button size="sm" variant="outline" onClick={() => setSelectedSignal(null)}>关闭面板</Button>}
                >
                  <div className="space-y-4">
                    <div className="border-b border-[var(--outline-variant)] pb-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-[var(--surface-container-low)] text-[var(--text-secondary)]">
                          {getSignalTypeLabel(selectedSignal.signalType)}
                        </Badge>
                        <Badge className="bg-[var(--surface-container-low)] text-[var(--text-secondary)]">Tier {selectedSignal.tierBadge}</Badge>
                      </div>
                      <h2 className="text-xl font-bold text-[var(--text-primary)]">{selectedSignal.title}</h2>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{selectedSignal.summary}</p>
                    </div>

                    {/* Action Error Alerts */}
                    {actionError && (
                      <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                        {actionError}
                      </div>
                    )}

                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-[var(--text-primary)]">AI 专项决策解锁 (多级沙盘)</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          ['impact_analysis', '影响沙盘', 50] as const,
                          ['simulation', '业务推演', 80] as const,
                          ['report', '研判报告', 100] as const,
                        ].map(([part, name, cost]) => {
                          const isUnlocked = selectedSignal.unlockedParts?.includes(part);
                          return (
                            <div key={part} className="rounded-lg border border-[var(--outline-variant)] p-3 bg-[var(--surface-container-low)] flex flex-col justify-between gap-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-[var(--text-primary)]">{name}</span>
                                <Badge className={isUnlocked ? 'text-success-700 bg-success-50' : 'text-yellow-700 bg-yellow-50'}>
                                  {isUnlocked ? '已解锁' : '未解锁'}
                                </Badge>
                              </div>
                              {!isUnlocked && (
                                <Button
                                  size="sm"
                                  className="w-full mt-2 text-xs"
                                  disabled={actionLoading === `unlock-${part}`}
                                  onClick={() => handleUnlock(part as 'impact_analysis' | 'simulation' | 'report')}
                                >
                                  {actionLoading === `unlock-${part}` ? <Spinner className="mr-1 h-3 w-3" /> : null}
                                  扣减 {cost} 点解锁
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Sub-Tabs for Unlocked Interactive features */}
                    <div className="border-t border-[var(--outline-variant)] pt-4 space-y-4">
                      <div className="flex gap-2 border-b border-[var(--outline-variant)] pb-2">
                        <button
                          className={`text-xs font-semibold pb-1 outline-none ${detailTab === 'simulation' ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                          onClick={() => setDetailTab('simulation')}
                        >
                          业务仿真推演
                        </button>
                        <button
                          className={`text-xs font-semibold pb-1 outline-none ${detailTab === 'report' ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                          onClick={() => setDetailTab('report')}
                        >
                          专项决策报告
                        </button>
                        <button
                          className={`text-xs font-semibold pb-1 outline-none ${detailTab === 'feedback' ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                          onClick={() => setDetailTab('feedback')}
                        >
                          可行度反馈
                        </button>
                      </div>

                      {detailTab === 'simulation' && (
                        <div className="space-y-4">
                          {!selectedSignal.unlockedParts?.includes('simulation') ? (
                            <p className="text-xs text-[var(--text-secondary)] py-4 text-center">请先解锁“业务推演”沙盘以启用本仿真推演工具</p>
                          ) : (
                            <div className="space-y-4">
                              <div className="space-y-3 p-3 border border-[var(--outline-variant)] rounded-lg bg-[var(--surface-container-low)]">
                                <h4 className="text-xs font-bold text-[var(--text-primary)]">启动全新多因子商业模拟</h4>
                                <div className="space-y-2">
                                  <label className="text-xs text-[var(--text-secondary)]">推演研判主题</label>
                                  <select
                                    className="w-full text-xs bg-[var(--surface)] border border-[var(--outline-variant)] rounded p-2 outline-none"
                                    value={simType}
                                    onChange={(e) => setSimType(e.target.value)}
                                  >
                                    <option value="project_participation">项目投标可行性测算</option>
                                    <option value="market_impact">市场冲击波及度测算</option>
                                    <option value="risk_spread">风险关联扩散链条推演</option>
                                    <option value="opportunity_timing">商机切入最佳时间点预测</option>
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs text-[var(--text-secondary)]">仿真因子 (JSON格式配置)</label>
                                  <textarea
                                    className="w-full text-xs font-mono bg-[var(--surface)] border border-[var(--outline-variant)] rounded p-2 h-20 outline-none resize-none"
                                    value={simParams}
                                    onChange={(e) => setSimParams(e.target.value)}
                                  />
                                </div>
                                <Button
                                  size="sm"
                                  className="w-full"
                                  disabled={actionLoading === 'create-sim'}
                                  onClick={handleCreateSimulation}
                                >
                                  {actionLoading === 'create-sim' ? <Spinner className="mr-2" /> : null}
                                  立即推演计算 (需消耗50点)
                                </Button>
                              </div>

                              <div className="space-y-2">
                                <h4 className="text-xs font-bold text-[var(--text-primary)]">历史沙盘推演记录</h4>
                                {simulations.length === 0 ? (
                                  <p className="text-xs text-[var(--text-secondary)] text-center py-4">暂无历史模拟数据</p>
                                ) : (
                                  <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {simulations.map((sim) => (
                                      <div key={sim.id} className="rounded-lg border border-[var(--outline-variant)] p-3 bg-[var(--surface)] text-xs">
                                        <div className="flex justify-between items-center font-bold">
                                          <span>{sim.simulationType}</span>
                                          <Badge className="bg-success-50 text-success-700">完成</Badge>
                                        </div>
                                        <p className="text-[var(--text-secondary)] mt-1">计算结果: {JSON.stringify(sim.simulationResult)}</p>
                                        <p className="text-[var(--text-tertiary)] mt-1 text-[10px]">{new Date(sim.createdAt).toLocaleString()}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {detailTab === 'report' && (
                        <div className="space-y-4">
                          {!selectedSignal.unlockedParts?.includes('report') ? (
                            <p className="text-xs text-[var(--text-secondary)] py-4 text-center">请先解锁“研判报告”沙盘以启用专项研判报告生成工具</p>
                          ) : (
                            <div className="space-y-4">
                              <div className="space-y-3 p-3 border border-[var(--outline-variant)] rounded-lg bg-[var(--surface-container-low)]">
                                <h4 className="text-xs font-bold text-[var(--text-primary)]">一键生成定制化决策专项研判报告</h4>
                                <div className="space-y-2">
                                  <label className="text-xs text-[var(--text-secondary)]">报告大纲模板类型</label>
                                  <select
                                    className="w-full text-xs bg-[var(--surface)] border border-[var(--outline-variant)] rounded p-2 outline-none"
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value)}
                                  >
                                    <option value="situation_summary">市场异动现状核心提示报告</option>
                                    <option value="impact_analysis">行业连带冲击深度沙盘研判书</option>
                                    <option value="participation_recommendation">特选级商业行动执行指引</option>
                                  </select>
                                </div>
                                <Button
                                  size="sm"
                                  className="w-full"
                                  disabled={actionLoading === 'create-report'}
                                  onClick={handleCreateReport}
                                >
                                  {actionLoading === 'create-report' ? <Spinner className="mr-2" /> : null}
                                  生成商业研判报告 (需消耗100点)
                                </Button>
                              </div>

                              <div className="space-y-2">
                                <h4 className="text-xs font-bold text-[var(--text-primary)]">已生成之报告列表</h4>
                                {reports.length === 0 ? (
                                  <p className="text-xs text-[var(--text-secondary)] text-center py-4">暂无历史研判报告</p>
                                ) : (
                                  <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {reports.map((rep) => (
                                      <div key={rep.id} className="rounded-lg border border-[var(--outline-variant)] p-3 bg-[var(--surface)] text-xs flex justify-between items-center gap-2">
                                        <div className="space-y-1">
                                          <p className="font-bold text-[var(--text-primary)]">{rep.title || '专项研判报告'}</p>
                                          <p className="text-xs text-[var(--text-secondary)] line-clamp-1">{rep.executiveSummary}</p>
                                          <p className="text-[10px] text-[var(--text-tertiary)]">{new Date(rep.createdAt).toLocaleString()}</p>
                                        </div>
                                        <div className="flex flex-col gap-1 shrink-0">
                                          <Button size="sm" variant="outline" onClick={() => window.open(rep.h5Url || '#', '_blank')}>阅读报告</Button>
                                          <Button size="sm" variant="outline" onClick={() => window.open(rep.pdfUrl || '#', '_blank')}>PDF下载</Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {detailTab === 'feedback' && (
                        <div className="space-y-4">
                          <div className="space-y-3 p-3 border border-[var(--outline-variant)] rounded-lg bg-[var(--surface-container-low)]">
                            <h4 className="text-xs font-bold text-[var(--text-primary)]">提交 AI 研判结果可行度反馈</h4>
                            <div className="space-y-2">
                              <label className="text-xs text-[var(--text-secondary)]">反馈评价维度</label>
                              <select
                                className="w-full text-xs bg-[var(--surface)] border border-[var(--outline-variant)] rounded p-2 outline-none"
                                value={feedbackType}
                                onChange={(e) => setFeedbackType(e.target.value)}
                              >
                                <option value="accuracy">准确度反馈</option>
                                <option value="relevance">关联匹配相关性</option>
                                <option value="usefulness">商机实用指导价值</option>
                                <option value="new_info">实证补充增量信息</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs text-[var(--text-secondary)]">可用性星级打分 (1-5 星)</label>
                              <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((num) => (
                                  <button
                                    key={num}
                                    type="button"
                                    className={`px-3 py-1 text-xs border rounded transition-colors ${rating >= num ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--outline-variant)]'}`}
                                    onClick={() => setRating(num)}
                                  >
                                    {num} ★
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs text-[var(--text-secondary)]">备注与建议</label>
                              <textarea
                                className="w-full text-xs bg-[var(--surface)] border border-[var(--outline-variant)] rounded p-2 h-16 outline-none resize-none"
                                value={comment}
                                placeholder="输入您对本条研判的任何反馈或增量信息，协助系统迭代学习..."
                                onChange={(e) => setComment(e.target.value)}
                              />
                            </div>
                            <Button
                              size="sm"
                              className="w-full"
                              disabled={actionLoading === 'create-fb'}
                              onClick={handleCreateFeedback}
                            >
                              {actionLoading === 'create-fb' ? <Spinner className="mr-2" /> : null}
                              提交系统学习与审计
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-xs font-bold text-[var(--text-primary)]">历史反馈评价记录</h4>
                            {feedbacks.length === 0 ? (
                              <p className="text-xs text-[var(--text-secondary)] text-center py-4">暂无历史用户反馈记录</p>
                            ) : (
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {feedbacks.map((fb) => (
                                  <div key={fb.id} className="rounded-lg border border-[var(--outline-variant)] p-3 bg-[var(--surface)] text-xs">
                                    <div className="flex justify-between items-center">
                                      <span className="font-bold text-[var(--text-primary)]">{fb.feedbackType === 'accuracy' ? '准确性' : fb.feedbackType === 'relevance' ? '相关性' : fb.feedbackType === 'usefulness' ? '实用性' : '新增情报'}</span>
                                      <span className="text-[var(--text-secondary)]">{fb.rating} 星评价</span>
                                    </div>
                                    {fb.comment && <p className="text-[var(--text-secondary)] mt-1">{fb.comment}</p>}
                                    <p className="text-[10px] text-[var(--text-tertiary)] mt-1">{new Date(fb.createdAt).toLocaleString()}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </SectionCard>
              </div>
            )}
          </div>
        )}

        <section className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <p className="text-xs text-orange-800">{CHINESE_TEXT.disclaimer}</p>
        </section>
      </PageContent>
    </PageLayout>
  );
}
