'use client';

import { Button, EmptyState, PageContent, PageLayout } from '@tongqian/ui';

export default function AdminMarketSituationSignalsPage() {
  return (
    <PageLayout className="bg-[var(--bg)]">
      <PageContent className="space-y-6">
        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-[var(--text-primary)]">信号管理</h1>
              <p className="text-sm text-[var(--text-secondary)]">管理所有市场信号</p>
            </div>
            <Button size="sm" disabled title="信号管理即将上线">添加信号</Button>
          </div>
        </section>

        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-6">
          <EmptyState
            title="信号管理即将接入"
            description="上线后此处展示全部市场信号，支持按类型/地区/风险筛选、发布与下架、Tier 与解锁点数配置。"
          />
        </section>
      </PageContent>
    </PageLayout>
  );
}
