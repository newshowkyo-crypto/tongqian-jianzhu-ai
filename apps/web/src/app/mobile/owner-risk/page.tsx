'use client';

import { apiClient, type OwnerRiskProfileView } from '@tongqian/api-client';
import { Badge, EmptyState, PageContent, PageLayout, Spinner } from '@tongqian/ui';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const getRiskColor = (level: string) => {
  const colors: Record<string, string> = { low: 'text-success-700 bg-success-50', medium: 'text-yellow-700 bg-yellow-50', high: 'text-orange-700 bg-orange-50', critical: 'text-red-700 bg-red-50' };
  return colors[level] || 'text-yellow-700 bg-yellow-50';
};

const getRiskLabel = (level: string) => {
  const labels: Record<string, string> = { low: '低风险', medium: '中风险', high: '高风险', critical: '极高风险' };
  return labels[level] || '中风险';
};

export default function MobileOwnerRiskPage() {
  const [profiles, setProfiles] = useState<OwnerRiskProfileView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function fetchProfiles() {
    setLoading(true);
    setError(false);
    try {
      setProfiles(await apiClient.ownerRisk.listProfiles());
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchProfiles();
  }, []);

  return (
    <PageLayout className="bg-[var(--bg)]">
      <PageContent className="space-y-4">
        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
          <Badge className="bg-[var(--surface-container-low)] text-[var(--primary)]">AI 风险分析</Badge>
          <h1 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">企业主风险雷达</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">AI 初筛企业主风险</p>
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-12"><Spinner /></div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <p className="text-sm text-red-500">加载失败，请重试</p>
            <button onClick={() => void fetchProfiles()} className="rounded-md border border-[var(--outline-variant)] px-4 py-2 text-sm text-[var(--text-primary)]">重试</button>
          </div>
        ) : profiles.length === 0 ? (
          <EmptyState title="暂无企业主档案" description="请先在企业主风险雷达创建档案以启动 AI 风险分析" />
        ) : (
          <section className="space-y-3">
            {profiles.map((profile) => (
              <Link key={profile.id} href={`/mobile/owner-risk/report/${profile.id}`}>
                <div className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium text-[var(--text-primary)]">{profile.ownerName}</h3>
                      <p className="text-sm text-[var(--text-secondary)]">风险评分: {profile.riskScore}</p>
                    </div>
                    <Badge className={getRiskColor(profile.overallRiskLevel)}>{getRiskLabel(profile.overallRiskLevel)}</Badge>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        )}

        <section className="rounded-lg border border-orange-200 bg-orange-50 p-3">
          <p className="text-xs text-orange-800">本结果仅为 AI 初筛和经营风险提示，不构成法律、税务、财务或投资建议。</p>
        </section>
      </PageContent>
    </PageLayout>
  );
}
