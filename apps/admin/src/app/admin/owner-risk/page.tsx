'use client';

import { Badge, PageContent, PageLayout } from '@tongqian/ui';
import Link from 'next/link';
import { useState } from 'react';

export default function AdminOwnerRiskPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <PageLayout className="bg-[var(--bg)]">
      <PageContent className="space-y-6">
        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="space-y-4">
            <Badge className="bg-[var(--primary)] text-white">企业管理</Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold leading-9 text-[var(--text-primary)]">企业主风险雷达</h1>
              <p className="text-sm text-[var(--text-secondary)]">管理企业主风险分析功能</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            ['总分析次数', '156', '+12%'],
            ['今日新增', '8', '+3'],
            ['高风险档案', '12', '需关注'],
            ['总收入(点)', '8,500', '+5%'],
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
              { title: '数据概览', href: '/admin/owner-risk/dashboard', desc: '查看分析数据和统计' },
              { title: '规则配置', href: '/admin/owner-risk/rules', desc: '配置风险分析规则' },
              { title: '卡片管理', href: '/admin/owner-risk/cards', desc: '管理风险展示卡片' },
              { title: '担保分析', href: '/admin/owner-risk/guarantees', desc: '管理担保分析配置' },
              { title: '混同风险', href: '/admin/owner-risk/mixing', desc: '管理混同风险配置' },
              { title: '交易对手', href: '/admin/owner-risk/counterparties', desc: '管理对手风险配置' },
              { title: '应收账款', href: '/admin/owner-risk/receivables', desc: '管理应收风险配置' },
              { title: '报告管理', href: '/admin/owner-risk/reports', desc: '查看和管理报告' },
              { title: '顾问复核', href: '/admin/owner-risk/reviews', desc: '处理顾问复核请求' },
              { title: '免责声明', href: '/admin/owner-risk/disclaimers', desc: '管理免责声明' },
              { title: '点数配置', href: '/admin/owner-risk/points', desc: '配置点数消耗' },
              { title: 'Prompt 管理', href: '/admin/owner-risk/prompts', desc: '管理 AI Prompt' },
              { title: '操作日志', href: '/admin/owner-risk/logs', desc: '查看操作日志' },
              { title: '合规配置', href: '/admin/owner-risk/compliance', desc: '合规拦截配置' },
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
