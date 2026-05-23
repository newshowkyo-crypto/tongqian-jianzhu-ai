'use client';

import { apiClient } from '@tongqian/api-client';
import {
  AiAssistantBubble,
  Building2,
  CyberShell,
  FileSearch,
  Megaphone,
  MessageSquare,
  Shield,
  Wallet,
  type AiAssistantWidgetMessage,
  type CyberShellNavigationItem,
} from '@tongqian/ui';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { zhCN } from './i18n/zh-CN';

const iconMap = {
  consult: MessageSquare,
  docs: FileSearch,
  funds: Wallet,
  policy: Shield,
  projects: Building2,
  sourcing: Megaphone,
};

const navigationItems: CyberShellNavigationItem[] = zhCN.navigation.items.map((item) => ({
  href: item.href,
  icon: item.icon,
  label: item.label,
}));

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublic = pathname === '/login' || pathname === '/forbidden';

  if (isPublic) {
    return <>{children}</>;
  }

  const current = navigationItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

  async function sendAssistantMessage(messages: AiAssistantWidgetMessage[]) {
    const reply = await apiClient.ai.chat(messages, 'gov.policy_impact');
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
        avatar: zhCN.home.eyebrow.slice(0, 1),
        avatarTitle: zhCN.home.eyebrow,
        notifications: zhCN.navigation.notifications,
        tenant: zhCN.navigation.tenant,
        tenantTitle: zhCN.home.title,
        theme: zhCN.navigation.theme,
      }}
      assistant={<AiAssistantBubble onSend={sendAssistantMessage} role="gov" />}
      brand={{ eyebrow: zhCN.home.eyebrow, href: '/', title: zhCN.home.title }}
      currentLabel={current?.label}
      currentPath={pathname}
      homeLabel={zhCN.navigation.home}
      iconMap={iconMap}
      navigation={navigationItems}
      searchPlaceholder={zhCN.navigation.search}
    >
      {children}
    </CyberShell>
  );
}
