'use client';

import { apiClient, type OwnerRiskProfileView, type OwnerRiskReportView } from '@tongqian/api-client';
import { Badge, Button, EmptyState, PageContent, PageLayout, SectionCard, Spinner } from '@tongqian/ui';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const CHINESE_TEXT = {
  tag: 'AI 风险分析',
  title: '企业主风险报告',
  subtitle: '查看历史生成的风险报告，支持 PDF 导出和高风险事项顾问复核。',
  backRadar: '返回雷达',
  reportList: '报告列表',
  typeLabel: '类型',
  createdAtLabel: '生成时间',
  viewDetails: '查看详情',
  exportPdf: '导出 PDF',
  noReports: '暂无报告',
  noReportsDesc: '开始分析后将生成报告',
  disclaimer: '本结果仅为 AI 初筛和经营风险提示，不构成法律、税务、财务或投资建议。高风险事项建议提交专业顾问、律师或税务顾问复核。',
  loading: '报告加载中...',
  error: '加载报告失败，请重试',
  empty: '暂无档案，请先在档案库创建企业主档案。',
  toProfiles: '前往档案库',
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

const getTierLabel = (tier: number) => {
  const labels: Record<number, string> = { 1: 'Tier 1', 2: 'Tier 2', 3: 'Tier 3', 4: 'Tier 4' };
  return labels[tier] || 'Tier 3';
};

export default function OwnerRiskReportsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const profileIdFromUrl = searchParams.get('profileId');

  const [profiles, setProfiles] = useState<OwnerRiskProfileView[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<OwnerRiskProfileView | null>(null);
  const [reports, setReports] = useState<OwnerRiskReportView[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
        const rList = await apiClient.ownerRisk.listReports(currentProfile.id);
        setReports(rList);
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
                    onChange={(e) => router.push(`/owner-risk/reports?profileId=${e.target.value}`)}
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
            <Link href={`/owner-risk/overview?profileId=${selectedProfile.id}`}>
              <Button variant="outline">{CHINESE_TEXT.backRadar}</Button>
            </Link>
          </div>
        </section>

        <SectionCard className="border-[var(--outline-variant)] bg-[var(--surface)]" title={CHINESE_TEXT.reportList}>
          {reports.length === 0 ? (
            <EmptyState title={CHINESE_TEXT.noReports} description={CHINESE_TEXT.noReportsDesc} />
          ) : (
            <div className="space-y-4">
              {reports.map((report) => {
                const reportDate = new Date(report.createdAt).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                });
                return (
                  <Link key={report.id} href={`/owner-risk/report/${report.id}`}>
                    <div className="rounded-lg border border-[var(--outline-variant)] p-4 transition-colors hover:bg-[var(--surface-container-low)]">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-[var(--text-primary)]">{report.title}</h3>
                            <Badge className={getRiskColor(report.riskLevel)}>{getRiskLabel(report.riskLevel)}</Badge>
                            <Badge className="bg-[var(--surface-container-low)] text-[var(--text-secondary)]">
                              {getTierLabel(report.tierBadge)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                            <span>{CHINESE_TEXT.typeLabel}: {report.reportType}</span>
                            <span>{CHINESE_TEXT.createdAtLabel}: {reportDate}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">{CHINESE_TEXT.viewDetails}</Button>
                          <Button size="sm" variant="outline">{CHINESE_TEXT.exportPdf}</Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </SectionCard>

        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
          <p className="text-xs text-[var(--text-tertiary)]">{CHINESE_TEXT.disclaimer}</p>
        </section>
      </PageContent>
    </PageLayout>
  );
}
