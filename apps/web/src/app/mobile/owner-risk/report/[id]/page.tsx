'use client';

import { apiClient, type OwnerRiskProfileView, type OwnerRiskReportView } from '@tongqian/api-client';
import { Badge, Button, EmptyState, PageContent, PageLayout, Spinner } from '@tongqian/ui';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const getRiskColor = (level: string) => {
  const colors: Record<string, string> = { low: 'text-success-700 bg-success-50', medium: 'text-yellow-700 bg-yellow-50', high: 'text-orange-700 bg-orange-50', critical: 'text-red-700 bg-red-50' };
  return colors[level] || 'text-yellow-700 bg-yellow-50';
};

const getRiskLabel = (level: string) => {
  const labels: Record<string, string> = { low: '低', medium: '中', high: '高', critical: '极高' };
  return labels[level] || '中';
};

export default function MobileOwnerRiskReportPage({ params }: { params: { id: string } }) {
  const profileId = params.id;
  const [profile, setProfile] = useState<OwnerRiskProfileView | null>(null);
  const [report, setReport] = useState<OwnerRiskReportView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function fetchReport() {
    setLoading(true);
    setError(false);
    try {
      const [profileData, reports] = await Promise.all([
        apiClient.ownerRisk.getProfile(profileId),
        apiClient.ownerRisk.listReports(profileId),
      ]);
      setProfile(profileData);
      setReport(reports[0] ?? null);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchReport();
  }, [profileId]);

  return (
    <PageLayout className="bg-[var(--bg)]">
      <PageContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12"><Spinner /></div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <p className="text-sm text-red-500">加载失败，请重试</p>
            <Button onClick={() => void fetchReport()}>重试</Button>
          </div>
        ) : !report ? (
          <>
            <EmptyState title="尚无风险报告" description={profile ? `「${profile.ownerName}」尚未生成 AI 风险报告，请先在风险雷达发起分析。` : '该档案尚未生成 AI 风险报告。'} />
            <Link href="/mobile/owner-risk"><Button variant="outline" className="w-full">返回列表</Button></Link>
          </>
        ) : (
          <>
            <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-[var(--surface-container-low)] text-[var(--primary)]">AI 风险分析</Badge>
                <Badge className={getRiskColor(report.riskLevel)}>{getRiskLabel(report.riskLevel)}风险</Badge>
              </div>
              <h1 className="mt-2 text-xl font-semibold text-[var(--text-primary)]">{report.title}</h1>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">AI 信心度: {report.confidence}</p>
            </section>

            <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
              <h2 className="font-medium text-[var(--text-primary)]">执行摘要</h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{report.executiveSummary}</p>
            </section>

            <section className="space-y-3">
              {(report.sections ?? []).map((section) => (
                <div key={section.sectionKey ?? section.title} className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-[var(--text-primary)]">{section.title}</h3>
                    {section.riskLevel ? <Badge className={getRiskColor(section.riskLevel)}>{getRiskLabel(section.riskLevel)}</Badge> : null}
                  </div>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">{section.content}</p>
                </div>
              ))}
            </section>

            <section className="space-y-2">
              <h3 className="font-medium text-[var(--text-primary)]">引导按钮</h3>
              <div className="flex flex-wrap gap-2">
                <Button size="sm">自己执行</Button>
                <Button size="sm">申请顾问复核</Button>
              </div>
            </section>

            <section className="rounded-lg border border-orange-200 bg-orange-50 p-3">
              <p className="text-xs text-orange-800">{report.disclaimer || '免责声明：本结果仅为 AI 初筛和经营风险提示，不构成法律、税务、财务或投资建议。高风险事项建议提交专业顾问复核。'}</p>
            </section>

            <Link href="/mobile/owner-risk"><Button variant="outline" className="w-full">返回列表</Button></Link>
          </>
        )}
      </PageContent>
    </PageLayout>
  );
}
