'use client';

import { apiClient, type OwnerRiskProfileView } from '@tongqian/api-client';
import { Badge, Button, EmptyState, PageContent, PageLayout, SectionCard, Spinner, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@tongqian/ui';
import { useEffect, useState } from 'react';

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

export default function AdminOwnerRiskPage() {
  const [profiles, setProfiles] = useState<OwnerRiskProfileView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function fetchProfiles() {
    setLoading(true);
    setError(false);
    try {
      setProfiles(await apiClient.ownerRisk.listProfiles(1, 100));
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
      <PageContent className="space-y-6">
        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm text-[var(--text-tertiary)]">平台运营 · 企业主风险雷达管理</p>
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">企业主风险雷达管理</h1>
            <p className="max-w-3xl text-sm text-[var(--text-secondary)]">
              管理所有企业主风险档案。风险拦截、人工复核、数据导出等运营操作即将上线。
            </p>
          </div>
        </section>

        <SectionCard title="风险档案列表">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Spinner /></div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <p className="text-sm text-red-500">加载失败，请重试</p>
              <Button variant="outline" onClick={() => void fetchProfiles()}>重试</Button>
            </div>
          ) : profiles.length === 0 ? (
            <EmptyState title="暂无企业主风险档案" description="平台暂无任何企业主创建风险档案。" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>企业主</TableHead>
                  <TableHead>统一信用代码</TableHead>
                  <TableHead>风险等级</TableHead>
                  <TableHead>风险评分</TableHead>
                  <TableHead className="w-32">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <p className="font-medium text-[var(--text-primary)]">{profile.ownerName}</p>
                    </TableCell>
                    <TableCell className="text-[var(--text-secondary)]">{profile.creditCode || '-'}</TableCell>
                    <TableCell>
                      <Badge className={getRiskColor(profile.overallRiskLevel)}>{getRiskLabel(profile.overallRiskLevel)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-[var(--outline-variant)]">
                          <div
                            className={`h-full rounded-full ${profile.riskScore > 75 ? 'bg-red-500' : profile.riskScore > 50 ? 'bg-yellow-500' : 'bg-success-500'}`}
                            style={{ width: `${profile.riskScore}%` }}
                          />
                        </div>
                        <span className="text-sm text-[var(--text-secondary)]">{profile.riskScore}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" disabled title="运营拦截/复核功能即将上线">即将上线</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </SectionCard>

        <SectionCard title="平台规则说明">
          <div className="space-y-4 text-sm text-[var(--text-secondary)]">
            <p>
              <strong className="text-[var(--text-primary)]">风险拦截规则：</strong>
              当企业主风险等级为「高风险」或「极高风险」时，系统将自动拦截其相关操作（如投标、合同签署等），并提示需要人工复核。
            </p>
            <p>
              <strong className="text-[var(--text-primary)]">人工复核流程：</strong>
              平台运营人员可在后台查看风险详情，确认是否误判。如确认为误判，可解除拦截；如确认风险存在，可维持拦截状态并通知相关企业。
            </p>
            <p>
              <strong className="text-[var(--text-primary)]">数据导出：</strong>
              支持导出所有风险档案数据（CSV/Excel 格式），用于线下分析或监管报送。
            </p>
          </div>
        </SectionCard>
      </PageContent>
    </PageLayout>
  );
}
