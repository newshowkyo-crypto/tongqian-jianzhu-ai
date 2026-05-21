'use client';

import { apiClient } from '@tongqian/api-client';
import {
  AiAssistantBubble,
  Award,
  CyberShell,
  FileSearch,
  Radar,
  Settings,
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
  dispatch: Radar,
  earnings: Wallet,
  reputation: Award,
  reports: FileSearch,
  settings: Settings,
  workspace: UserCheck,
};

const navigationItems: CyberShellNavigationItem[] = zhCN.navigation.items.map((item) => ({
  href: item.href,
  icon: item.icon,
  label: item.label,
}));
const cyberImportCheck: CyberHeroProps['className'] = 'agent-cyber-shell';
void cyberImportCheck;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublic = pathname === '/login' || pathname === '/forbidden';

  if (isPublic) {
    return <>{children}</>;
  }

  const current = navigationItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

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
    <CyberShell
      actionLabels={{
        avatar: zhCN.brand.agent.slice(0, 1),
        avatarTitle: zhCN.brand.agent,
        notifications: zhCN.navigation.notifications,
        tenant: zhCN.navigation.tenant,
        tenantTitle: zhCN.brand.workspace,
        theme: zhCN.navigation.theme,
      }}
      assistant={<AiAssistantBubble onSend={sendAssistantMessage} role="steward" />}
      brand={{ eyebrow: zhCN.brand.name, href: '/dispatch', title: zhCN.brand.workspace }}
      currentLabel={current?.label}
      currentPath={pathname}
      homeLabel={zhCN.navigation.home}
      iconMap={iconMap}
      navigation={navigationItems}
      searchPlaceholder={zhCN.navigation.search}
      tabs={[...zhCN.navigation.tabs]}
    >
      {children}
    </CyberShell>
  );
}
