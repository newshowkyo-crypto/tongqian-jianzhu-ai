'use client';

import { apiClient, type OwnerRiskProfileView, type OwnerRiskCardView } from '@tongqian/api-client';
import { Badge, Button, PageContent, PageLayout, SectionCard, Spinner, Tabs, TabsContent, TabsList, TabsTrigger } from '@tongqian/ui';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

const CHINESE_TEXT = {
  tag: 'AI 风险分析',
  title: '企业主风险雷达',
  subtitle: 'AI 初筛企业主的担保、混同、交易对手和应收账款风险，识别高风险事项并建议专业顾问复核。',
  backRadar: '查看报告',
  reanalyze: '重新分析',
  overallRisk: '综合风险等级',
  riskScore: '风险评分',
  scoreMax: '满分 100',
  analysisTime: '分析时间',
  lastTime: '最近一次',
  reportCount: '报告数量',
  viewDetails: '查看详情',
  disclaimer: '本结果仅为 AI 初筛和经营风险提示，不构成法律、税务、财务或投资建议。高风险事项建议提交专业顾问复核。',
  advisorReview: '高风险事项建议顾问复核',
  highRiskItems: (count: number) => `识别到 ${count} 项高风险事项`,
  submitReview: '提交顾问复核',
  loading: '分析加载中...',
  error: '加载分析失败，请重试',
  empty: '暂无档案，请先在档案库创建企业主档案以启动 AI 分析。',
  toProfiles: '前往档案库',
  unlockTitle: '解锁完整分析',
  unlockCost: (credits: number) => `解锁 (${credits} 点)`,
};

const getRiskColor = (level: string) => {
  const colors: Record<string, string> = {
    low: 'text-success-700 bg-success-50',
    medium: 'text-yellow-700 bg-yellow-50',
    high: 'text-orange-700 bg-orange-50',
    critical: 'text-red-700 bg-red-50',
  };
  return colors[level] || 'text-yellow-700 bg-yellow-50';
};

const getRiskLabel = (level: string) => {
  const labels: Record<string, string> = {
    low: '低风险',
    medium: '中风险',
    high: '高风险',
    critical: '极高风险',
  };
  return labels[level] || '中风险';
};

