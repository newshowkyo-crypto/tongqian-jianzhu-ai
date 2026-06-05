'use client';

import { apiClient, type MarketSignalView } from '@tongqian/api-client';
import { Badge, Button, EmptyState, PageContent, PageLayout, SectionCard, Spinner, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@tongqian/ui';
import { useEffect, useState } from 'react';

const getSignalTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    project_hot: '热门项目',
    party_risk: '政企风险',
    competitor_active: '竞争对手',
    qualification_dynamic: '资质动态',
    policy_window: '政策窗口',
    judicial_risk: '司法风险',
  };
  return labels[type] || type;
};

const getRiskColor = (level: string) => {
  const colors: Record<string, string> = {
    low: 'text-success-700 bg-success-50',
    medium: 'text-yellow-700 bg-yellow-50',
    high: 'text-orange-700 bg-orange-50',
    critical: 'text-red-700 bg-red-50',
  };
  return colors[level] || colors.medium;
};

const getRiskLabel = (level: string) => {
  const labels: Record<string, string> = { low: '低风险', medium: '中风险', high: '高风险', critical: '极高风险' };
  return labels[level] || level;
};

const getOpportunityLabel = (level: string) => {
  const labels: Record<string, string> = { low: '低机会', medium: '中机会', high: '高机会' };
  return labels[level] || level;
};

export default function AdminMarketSituationPage() {
  const [signals, setSignals] = useState<MarketSignalView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function fetchSignals() {
    setLoading(true);
    setError(false);
    try {
      const result = await apiClient.marketSituation.listSignals({ page: 1, pageSize: 100 });
      setSignals(result.list);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchSignals();
  }, []);

  return (
    <PageLayout className="bg-[var(--bg)]">
      <PageContent className="space-y-6">
        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm text-[var(--text-tertiary)]">平台运营 · AI 市场态势雷达管理</p>
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">AI 市场态势雷达管理</h1>
            <p className="max-w-3xl text-sm text-[var(--text-secondary)]">
              管理所有市场信号。信号审核、发布/隐藏、点数配置等运营操作即将上线。
            </p>
          </div>
        </section>

        <SectionCard title="市场信号列表">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Spinner /></div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <p className="text-sm text-red-500">加载失败，请重试</p>
              <Button variant="outline" onClick={() => void fetchSignals()}>重试</Button>
            </div>
          ) : signals.length === 0 ? (
            <EmptyState title="暂无市场信号" description="平台暂无已录入的市场信号。" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>信号标题</TableHead>
                  <TableHead>信号类型</TableHead>
                  <TableHead>区域</TableHead>
                  <TableHead>风险等级</TableHead>
                  <TableHead>机会等级</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>解锁点数</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="w-32">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signals.map((signal) => (
                  <TableRow key={signal.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-[var(--text-primary)]">{signal.title}</p>
                        <p className="text-xs text-[var(--text-tertiary)] line-clamp-2">{signal.summary}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-[var(--surface-container-low)] text-[var(--text-primary)]">{getSignalTypeLabel(signal.signalType)}</Badge>
                    </TableCell>
                    <TableCell className="text-[var(--text-secondary)]">{signal.region}</TableCell>
                    <TableCell>
                      <Badge className={getRiskColor(signal.riskLevel)}>{getRiskLabel(signal.riskLevel)}</Badge>
                    </TableCell>
                    <TableCell className="text-[var(--text-secondary)]">{getOpportunityLabel(signal.opportunityLevel)}</TableCell>
                    <TableCell className="text-[var(--text-secondary)]">{signal.tierBadge}</TableCell>
                    <TableCell className="text-[var(--text-secondary)]">{signal.unlockCredits}点</TableCell>
                    <TableCell>
                      <Badge className={signal.isPublished ? 'text-success-700 bg-success-50' : 'text-gray-700 bg-gray-50'}>
                        {signal.isPublished ? '已发布' : '草稿'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" disabled title="审核/发布运营功能即将上线">即将上线</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </SectionCard>
      </PageContent>
    </PageLayout>
  );
}
