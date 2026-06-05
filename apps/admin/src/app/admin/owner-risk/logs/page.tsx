'use client';

import { PageContent, PageLayout } from '@tongqian/ui';

export default function AdminOwnerRiskLogsPage() {
  return (
    <PageLayout className="bg-[var(--bg)]">
      <PageContent className="space-y-6">
        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">操作日志</h1>
            <p className="text-sm text-[var(--text-secondary)]">查看企业主风险雷达的所有操作记录</p>
          </div>
        </section>

        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)]">
          <div className="rounded-lg border border-dashed border-[var(--outline-variant)] p-12 text-center">
            <p className="text-sm text-[var(--text-secondary)]">操作日志即将接入</p>
            <p className="mt-1 text-xs text-[var(--text-tertiary)]">上线后此处展示解锁、分析、报告生成、复核等操作的实时审计日志（含点数消耗与成功/失败状态）。</p>
          </div>
        </section>
      </PageContent>
    </PageLayout>
  );
}