export default function OwnerRiskOverviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const profileIdFromUrl = searchParams.get('profileId');

  const [profiles, setProfiles] = useState<OwnerRiskProfileView[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<OwnerRiskProfileView | null>(null);
  const [cards, setCards] = useState<OwnerRiskCardView[]>([]);
  const [reportsCount, setReportsCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [unlocking, setUnlocking] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'guarantees' | 'mixing' | 'counterparties' | 'receivables'>('guarantees');

  async function loadData() {
    setLoading(true);
    setError(false);
    try {
      const pList = await apiClient.ownerRisk.listProfiles();
      setProfiles(pList);

      if (pList.length === 0) {
        setLoading(false);
        return;
      }

      // Choose selected profile
      const currentProfile = pList.find((p) => p.id === profileIdFromUrl) ?? pList[0];
      if (currentProfile) {
        setSelectedProfile(currentProfile);
        const [cList, rList] = await Promise.all([
          apiClient.ownerRisk.listCards(currentProfile.id),
          apiClient.ownerRisk.listReports(currentProfile.id),
        ]);
        setCards(cList);
        setReportsCount(rList.length);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [profileIdFromUrl]);

  async function handleAnalyze() {
    if (!selectedProfile) return;
    setAnalyzing(true);
    try {
      await apiClient.ownerRisk.generateAnalysis(selectedProfile.id, { analysisType: 'overview' });
      // Reload updated profile and cards
      const [updatedProfile, updatedCards] = await Promise.all([
        apiClient.ownerRisk.getProfile(selectedProfile.id),
        apiClient.ownerRisk.listCards(selectedProfile.id),
      ]);
      setSelectedProfile(updatedProfile);
      setCards(updatedCards);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleUnlockCard(cardId: string) {
    if (unlocking) return;
    setUnlocking(cardId);
    try {
      await apiClient.ownerRisk.unlockCard(cardId);
      if (selectedProfile) {
        const updatedCards = await apiClient.ownerRisk.listCards(selectedProfile.id);
        setCards(updatedCards);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUnlocking(null);
    }
  }

  // Count high risk cards
  const highRiskCardsCount = cards.filter(c => c.riskLevel === 'high' || c.riskLevel === 'critical').length;

  if (loading) {
    return (
      <PageLayout className="bg-[var(--bg)]">
        <div className="flex items-center justify-center py-24">
          <Spinner />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout className="bg-[var(--bg)]">
        <PageContent className="flex flex-col items-center justify-center py-24 space-y-4">
          <p className="text-red-500">{CHINESE_TEXT.error}</p>
          <Button onClick={loadData}>重试</Button>
        </PageContent>
      </PageLayout>
    );
  }

  if (profiles.length === 0 || !selectedProfile) {
    return (
      <PageLayout className="bg-[var(--bg)]">
        <PageContent className="flex flex-col items-center justify-center py-24 space-y-6">
          <p className="text-sm text-[var(--text-secondary)]">{CHINESE_TEXT.empty}</p>
          <Link href="/owner-risk">
            <Button>{CHINESE_TEXT.toProfiles}</Button>
          </Link>
        </PageContent>
      </PageLayout>
    );
  }

  const formattedDate = new Date(selectedProfile.createdAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return (
    <PageLayout className="bg-[var(--bg)]">
      <PageContent className="space-y-6">
        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-[var(--surface-container-low)] text-[var(--primary)]">{CHINESE_TEXT.tag}</Badge>
                {profiles.length > 1 && (
                  <select
                    className="bg-[var(--surface-container-low)] text-[var(--text-primary)] border border-[var(--outline-variant)] rounded px-2 py-1 text-sm outline-none cursor-pointer"
                    value={selectedProfile.id}
                    onChange={(e) => router.push(`/owner-risk/overview?profileId=${e.target.value}`)}
                  >
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>{p.ownerName}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold leading-9 text-[var(--text-primary)]">
                  {selectedProfile.ownerName} - {CHINESE_TEXT.title}
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">{CHINESE_TEXT.subtitle}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/owner-risk/reports?profileId=${selectedProfile.id}`}>
                <Button variant="outline">{CHINESE_TEXT.backRadar}</Button>
              </Link>
              <Button onClick={handleAnalyze} disabled={analyzing}>
                {analyzing ? <Spinner className="mr-2 h-4 w-4" /> : null}
                {CHINESE_TEXT.reanalyze}
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            [CHINESE_TEXT.overallRisk, selectedProfile.overallRiskLevel.toUpperCase(), getRiskLabel(selectedProfile.overallRiskLevel)],
            [CHINESE_TEXT.riskScore, selectedProfile.riskScore.toString(), CHINESE_TEXT.scoreMax],
            [CHINESE_TEXT.analysisTime, formattedDate, CHINESE_TEXT.lastTime],
            [CHINESE_TEXT.reportCount, reportsCount.toString(), CHINESE_TEXT.viewDetails],
          ].map(([label, value, trend]) => (
            <article key={label} className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4 shadow-sm">
              <p className="text-sm text-[var(--text-secondary)]">{label}</p>
              <p className={`mt-2 text-3xl font-semibold tabular-nums ${label === CHINESE_TEXT.overallRisk ? getRiskColor(selectedProfile.overallRiskLevel) : 'text-[var(--text-primary)]'}`}>{value}</p>
              {label === CHINESE_TEXT.reportCount ? (
                <Link href={`/owner-risk/reports?profileId=${selectedProfile.id}`}>
                  <p className="mt-2 text-xs text-[var(--primary)] hover:underline cursor-pointer">{trend}</p>
                </Link>
              ) : (
                <p className="mt-2 text-xs text-[var(--text-tertiary)]">{trend}</p>
              )}
            </article>
          ))}
        </section>

        <Tabs className="space-y-4">
          <TabsList>
            <TabsTrigger active={activeTab === 'guarantees'} onClick={() => setActiveTab('guarantees')}>担保分析</TabsTrigger>
            <TabsTrigger active={activeTab === 'mixing'} onClick={() => setActiveTab('mixing')}>混同风险</TabsTrigger>
            <TabsTrigger active={activeTab === 'counterparties'} onClick={() => setActiveTab('counterparties')}>交易对手</TabsTrigger>
            <TabsTrigger active={activeTab === 'receivables'} onClick={() => setActiveTab('receivables')}>应收账款</TabsTrigger>
          </TabsList>

          {activeTab === 'guarantees' && (
            <TabsContent>
              <SectionCard className="border-[var(--outline-variant)] bg-[var(--surface)]" title="担保分析">
                <div className="space-y-4">
                  {cards.filter(c => c.cardType === 'guarantee').map(card => (
                    <div key={card.id} className="rounded-lg border border-[var(--outline-variant)] p-4 bg-[var(--surface)]">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium text-[var(--text-primary)]">{card.title || '担保总览'}</h3>
                          <p className="text-sm text-[var(--text-secondary)]">{card.summary}</p>
                        </div>
                        <Badge className={getRiskColor(card.riskLevel)}>{getRiskLabel(card.riskLevel)}</Badge>
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-[var(--text-tertiary)]">{CHINESE_TEXT.disclaimer}</p>
                </div>
              </SectionCard>
            </TabsContent>
          )}

          {activeTab === 'mixing' && (
            <TabsContent>
              <SectionCard className="border-[var(--outline-variant)] bg-[var(--surface)]" title="混同风险">
                <div className="space-y-4">
                  {cards.filter(c => c.cardType === 'mixing').map(card => (
                    <div key={card.id} className="rounded-lg border border-[var(--outline-variant)] p-4 bg-[var(--surface)]">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium text-[var(--text-primary)]">{card.title || '混同风险'}</h3>
                          <p className="text-sm text-[var(--text-secondary)]">{card.summary}</p>
                        </div>
                        <Badge className={getRiskColor(card.riskLevel)}>{getRiskLabel(card.riskLevel)}</Badge>
                      </div>
                      {!card.isUnlocked && (
                        <div className="mt-4 flex items-center gap-2 rounded-lg bg-[var(--surface-container-low)] p-3">
                          <span className="text-sm text-[var(--text-secondary)]">{CHINESE_TEXT.unlockTitle}</span>
                          <Button size="sm" onClick={() => handleUnlockCard(card.id)} disabled={unlocking === card.id}>
                            {unlocking === card.id ? <Spinner className="mr-2" /> : null}
                            {CHINESE_TEXT.unlockCost(card.unlockCredits)}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  <p className="text-xs text-[var(--text-tertiary)]">{CHINESE_TEXT.disclaimer}</p>
                </div>
              </SectionCard>
            </TabsContent>
          )}

          {activeTab === 'counterparties' && (
            <TabsContent>
              <SectionCard className="border-[var(--outline-variant)] bg-[var(--surface)]" title="交易对手风险">
                <div className="space-y-4">
                  {cards.filter(c => c.cardType === 'counterparty').map(card => (
                    <div key={card.id} className="rounded-lg border border-[var(--outline-variant)] p-4 bg-[var(--surface)]">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium text-[var(--text-primary)]">{card.title || '交易对手风险'}</h3>
                          <p className="text-sm text-[var(--text-secondary)]">{card.summary}</p>
                        </div>
                        <Badge className={getRiskColor(card.riskLevel)}>{getRiskLabel(card.riskLevel)}</Badge>
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-[var(--text-tertiary)]">{CHINESE_TEXT.disclaimer}</p>
                </div>
              </SectionCard>
            </TabsContent>
          )}

          {activeTab === 'receivables' && (
            <TabsContent>
              <SectionCard className="border-[var(--outline-variant)] bg-[var(--surface)]" title="应收账款风险">
                <div className="space-y-4">
                  {cards.filter(c => c.cardType === 'receivable').map(card => (
                    <div key={card.id} className="rounded-lg border border-[var(--outline-variant)] p-4 bg-[var(--surface)]">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium text-[var(--text-primary)]">{card.title || '应收账款账龄'}</h3>
                          <p className="text-sm text-[var(--text-secondary)]">{card.summary}</p>
                        </div>
                        <Badge className={getRiskColor(card.riskLevel)}>{getRiskLabel(card.riskLevel)}</Badge>
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-[var(--text-tertiary)]">{CHINESE_TEXT.disclaimer}</p>
                </div>
              </SectionCard>
            </TabsContent>
          )}
        </Tabs>

        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-medium text-[var(--text-primary)]">{CHINESE_TEXT.advisorReview}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{CHINESE_TEXT.highRiskItems(highRiskCardsCount)}</p>
            </div>
            <Link href="/owner-risk/reports/new">
              <Button>{CHINESE_TEXT.submitReview}</Button>
            </Link>
          </div>
        </section>
      </PageContent>
    </PageLayout>
  );
}
