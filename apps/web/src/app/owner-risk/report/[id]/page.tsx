'use client';

import {
  apiClient,
  type OwnerRiskReportView,
} from '@tongqian/api-client';
import { Badge, Button, PageContent, PageLayout, SectionCard, Spinner } from '@tongqian/ui';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

const getRiskColor = (level: string) => {
  const colors: Record<string, string> = {
    low: 'text-success-700 bg-success-50',
    medium: 'text-yellow-700 bg-yellow-50',
    high: 'text-orange-700 bg-orange-50',
    critical: 'text-red-700 bg-red-50',
  };
  return colors[level] || 'text-gray-700 bg-gray-50';
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

export default function OwnerRiskReportDetailPage({ params }: { params: { id: string } }) {
  const [report, setReport] = useState<OwnerRiskReportView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function loadReport() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.ownerRisk.getReport(params.id);
      setReport(data);
    } catch (err: unknown) {
      console.error(err);
      setError('报告加载失败，请重试');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, [params.id]);

  async function handleCreateReview(reviewType: 'manual_review' | 'expert_consulting') {
    if (!report) return;
    setActionLoading(reviewType);
    setActionSuccess(null);
    setActionError(null);
    try {
      await apiClient.ownerRisk.createReviewRequest({
        profileId: report.profileId,
        reviewType,
      });
      setActionSuccess(reviewType === 'manual_review' ? '人工复核申请已提交成功！' : '专家咨询申请已提交成功！');
    } catch (err: unknown) {
      console.error(err);
      setActionError('申请提交失败，请重试');
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <PageLayout className="bg-[var(--bg)]">
        <PageContent className="flex items-center justify-center py-24">
          <Spinner />
        </PageContent>
      </PageLayout>
    );
  }

  if (error || !report) {
    return (
      <PageLayout className="bg-[var(--bg)]">
        <PageContent className="flex flex-col items-center justify-center py-24 space-y-4">
          <p className="text-red-500">{error || '报告未找到'}</p>
          <div className="flex gap-2">
            <Button onClick={loadReport}>重新加载</Button>
            <Link href="/owner-risk/reports">
              <Button variant="outline">返回列表</Button>
            </Link>
          </div>
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
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-[var(--surface-container-low)] text-[var(--primary)]">AI 风险分析</Badge>
                <Badge className={getRiskColor(report.riskLevel)}>{getRiskLabel(report.riskLevel)}</Badge>
                <Badge className="bg-[var(--surface-container-low)] text-[var(--text-secondary)]">{getTierLabel(report.tierBadge)}</Badge>
                <Badge className="bg-[var(--surface-container-low)] text-[var(--text-secondary)]">AI 信心度: {report.confidence}</Badge>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold leading-9 text-[var(--text-primary)]">{report.title}</h1>
                <p className="max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
                  生成时间: {new Date(report.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/owner-risk/reports">
                <Button variant="outline">返回列表</Button>
              </Link>
              <Button
                variant="outline"
                disabled={actionLoading === 'manual_review'}
                onClick={() => handleCreateReview('manual_review')}
              >
                {actionLoading === 'manual_review' ? <Spinner className="mr-1 h-3 w-3" /> : null}
                提交顾问复核
              </Button>
              <Button
                disabled={actionLoading === 'expert_consulting'}
                onClick={() => handleCreateReview('expert_consulting')}
              >
                {actionLoading === 'expert_consulting' ? <Spinner className="mr-1 h-3 w-3" /> : null}
                专家小时咨询
              </Button>
            </div>
          </div>
          {actionSuccess && (
            <div className="mt-4 rounded-lg bg-success-50 border border-success-200 p-3 text-sm text-success-700">
              {actionSuccess}
            </div>
          )}
          {actionError && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {actionError}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-6">
          <h2 className="text-lg font-medium text-[var(--text-primary)]">执行摘要</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">{report.executiveSummary}</p>
        </section>

        {report.sections && report.sections.length > 0 && (
          <section className="grid gap-4 md:grid-cols-2">
            {report.sections.map((section) => (
              <SectionCard
                key={section.sectionKey}
                className="border-[var(--outline-variant)] bg-[var(--surface)]"
                title={section.title}
              >
                <div className="space-y-3">
                  <Badge className={getRiskColor(section.riskLevel || 'medium')}>
                    {getRiskLabel(section.riskLevel || 'medium')}
                  </Badge>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{section.content}</p>
                  {section.suggestedActions && section.suggestedActions.length > 0 && (
                    <div className="border-t border-[var(--outline-variant)] pt-2 mt-2">
                      <p className="text-xs font-semibold text-[var(--text-primary)]">建议动作:</p>
                      <ul className="mt-1 space-y-1">
                        {section.suggestedActions.map((act, i) => (
                          <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-1">
                            <span>•</span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </SectionCard>
            ))}
          </section>
        )}

        <section className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <p className="text-xs text-orange-800 leading-relaxed">
            <strong>免责声明（分值消耗: {report.creditsCost} 点）：</strong>
            {report.disclaimer || '本报告由 AI 自动生成，可能存在偏差。关键决策请务必咨询专业人士。'}
          </p>
        </section>

        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
          <h3 className="font-medium text-[var(--text-primary)]">引导动作（按角色定制）</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => alert('自己执行：已记录动作轨迹')}>自己执行</Button>
            <Button size="sm" variant="outline" onClick={() => handleCreateReview('manual_review')}>申请智能管家</Button>
            <Button size="sm" variant="outline" onClick={() => handleCreateReview('expert_consulting')}>申请同乾方略</Button>
            <Button size="sm" variant="outline" onClick={() => handleCreateReview('manual_review')}>人工复核</Button>
            <Button size="sm" variant="outline" onClick={() => handleCreateReview('expert_consulting')}>专家咨询</Button>
          </div>
        </section>
      </PageContent>
    </PageLayout>
  );
}
