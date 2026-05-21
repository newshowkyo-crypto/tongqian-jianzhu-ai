'use client';

import { apiClient } from '@tongqian/api-client';
import {
  AiAssistantBubble,
  CyberShell,
  FileSearch,
  MessageSquare,
  Settings,
  Shield,
  UserCheck,
  Wallet,
  type AiAssistantWidgetMessage,
  type CyberShellNavigationItem,
} from '@tongqian/ui';
import type { CyberHeroProps } from '@tongqian/ui/cyber';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { zhCN } from './i18n/zh-CN';

const iconMap = {
  audit: FileSearch,
  billing: Wallet,
  credentials: Shield,
  models: Settings,
  operations: UserCheck,
  prompts: MessageSquare,
  rules: Shield,
};

const navigationItems: CyberShellNavigationItem[] = zhCN.navigation.items.map((item) => ({
  href: item.href,
  icon: item.icon,
  label: item.label,
}));
const cyberImportCheck: CyberHeroProps['className'] = 'admin-cyber-shell';
void cyberImportCheck;

function PermissionsPanel(): ReactNode {
  return (
    <aside className="hidden rounded-lg border border-[var(--border-silver)] bg-[var(--bg-glass)] p-4 shadow-card xl:block">
      <h2 className="text-base font-semibold text-white">{zhCN.permissions.title}</h2>
      <div className="mt-4 space-y-3">
        {zhCN.permissions.items.map((item) => (
          <label key={item.key} className="flex items-center justify-between gap-3 rounded-md border border-[var(--border-silver)] px-3 py-2 text-sm">
            <span>{item.label}</span>
            <input
              aria-label={item.label}
              className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-[rgba(181,188,200,0.35)] transition-colors checked:bg-[var(--accent-rose)] before:block before:h-5 before:w-5 before:rounded-full before:bg-[var(--bg-glass)] before:shadow-sm before:transition-transform checked:before:translate-x-4"
              defaultChecked={item.enabled}
              type="checkbox"
            />
          </label>
        ))}
      </div>
    </aside>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublic = pathname === '/login' || pathname === '/forbidden';

  if (isPublic) {
    return <>{children}</>;
  }

  const current = navigationItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

  async function sendAssistantMessage(messages: AiAssistantWidgetMessage[]) {
    const reply = await apiClient.ai.chat(messages, 'admin.prompt_test');
    return {
      buttons: reply.buttons.slice(0, 5),
      confidence: reply.confidence,
      content: reply.message.content,
      tier: reply.tier,
    };
  }

  return (
    <CyberShell
      actionLabels={{
        avatar: zhCN.home.title.slice(0, 1),
        avatarTitle: zhCN.home.title,
        notifications: zhCN.navigation.notifications,
        tenant: zhCN.navigation.tenant,
        tenantTitle: zhCN.home.title,
        theme: zhCN.navigation.theme,
      }}
      assistant={<AiAssistantBubble onSend={sendAssistantMessage} role="admin" />}
      brand={{ eyebrow: 'OPC console', href: '/', title: zhCN.home.title }}
      currentLabel={current?.label}
      currentPath={pathname}
      homeLabel={zhCN.navigation.home}
      iconMap={iconMap}
      navigation={navigationItems}
      rightPanel={<PermissionsPanel />}
      searchPlaceholder={zhCN.navigation.search}
    >
      {children}
    </CyberShell>
  );
}
