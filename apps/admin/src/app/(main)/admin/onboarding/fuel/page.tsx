'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { type ReactNode } from 'react';

import { zhCN } from '../../../../../i18n/zh-CN';

interface FuelSection {
  byCategory?: Record<string, number>;
  byTaskType?: Record<string, number>;
  byType?: Record<string, number>;
  current: number;
  target: number;
}

interface FuelProgress {
  goldenTests: FuelSection & { passRate: number };
  knowledge: FuelSection;
  overallReadiness: number;
  rules: FuelSection & { pendingReview: number };
  timeline: Array<{ at: string; event: string }>;
}

async function requestJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(await response.text());
  return (await response.json()) as T;
}

export default function FuelOnboardingPage(): ReactNode {
  const copy = zhCN.fuelOnboarding;
  const query = useQuery({ queryFn: () => requestJson<FuelProgress>('/api/v1/admin/fuel-progress'), queryKey: ['admin', 'fuel-progress'] });
  const data = query.data;
  const cards = data
    ? [
        { href: '/admin/rules', key: 'rules', section: data.rules, sop: '/admin/onboarding/sop/rules' },
        { href: '/admin/knowledge', key: 'knowledge', section: data.knowledge, sop: '/admin/onboarding/sop/knowledge' },
        { href: '/admin/golden-tests', key: 'goldenTests', section: data.goldenTests, sop: '/admin/onboarding/sop/golden-tests' },
      ]
    : [];

  return (
    <section className="space-y-6 text-white">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{copy.title}</h1>
        <p className="text-sm text-[var(--text-secondary)]">{copy.description}</p>
      </header>
      <div className="rounded-md border border-[var(--border-silver)] bg-white/5 p-4">
        <div className="flex items-center justify-between gap-4">
          <span>{copy.overall}</span>
          <strong>{data?.overallReadiness ?? 0}%</strong>
        </div>
        <div className="mt-4 h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-[var(--accent-gold)]" style={{ width: `${data?.overallReadiness ?? 0}%` }} /></div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {cards.map((card) => (
          <section className="space-y-4 rounded-md border border-[var(--border-silver)] bg-white/5 p-4" key={card.key}>
            <h2 className="text-lg font-semibold">{copy.cards[card.key as keyof typeof copy.cards]}</h2>
            <div className="text-3xl font-semibold">{card.section.current}/{card.section.target}</div>
            <div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-emerald-400" style={{ width: `${Math.min(100, Math.round((card.section.current / card.section.target) * 100))}%` }} /></div>
            <div className="space-y-2 text-sm text-[var(--text-secondary)]">
              {Object.entries(card.section.byCategory ?? card.section.byType ?? card.section.byTaskType ?? {}).map(([key, value]) => <div className="flex justify-between" key={key}><span>{key}</span><span>{value}</span></div>)}
            </div>
            <div className="flex gap-4">
              <Link className="rounded-md bg-[var(--accent-gold)] px-4 py-2 text-sm text-black" href={card.href}>{copy.go}</Link>
              <Link className="rounded-md border border-[var(--border-silver)] px-4 py-2 text-sm" href={card.sop}>{copy.sop}</Link>
            </div>
          </section>
        ))}
      </div>
      <section className="rounded-md border border-[var(--border-silver)] bg-white/5 p-4">
        <h2 className="text-lg font-semibold">{copy.timeline}</h2>
        <div className="mt-4 space-y-4 text-sm text-[var(--text-secondary)]">
          {(data?.timeline ?? []).map((item) => <div className="flex justify-between gap-4" key={`${item.at}-${item.event}`}><span>{item.event}</span><span>{item.at}</span></div>)}
        </div>
      </section>
    </section>
  );
}
