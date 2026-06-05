'use client';

import { apiClient, type OwnerRiskCardView } from '@tongqian/api-client';
import { Badge, Button, EmptyState, PageContent, PageLayout, SectionCard, Spinner } from '@tongqian/ui';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type MixingRecord = {
  id: string;
  recordType: string;
  summary: string;
  riskLevel: string;
  occurrences: number;
  createdAt: string;
};

export default function OwnerRiskMixingPage() {
  const searchParams = useSearchParams();
  const profileId = searchParams.get('profileId') || '1';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileName, setProfileName] = useState('企业主');
  const [card, setCard] = useState<OwnerRiskCardView | null>(null);
  const [records, setRecords] = useState<MixingRecord[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [cards, profile] = await Promise.all([
        apiClient.ownerRisk.listCards(profileId),
        apiClient.ownerRisk.getProfile(profileId),
      ]);
      setProfileName(profile.ownerName);
      const matchedCard = cards.find((c) => c.cardType === 'mixing');
      setCard(matchedCard || null);

      if (matchedCard && matchedCard.isUnlocked) {
        const recs = await apiClient.ownerRisk.listMixingRecords(profileId);
        setRecords(recs);
      }
    } catch (err: unknown) {
      console.error(err);
      setError('数据加载失败，请重试');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [profileId]);

  async function handleUnlock() {
    if (!card) return;
    setActionLoading(true);
    try {
      await apiClient.ownerRisk.unlockCard(card.id);
      await loadData();
    } catch (err: unknown) {
      console.error(err);
      alert('解锁失败，请确保您的租户点数充足。');
    } finally {
      setActionLoading(false);
    }
  }

  const getRiskColor = (level: string) => {
    const colors: Record<string, string> = { low: 'text-success-700 bg-success-50', medium: 'text-yellow-700 bg-yellow-50', high: 'text-orange-700 bg-orange-50', critical: 'text-red-700 bg-red-50' };
    return colors[level] || colors.medium;
  };

  const getRiskLabel = (level: string) => {
    const labels: Record<string, string> = { low: '低风险', medium: '中风险', high: '高风险', critical: '极高风险' };
    return labels[level] || '中风险';
  };

  const getMixingTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      personal_to_corporate: '个人账户往来公户',
      expense_mixing: '个人家庭费用报销',
      asset_mixing: '资产所有权混同',
      debt_mixing: '无限连带债务混同',
    };
    return labels[type] || '公私财务混同';
  };

  if (loading) {
    return (
      <PageLayout className="bg-[var(--bg)]">
        <PageContent className="flex items-center justify-center py-24">
          <Spinner />
        </PageContent>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="bg-[var(--bg)]">
      <PageContent className="space-y-6">
        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <Badge className="bg-[var(--surface-container-low)] text-[var(--primary)]">AI 风险分析</Badge>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold leading-9 text-[var(--text-primary)]">
                  {profileName} - 混同风险分析
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">识别企业与个人之间的混同风险，包括资金、资产、债务和股权混同。</p>
              </div>
            </div>
            <Link href={`/owner-risk/overview?profileId=${profileId}`}>
              <Button variant="outline">返回雷达</Button>
            </Link>
          </div>
        </section>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {card && !card.isUnlocked ? (
          <section className="rounded-lg border border-yellow-200 bg-yellow-50 p-8 text-center space-y-4">
            <h3 className="text-lg font-medium text-yellow-800">🔒 混同风险分析板块尚未解锁</h3>
            <p className="max-w-md mx-auto text-sm text-yellow-700">
              解锁该板块将扣减 <strong>{card.unlockCredits}</strong> 个AI分析点数，解锁后可查看企业与个人财产及往来穿透审计明细，避免企业连带人格混同导致的债务危机。
            </p>
            <Button disabled={actionLoading} onClick={handleUnlock}>
              {actionLoading ? <Spinner className="mr-1 h-3 w-3" /> : null}
              扣减 {card.unlockCredits} 点解锁
            </Button>
          </section>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              {[
                ['混同涉警事项', `${records.length}项`, '需要重点审阅'],
                ['最高风险等级', records.some(r => r.riskLevel === 'high') ? '高风险' : '中风险', '建议开展复核'],
                ['建议顾问复核', '是', '防止法人无限连带'],
              ].map(([label, value, trend]) => (
                <article key={label} className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4 shadow-sm">
                  <p className="text-sm text-[var(--text-secondary)]">{label}</p>
                  <p className="mt-2 text-3xl font-semibold tabular-nums text-[var(--text-primary)]">{value}</p>
                  <p className="mt-2 text-xs text-[var(--text-tertiary)]">{trend}</p>
                </article>
              ))}
            </section>

            <SectionCard className="border-[var(--outline-variant)] bg-[var(--surface)]" title="混同记录">
              {records.length === 0 ? (
                <EmptyState title="暂无混同记录" description="未发现明显的企业与个人混同风险" />
              ) : (
                <div className="space-y-4">
                  {records.map(record => (
                    <div key={record.id} className="rounded-lg border border-[var(--outline-variant)] p-4 bg-[var(--surface-container-low)]">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium text-[var(--text-primary)]">{getMixingTypeLabel(record.recordType)}</h3>
                            <Badge className={getRiskColor(record.riskLevel)}>{getRiskLabel(record.riskLevel)}</Badge>
                            <Badge className="bg-[var(--surface-container-low)] text-[var(--text-secondary)]">发生频次: {record.occurrences} 次</Badge>
                          </div>
                          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{record.summary}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => alert('已记录查阅动作')}>查看凭证</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </>
        )}

        <section className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <p className="text-xs text-orange-800">本结果仅为 AI 初筛和经营风险提示，不构成法律、税务、财务或投资建议。高风险事项建议提交专业顾问、律师或税务顾问复核。</p>
        </section>
      </PageContent>
    </PageLayout>
  );
}
