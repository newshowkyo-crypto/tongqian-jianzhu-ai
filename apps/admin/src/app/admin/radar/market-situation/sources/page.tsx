'use client';

import { Badge, Button, PageContent, PageLayout } from '@tongqian/ui';

const mockSources = [
  { id: '1', name: '政府采购网', type: 'government', url: 'https://www.ccgp.gov.cn', signalsCount: 120, isActive: true, lastSyncAt: '2026-06-01 08:00' },
  { id: '2', name: '招标投标公共服务平台', type: 'tender', url: 'https://www.ctbpsp.com', signalsCount: 85, isActive: true, lastSyncAt: '2026-06-01 07:30' },
  { id: '3', name: '企业信用信息公示系统', type: 'credit', url: 'https://www.gsxt.gov.cn', signalsCount: 45, isActive: true, lastSyncAt: '2026-06-01 06:00' },
  { id: '4', name: '中国裁判文书网', type: 'judicial', url: 'https://wenshu.court.gov.cn', signalsCount: 32, isActive: true, lastSyncAt: '2026-06-01 05:00' },
  { id: '5', name: '国家企业信用信息公示系统', type: 'business', url: 'https://www.qichacha.com', signalsCount: 28, isActive: false, lastSyncAt: '2026-05-31 08:00' },
];

export default function AdminMarketSituationSourcesPage() {
  return (
    <PageLayout className="bg-[var(--bg)]">
      <PageContent className="space-y-6">
        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-[var(--text-primary)]">信号来源</h1>
              <p className="text-sm text-[var(--text-secondary)]">管理市场信号的采集来源</p>
            </div>
            <Button size="sm">添加来源</Button>
          </div>
        </section>

        <section className="space-y-4">
          {mockSources.map(source => (
            <div key={source.id} className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-[var(--text-primary)]">{source.name}</h3>
                    <Badge className="bg-[var(--surface-container-low)] text-[var(--text-secondary)]">{source.type}</Badge>
                    <Badge className={source.isActive ? 'bg-success-50 text-success-700' : 'bg-gray-50 text-gray-700'}>
                      {source.isActive ? '已启用' : '已禁用'}
                    </Badge>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">URL: {source.url}</p>
                  <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
                    <span>信号数: {source.signalsCount}</span>
                    <span>最后同步: {source.lastSyncAt}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">编辑</Button>
                  <Button size="sm" variant="outline">同步</Button>
                  <Button size="sm" variant="outline">{source.isActive ? '禁用' : '启用'}</Button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </PageContent>
    </PageLayout>
  );
}
