'use client';

import { apiClient, type OwnerRiskProfileView } from '@tongqian/api-client';
import { Badge, Button, EmptyState, Input, PageContent, PageLayout, SectionCard, Spinner } from '@tongqian/ui';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const CHINESE_TEXT = {
  title: '企业主风险雷达 - 档案库',
  subtitle: '管理企业主档案，启动担保、混同、交易对手和应收账款 AI 风险分析。',
  tag: 'AI 档案管理',
  createProfile: '创建新档案',
  ownerNameLabel: '企业主姓名',
  ownerNamePlaceholder: '请输入企业主姓名（如：张明）',
  creditCodeLabel: '统一社会信用代码',
  creditCodePlaceholder: '请输入信用代码（可选，如：91110000******82X）',
  submit: '立即创建',
  tableHeaderName: '企业主',
  tableHeaderCode: '社会信用代码',
  tableHeaderRisk: '综合风险',
  tableHeaderScore: '风险评分',
  tableHeaderAction: '操作',
  viewRadar: '查看雷达',
  viewReport: '查看报告',
  noProfiles: '暂无企业主档案',
  noProfilesDesc: '请先创建一个企业主档案以启动 AI 风险分析',
  loading: '加载中...',
  error: '加载失败，请重试',
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

export default function OwnerRiskPage() {
  const [profiles, setProfiles] = useState<OwnerRiskProfileView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form states
  const [ownerName, setOwnerName] = useState('');
  const [creditCode, setCreditCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function fetchProfiles() {
    setLoading(true);
    setError(false);
    try {
      const data = await apiClient.ownerRisk.listProfiles();
      setProfiles(data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfiles();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!ownerName.trim()) return;
    setSubmitting(true);
    try {
      await apiClient.ownerRisk.createProfile({
        ownerName: ownerName.trim(),
        creditCode: creditCode.trim() || undefined,
      });
      setOwnerName('');
      setCreditCode('');
      setShowCreateForm(false);
      await fetchProfiles();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

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
            {!showCreateForm && profiles.length > 0 && (
              <Button onClick={() => setShowCreateForm(true)}>{CHINESE_TEXT.createProfile}</Button>
            )}
          </div>
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <p className="text-red-500">{CHINESE_TEXT.error}</p>
            <Button onClick={fetchProfiles}>重试</Button>
          </div>
        ) : showCreateForm || profiles.length === 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            <SectionCard title={CHINESE_TEXT.createProfile} className="border-[var(--outline-variant)] bg-[var(--surface)]">
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-primary)]">{CHINESE_TEXT.ownerNameLabel}</label>
                  <Input
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder={CHINESE_TEXT.ownerNamePlaceholder}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-primary)]">{CHINESE_TEXT.creditCodeLabel}</label>
                  <Input
                    value={creditCode}
                    onChange={(e) => setCreditCode(e.target.value)}
                    placeholder={CHINESE_TEXT.creditCodePlaceholder}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? <Spinner className="mr-2" /> : null}
                    {CHINESE_TEXT.submit}
                  </Button>
                  {profiles.length > 0 && (
                    <Button variant="outline" type="button" onClick={() => setShowCreateForm(false)}>
                      取消
                    </Button>
                  )}
                </div>
              </form>
            </SectionCard>
            {profiles.length === 0 && (
              <div className="flex flex-col justify-center">
                <EmptyState title={CHINESE_TEXT.noProfiles} description={CHINESE_TEXT.noProfilesDesc} />
              </div>
            )}
          </div>
        ) : (
          <SectionCard title="企业主档案列表" className="border-[var(--outline-variant)] bg-[var(--surface)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--outline-variant)] text-sm text-[var(--text-secondary)]">
                    <th className="py-3 px-4 font-medium">{CHINESE_TEXT.tableHeaderName}</th>
                    <th className="py-3 px-4 font-medium">{CHINESE_TEXT.tableHeaderCode}</th>
                    <th className="py-3 px-4 font-medium">{CHINESE_TEXT.tableHeaderRisk}</th>
                    <th className="py-3 px-4 font-medium text-right">{CHINESE_TEXT.tableHeaderScore}</th>
                    <th className="py-3 px-4 font-medium text-right">{CHINESE_TEXT.tableHeaderAction}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--outline-variant)] text-sm">
                  {profiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-[var(--surface-container-low)] transition-colors">
                      <td className="py-4 px-4 font-medium text-[var(--text-primary)]">{profile.ownerName}</td>
                      <td className="py-4 px-4 text-[var(--text-secondary)]">{profile.creditCode || '-'}</td>
                      <td className="py-4 px-4">
                        <Badge className={getRiskColor(profile.overallRiskLevel)}>
                          {getRiskLabel(profile.overallRiskLevel)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-right font-semibold tabular-nums text-[var(--text-primary)]">
                        {profile.riskScore}
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <Link href={`/owner-risk/overview?profileId=${profile.id}`}>
                          <Button size="sm" variant="outline">{CHINESE_TEXT.viewRadar}</Button>
                        </Link>
                        <Link href={`/owner-risk/reports?profileId=${profile.id}`}>
                          <Button size="sm" variant="outline">{CHINESE_TEXT.viewReport}</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}
      </PageContent>
    </PageLayout>
  );
}
