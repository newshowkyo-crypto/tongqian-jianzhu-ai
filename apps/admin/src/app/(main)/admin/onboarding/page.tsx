'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { type ReactNode } from 'react';

import { zhCN } from '../../../../i18n/zh-CN';

interface Summary {
  ready: boolean;
  readyCount: number;
  steps: Array<{ href: string; key: keyof typeof zhCN.launchOnboarding.steps; ready: boolean; value: number }>;
  total: number;
}

async function requestJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(await response.text());
  return (await response.json()) as T;
}

export default function LaunchOnboardingPage(): ReactNode {
  const copy = zhCN.launchOnboarding;
  const query = useQuery({ queryFn: () => requestJson<Summary>('/api/v1/admin/onboarding/summary'), queryKey: ['admin', 'onboarding-summary'] });
  const summary = query.data;

  return (
    <section className="space-y-6 text-white">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{copy.title}</h1>
        <p className="text-sm text-[var(--text-secondary)]">{copy.description}</p>
      </header>
      {summary?.ready ? <div className="rounded-md border border-emerald-300/60 bg-emerald-500/15 p-4 text-lg font-semibold">{copy.completed}</div> : null}
      <div className="grid gap-4 md:grid-cols-3">
        {(summary?.steps ?? []).map((step) => (
          <section className={`rounded-md border p-4 ${step.ready ? 'border-emerald-300/60 bg-emerald-500/15' : 'border-[var(--border-silver)] bg-white/5'}`} key={step.key}>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">{copy.steps[step.key]}</h2>
              <span>{step.value}%</span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-[var(--accent-gold)]" style={{ width: `${step.value}%` }} /></div>
            <Link className="mt-4 inline-flex rounded-md border border-[var(--border-silver)] px-4 py-2 text-sm" href={step.href}>{copy.action}</Link>
          </section>
        ))}
      </div>
    </section>
  );
}
