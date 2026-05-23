'use client';

import { apiClient } from '@tongqian/api-client';
import {
  CyberAiOrb,
  Building2,
  CyberShell,
  FileSearch,
  Megaphone,
  MessageSquare,
  Shield,
  Wallet,
  type CyberChatPanelProps,
  type CyberShellNavigationItem,
} from '@tongqian/ui';
import type { CyberHeroProps } from '@tongqian/ui/cyber';
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
const cyberImportCheck: CyberHeroProps['className'] = 'gov-cyber-shell';
void cyberImportCheck;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublic = pathname === '/login' || pathname === '/forbidden';

  if (isPublic) {
    return <>{children}</>;
  }

  const current = navigationItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

  const currentContext: CyberChatPanelProps['currentContext'] = { module: 'dashboard', pathname, resourceId: pathname.split('/').filter(Boolean).at(1) };
  async function sendAssistantMessage(input: Parameters<NonNullable<CyberChatPanelProps['onSend']>>[0]) {
    const reply = await apiClient.aiGateway.invoke({ taskType: 'chat.policy', context: { ...input.context, recentMessages: input.messages.slice(-3) }, userInput: input.userInput });
    return {
      confidence: 'medium' as const,
      content: reply.text ?? reply.summary ?? '已读取政企上下文。',
      tier: 2 as const,
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
      assistant={<CyberAiOrb currentContext={currentContext} onConvert={async (targetTask) => { await apiClient.chatHub.convert('latest', targetTask); }} onSend={sendAssistantMessage} />}
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
