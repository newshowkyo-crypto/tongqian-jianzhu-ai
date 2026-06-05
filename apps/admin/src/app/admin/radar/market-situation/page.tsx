'use client';

import { Badge, PageContent, PageLayout } from '@tongqian/ui';
import Link from 'next/link';

export default function AdminMarketSituationPage() {
  return (
    <PageLayout className="bg-[var(--bg)]">
      <PageContent className="space-y-6">
        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="space-y-4">
            <Badge className="bg-[var(--primary)] text-white">企业管理</Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold leading-9 text-[var(--text-primary)]">AI 市场态势雷达</h1>
              <p className="text-sm text-[var(--text-secondary)]">管理市场信号、模拟分析和态势报告</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            ['总信号数', '256', '+15%'],
            ['今日新增', '8', '+3'],
            ['高机会信号', '45', '值得把握'],
            ['总收入(点)', '12,800', '+8%'],
          ].map(([label, value, trend]) => (
            <article key={label} className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
              <p className="text-sm text-[var(--text-secondary)]">{label}</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{value}</p>
              <p className="mt-2 text-xs text-success-700">{trend}</p>
            </article>
          ))}
        </section>

        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
          <h2 className="text-lg font-medium text-[var(--text-primary)]">功能模块</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              { title: '数据概览', href: '/admin/radar/market-situation/dashboard', desc: '查看信号数据和统计' },
              { title: '信号管理', href: '/admin/radar/market-situation/signals', desc: '管理市场信号' },
              { title: '信号来源', href: '/admin/radar/market-situation/sources', desc: '配置信号来源' },
              { title: '分类配置', href: '/admin/radar/market-situation/categories', desc: '配置信号分类' },
              { title: '导入管理', href: '/admin/radar/market-situation/imports', desc: '批量导入信号' },
              { title: '待审核', href: '/admin/radar/market-situation/review', desc: '审核待发布信号' },
              { title: '规则配置', href: '/admin/radar/market-situation/rules', desc: '配置生成规则' },
              { title: '模拟分析', href: '/admin/radar/market-situation/simulations', desc: '查看和管理模拟' },
              { title: '点数配置', href: '/admin/radar/market-situation/points', desc: '配置点数消耗' },
              { title: 'Prompt 管理', href: '/admin/radar/market-situation/prompts', desc: '管理 AI Prompt' },
              { title: '操作日志', href: '/admin/radar/market-situation/logs', desc: '查看操作日志' },
            ].map(item => (
              <Link key={item.title} href={item.href}>
                <div className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4 hover:bg-[var(--surface-container-low)]">
                  <h3 className="font-medium text-[var(--text-primary)]">{item.title}</h3>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </PageContent>
    </PageLayout>
  );
}
