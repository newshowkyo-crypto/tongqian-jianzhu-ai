'use client';

import { apiClient, type OwnerRiskCardView } from '@tongqian/api-client';
import { Badge, Button, EmptyState, PageContent, PageLayout, SectionCard, Spinner } from '@tongqian/ui';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type Guarantee = {
  id: string;
  guaranteedCompany: string;
  guaranteeAmount: number;
  guaranteeType: string;
  status: string;
  riskLevel: string;
  endDate?: string;
};

export default function OwnerRiskGuaranteesPage() {
  const searchParams = useSearchParams();
  const profileId = searchParams.get('profileId') || '1';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileName, setProfileName] = useState('企业主');
  const [card, setCard] = useState<OwnerRiskCardView | null>(null);
  const [records, setRecords] = useState<Guarantee[]>([]);
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
      const matchedCard = cards.find((c) => c.cardType === 'guarantee');
      setCard(matchedCard || null);

      if (matchedCard && matchedCard.isUnlocked) {
        const recs = await apiClient.ownerRisk.listGuaranteeRecords(profileId);
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

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 }).format(amount);
  };

  const getRiskColor = (level: string) => {
    const colors: Record<string, string> = { low: 'text-success-700 bg-success-50', medium: 'text-yellow-700 bg-yellow-50', high: 'text-orange-700 bg-orange-50', critical: 'text-red-700 bg-red-50' };
    return colors[level] || colors.medium;
  };

  const getRiskLabel = (level: string) => {
    const labels: Record<string, string> = { low: '低风险', medium: '中风险', high: '高风险', critical: '极高风险' };
    return labels[level] || '中风险';
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
                  {profileName} - 担保分析
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">分析企业主的担保情况，识别连带风险。</p>
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
            <h3 className="text-lg font-medium text-yellow-800">🔒 担保分析板块尚未解锁</h3>
            <p className="max-w-md mx-auto text-sm text-yellow-700">
              解锁该板块将扣减 <strong>{card.unlockCredits}</strong> 个AI分析点数，解锁后可查看企业主对关联企业、第三方的所有在保与解除担保历史明细。
            </p>
            <Button disabled={actionLoading} onClick={handleUnlock}>
              {actionLoading ? <Spinner className="mr-1 h-3 w-3" /> : null}
              扣减 {card.unlockCredits} 点解锁
            </Button>
          </section>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              {[
                ['担保总额', '¥5000万', '在保余额 ¥3500万'],
                ['在保余额', '¥3500万', '持续监控中'],
                ['涉及企业', `${records.length}家`, `${records.filter(r => r.riskLevel === 'low').length}家低风险`],
                ['高风险担保', `${records.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical').length}笔`, '重点关注'],
              ].map(([label, value, trend]) => (
                <article key={label} className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4 shadow-sm">
                  <p className="text-sm text-[var(--text-secondary)]">{label}</p>
                  <p className="mt-2 text-3xl font-semibold tabular-nums text-[var(--text-primary)]">{value}</p>
                  <p className="mt-2 text-xs text-[var(--text-tertiary)]">{trend}</p>
                </article>
              ))}
            </section>

            <SectionCard className="border-[var(--outline-variant)] bg-[var(--surface)]" title="担保记录">
              {records.length === 0 ? (
                <EmptyState title="暂无担保记录" description="暂无企业担保记录" />
              ) : (
                <div className="space-y-4">
                  {records.map(guarantee => (
                    <div key={guarantee.id} className="rounded-lg border border-[var(--outline-variant)] p-4 bg-[var(--surface-container-low)]">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium text-[var(--text-primary)]">{guarantee.guaranteedCompany}</h3>
                            <Badge className={getRiskColor(guarantee.riskLevel)}>{getRiskLabel(guarantee.riskLevel)}</Badge>
                            <Badge className="bg-[var(--surface-container-low)] text-[var(--text-secondary)]">{guarantee.status === 'active' ? '在保' : '已解除'}</Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-secondary)]">
                            <span>担保金额: {formatAmount(guarantee.guaranteeAmount)}</span>
                            <span>担保类型: {guarantee.guaranteeType}</span>
                            {guarantee.endDate && <span>到期日: {guarantee.endDate}</span>}
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => alert('已记录查阅动作')}>查看明细</Button>
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
