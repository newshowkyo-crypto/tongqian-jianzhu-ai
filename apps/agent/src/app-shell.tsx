'use client';

import { apiClient } from '@tongqian/api-client';
import { AiAssistantWidget, Award, Bell, Command, FileSearch, Radar, Settings, UserCheck, Wallet, type AiAssistantWidgetMessage } from '@tongqian/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { zhCN } from './i18n/zh-CN';

const icons = {
  dispatch: Radar,
  earnings: Wallet,
  reputation: Award,
  reports: FileSearch,
  settings: Settings,
  workspace: UserCheck,
} as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublic = pathname === '/login' || pathname === '/forbidden';

  if (isPublic) {
    return <>{children}</>;
  }

  const current = zhCN.navigation.items.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

  async function sendAssistantMessage(messages: AiAssistantWidgetMessage[]) {
    const reply = await apiClient.ai.chat(messages, 'agent.assistant_reply');
    return {
      buttons: reply.buttons.slice(0, 3),
      confidence: reply.confidence,
      content: reply.message.content,
      tier: reply.tier,
    };
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center border-b border-neutral-200 bg-white px-4 shadow-sm lg:pl-72">
        <div className="flex w-full items-center gap-3">
          <Command placeholder={zhCN.navigation.search} />
          <button className="hidden h-10 rounded-md border border-neutral-300 px-3 text-sm text-neutral-700 sm:block" type="button">
            {zhCN.navigation.tenant}
          </button>
          <button aria-label={zhCN.navigation.notifications} className="grid h-10 w-10 place-items-center rounded-md border border-neutral-300" type="button">
            <Bell className="h-5 w-5" />
          </button>
          <button className="h-10 rounded-md border border-neutral-300 px-3 text-sm" type="button">{zhCN.navigation.theme}</button>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-50 text-sm font-semibold text-primary-700">管</span>
        </div>
      </header>

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r border-neutral-200 bg-white p-4 lg:block">
        <Link className="block rounded-lg bg-gradient-to-r from-primary-700 to-steward-mid p-4 text-white shadow-steward" href="/dispatch">
          <p className="text-sm font-medium text-accent-50">{zhCN.brand.name}</p>
          <p className="mt-1 text-base font-semibold">{zhCN.brand.workspace}</p>
        </Link>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {zhCN.navigation.tabs.map((tab) => (
            <button key={tab} className="h-9 rounded-md border border-neutral-200 bg-neutral-50 text-xs font-medium text-neutral-700" type="button">{tab}</button>
          ))}
        </div>
        <nav className="mt-4 space-y-1">
          {zhCN.navigation.items.map((item) => {
            const Icon = icons[item.icon];
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium ${active ? 'bg-primary-50 text-primary-700' : 'text-neutral-700 hover:bg-neutral-100'}`} href={item.href}>
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <details className="fixed left-4 top-3 z-50 lg:hidden">
        <summary className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-md border border-neutral-300 bg-white shadow-sm">☰</summary>
        <nav className="mt-2 w-64 rounded-lg border border-neutral-200 bg-white p-3 shadow-md">
          {zhCN.navigation.items.map((item) => {
            const Icon = icons[item.icon];
            return <Link key={item.href} className="flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-neutral-700" href={item.href}><Icon className="h-4 w-4" />{item.label}</Link>;
          })}
        </nav>
      </details>

      <main className="px-4 pb-8 pt-20 lg:pl-72 lg:pr-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 text-sm text-neutral-500">
            <Link className="text-primary-600" href="/dispatch">{zhCN.navigation.home}</Link>
            <span className="px-2">/</span>
            <span>{current?.label ?? zhCN.navigation.current}</span>
          </div>
          {children}
        </div>
      </main>
      <AiAssistantWidget label={zhCN.chat.title} onSend={sendAssistantMessage} placeholder={zhCN.chat.input} roleLabel={zhCN.brand.agent} />
    </div>
  );
}
