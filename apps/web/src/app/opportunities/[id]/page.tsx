'use client';

import { apiClient, type OpportunityDetail } from '@tongqian/api-client';
import { Badge, buttonVariants, Button, CyberRing, LoadingState, PageContent, PageLayout, SectionCard } from '@tongqian/ui';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const demoFallback = 'opp-wuhan-metro';
const guideButtons = ['加入跟进', '申请智能管家', '申请同乾方略', '人工复核'];

export default function OpportunityDetailPage({ params }: { params: { id: string } }) {
  const [detail, setDetail] = useState<OpportunityDetail | null>(null);

  useEffect(() => {
    let mounted = true;
    apiClient.opportunity.get(params.id || demoFallback).then((next) => {
      if (mounted) setDetail(next);
    });
    return () => {
      mounted = false;
    };
  }, [params.id]);

  if (!detail) {
    return (
      <PageLayout>
        <PageContent>
          <LoadingState label="正在加载机会详情" />
        </PageContent>
      </PageLayout>
    );
  }

  const ownerVerification = detail.ownerVerification;
  const peerRadar = detail.peerRadar;
  const recommendedPrice = detail.recommendedPrice;
  const ownerRows = [
    ['工商信息', ownerVerification.businessInfo],
    ['历史项目数', `${ownerVerification.historyProjects} 个`],
    ['投诉记录', `${ownerVerification.complaints} 条`],
    ['关联企业', ownerVerification.relatedCompanies.join(' / ')],
    ['信用风险', ownerVerification.risk],
  ];

  return (
    <PageLayout className="bg-[var(--bg)]">
      <PageContent className="space-y-6">
        <section className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[1fr_180px] lg:items-center">
            <div className="space-y-4">
              <Badge className="bg-[var(--surface-container-low)] text-[var(--primary)]">机会雷达 / {detail.region}</Badge>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold leading-9 text-[var(--text-primary)]">{detail.title}</h1>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  业主：{detail.owner} · 金额：{detail.amount} · 截止：{detail.deadline}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-[var(--text-secondary)]">
                <Badge>Tier {detail.tier}</Badge>
                <Badge>confidence: {detail.confidence}</Badge>
                <Badge>traceId: {detail.traceId}</Badge>
              </div>
            </div>
            <CyberRing className="mx-auto h-40 w-40" max={100} value={detail.matchScore} />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            ['可投性', `${detail.matchScore} 分`],
            ['业主真假', ownerVerification.risk],
            ['同行竞争', `${peerRadar.winners} 家`],
            ['推荐报价', recommendedPrice.sweet],
          ].map(([label, value]) => (
            <article key={label} className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4 shadow-sm">
              <p className="text-sm text-[var(--text-secondary)]">{label}</p>
              <p className="mt-2 text-xl font-semibold text-[var(--text-primary)]">{value}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <SectionCard title="业主真实性核验">
            <div className="grid gap-4">
              {ownerRows.map(([label, value]) => (
                <div key={label} className="rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4">
                  <p className="text-xs text-[var(--text-secondary)]">{label}</p>
                  <p className="mt-1 text-sm font-medium leading-6 text-[var(--text-primary)]">{value}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="同行雷达">
            <div className="grid gap-4">
              {[
                ['近 6 个月中标企业', `${peerRadar.winners} 家`],
                ['平均报价', peerRadar.avgBid],
                ['中位数报价', peerRadar.medianBid],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4">
                  <span className="text-sm text-[var(--text-secondary)]">{label}</span>
                  <strong className="text-sm text-[var(--text-primary)]">{value}</strong>
                </div>
              ))}
            </div>
          </SectionCard>
        </section>

        <SectionCard title="推荐报价区间" description={recommendedPrice.reasoning}>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['最低保命价', recommendedPrice.floor],
              ['最佳竞争价', recommendedPrice.sweet],
              ['报价上限', recommendedPrice.ceiling],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4">
                <p className="text-xs text-[var(--text-secondary)]">{label}</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--accent-rose)]">{value}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="关键时间表">
          <div className="grid gap-4 md:grid-cols-4">
            {detail.timeline.map((item) => (
              <div key={item.milestone} className="rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{item.milestone}</p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{item.date}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <section className="flex flex-wrap gap-4 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
          <Link className={buttonVariants({ variant: 'primary' })} href={`/tenders/new?opp=${detail.id}`}>立即投标</Link>
          {guideButtons.map((label) => <Button key={label} variant="outline">{label}</Button>)}
        </section>

        <p className="text-xs leading-5 text-[var(--text-secondary)]">{detail.disclaimer}</p>
      </PageContent>
    </PageLayout>
  );
}
